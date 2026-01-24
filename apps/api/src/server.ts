import Fastify from 'fastify';
import routes from './plugins/routes';

export function buildServer() {
  const app = Fastify({ logger: true });

  // register all routes
  app.register(routes);

  return app;
}
