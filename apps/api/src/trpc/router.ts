import { router } from './init.js';
import { projectsRouter } from './routers/projects.js';

export const appRouter = router({
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
