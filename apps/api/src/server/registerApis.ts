import type { FastifyInstance } from 'fastify';

import { registerTrpc } from '../trpc/adapter.js';

export async function registerApis(app: FastifyInstance) {
  await registerTrpc(app);
}
