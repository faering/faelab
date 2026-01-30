import Fastify from 'fastify';

import { registerApis } from './registerApis.js';

export function createServer() {
  const app = Fastify({ logger: true });

  // Register API protocols (tRPC now; REST/GraphQL later)
  app.register(async (instance) => {
    await registerApis(instance);
  });

  return app;
}
