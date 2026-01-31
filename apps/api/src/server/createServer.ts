import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';

import { registerApis } from './registerApis.js';

export function createServer() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    credentials: true,
    origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
      if (!origin) {
        cb(null, true);
        return;
      }

      const configuredOrigins = process.env.CORS_ORIGIN?.trim();
      if (configuredOrigins) {
        if (configuredOrigins === '*') {
          cb(null, true);
          return;
        }
        const allowList = configuredOrigins
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
        cb(null, allowList.includes(origin));
        return;
      }

      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        cb(null, isLocalhost);
      } catch {
        cb(null, false);
      }
    },
  });

  app.register(cookie, {
    secret: process.env.AUTH_SESSION_SECRET ?? 'dev-secret',
  });

  // Register API protocols (tRPC now; REST/GraphQL later)
  app.register(async (instance) => {
    await registerApis(instance);
  });

  return app;
}
