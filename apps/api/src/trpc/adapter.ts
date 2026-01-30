import type { FastifyInstance } from 'fastify';

import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

import { createTRPCContext } from './context';
import { appRouter } from './router';

export async function registerTrpc(app: FastifyInstance) {
  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: createTRPCContext,
    },
  });
}
