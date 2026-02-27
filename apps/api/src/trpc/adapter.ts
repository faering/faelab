import type { FastifyInstance } from 'fastify';

import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

import { createTRPCContext } from './context.js';
import { appRouter } from './router.js';

export async function registerTrpc(app: FastifyInstance) {
  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: createTRPCContext,
    },
  });
}
