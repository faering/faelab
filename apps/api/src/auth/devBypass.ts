import type { AdminSession } from './sessionStore.js';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function isDevBypassEnabled() {
  if (process.env.NODE_ENV === 'production') return false;
  const raw = (process.env.AUTH_DEV_BYPASS ?? '').trim().toLowerCase();
  return TRUE_VALUES.has(raw);
}

export function getDevSession(): AdminSession {
  const login = process.env.AUTH_DEV_BYPASS_LOGIN?.trim() || 'dev-admin';
  const now = Date.now();
  return {
    id: 'dev-bypass',
    userId: 'dev-bypass',
    githubId: 0,
    login,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };
}
