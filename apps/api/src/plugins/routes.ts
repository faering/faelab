import fp from 'fastify-plugin';
import { projectsRoutes } from '../modules/projects/projects.routes';

export default fp(async (app) => {
  await app.register(projectsRoutes, { prefix: '/api' });
});
