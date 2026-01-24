import { FastifyInstance } from 'fastify';
import { getProjects } from './projects.service';
import { projectSchema } from './projects.schema';

export async function projectsRoutes(app: FastifyInstance) {
  app.get('/projects', { schema: projectSchema }, async () => {
    return getProjects();
  });
}
