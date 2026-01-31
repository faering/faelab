import '@fastify/cookie';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { getDevSession, isDevBypassEnabled } from './devBypass.js';
import { createSession, deleteSession, getSession } from './sessionStore.js';
import { upsertUserFromGitHub } from './userStore.js';

const SESSION_COOKIE = 'admin_session';
const STATE_COOKIE = 'oauth_state';

const DEFAULT_SUCCESS_REDIRECT = 'http://localhost:5173/projects';
const DEFAULT_FAILURE_REDIRECT = 'http://localhost:5173/projects?auth=failed';
const DEFAULT_CALLBACK_URL = 'http://localhost:3001/auth/github/callback';

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
  };
}

function getSessionTtlMs() {
  const days = Number(process.env.AUTH_SESSION_TTL_DAYS ?? '7');
  const safeDays = Number.isFinite(days) && days > 0 ? days : 7;
  return safeDays * 24 * 60 * 60 * 1000;
}

function getAllowedAdmin() {
  const allowedLogin = process.env.AUTH_ALLOWED_GITHUB_LOGIN?.trim().toLowerCase();
  const allowedIdRaw = process.env.AUTH_ALLOWED_GITHUB_ID?.trim();
  const allowedId = allowedIdRaw ? Number(allowedIdRaw) : undefined;
  return { allowedLogin, allowedId };
}

function isAllowedAdmin(user: { id: number; login: string }) {
  const { allowedLogin, allowedId } = getAllowedAdmin();
  if (!allowedLogin && !allowedId) return false;
  if (allowedId && user.id === allowedId) return true;
  if (allowedLogin && user.login.toLowerCase() === allowedLogin) return true;
  return false;
}

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('GitHub OAuth env vars missing');

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`);
  }

  const payload = (await response.json()) as { access_token?: string; token_type?: string; error?: string };
  if (!payload.access_token) throw new Error(payload.error ?? 'Missing access token');
  return payload.access_token;
}

async function fetchGitHubUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'portfolio-api',
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed: ${response.status}`);
  }

  const user = (await response.json()) as { id: number; login: string; name?: string | null };
  if (!user?.id || !user?.login) throw new Error('Invalid GitHub user response');
  return user;
}

function redirectTo(reply: FastifyReply, url: string) {
  reply.redirect(url);
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get('/auth/github/login', async (_req, reply) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      reply.code(500).send({ error: 'GitHub OAuth not configured' });
      return;
    }

    const state = crypto.randomUUID();
    reply.setCookie(STATE_COOKIE, state, getCookieOptions());

    const callbackUrl = process.env.GITHUB_CALLBACK_URL ?? DEFAULT_CALLBACK_URL;
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', 'read:user');

    redirectTo(reply, url.toString());
  });

  app.get(
    '/auth/github/callback',
    async (req: FastifyRequest<{ Querystring: { code?: string; state?: string } }>, reply) => {
      const { code, state } = req.query;
      const storedState = req.cookies?.[STATE_COOKIE];
      const failureRedirect = process.env.AUTH_FAILURE_REDIRECT ?? DEFAULT_FAILURE_REDIRECT;

      if (!code || !state || !storedState || state !== storedState) {
        redirectTo(reply, failureRedirect);
        return;
      }

      try {
        const callbackUrl = process.env.GITHUB_CALLBACK_URL ?? DEFAULT_CALLBACK_URL;
        const accessToken = await exchangeCodeForToken(code, callbackUrl);
        const user = await fetchGitHubUser(accessToken);

        if (!isAllowedAdmin(user)) {
          redirectTo(reply, failureRedirect);
          return;
        }

        const dbUser = await upsertUserFromGitHub({
          githubId: user.id,
          githubLogin: user.login,
          displayName: user.name ?? null,
        });

        const session = await createSession(
          {
            userId: dbUser.id,
            githubId: user.id,
            login: user.login,
          },
          getSessionTtlMs(),
        );
        reply.clearCookie(STATE_COOKIE, getCookieOptions());
        reply.setCookie(SESSION_COOKIE, session.id, {
          ...getCookieOptions(),
          maxAge: getSessionTtlMs() / 1000,
        });

        const successRedirect = process.env.AUTH_SUCCESS_REDIRECT ?? DEFAULT_SUCCESS_REDIRECT;
        redirectTo(reply, successRedirect);
      } catch {
        redirectTo(reply, failureRedirect);
      }
    }
  );

  app.get('/auth/me', async (req, reply) => {
    if (isDevBypassEnabled()) {
      const session = getDevSession();
      reply.send({
        authenticated: true,
        user: {
          login: session.login,
          id: session.githubId,
        },
        bypass: true,
      });
      return;
    }

    const sessionId = req.cookies?.[SESSION_COOKIE];
    const session = await getSession(sessionId);

    if (!session) {
      reply.code(401).send({ authenticated: false });
      return;
    }

    reply.send({
      authenticated: true,
      user: {
        login: session.login,
        id: session.githubId,
      },
    });
  });

  app.post('/auth/logout', async (req, reply) => {
    if (isDevBypassEnabled()) {
      reply.send({ ok: true, bypass: true });
      return;
    }

    const sessionId = req.cookies?.[SESSION_COOKIE];
    await deleteSession(sessionId);
    reply.clearCookie(SESSION_COOKIE, getCookieOptions());
    reply.send({ ok: true });
  });
}
