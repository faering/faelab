import type { FastifyInstance } from 'fastify';

import { registerAuthRoutes } from '../auth/routes.js';
import { registerTrpc } from '../trpc/adapter.js';

export async function registerApis(app: FastifyInstance) {
  await registerAuthRoutes(app);
  await registerTrpc(app);
}
