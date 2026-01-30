import { router } from './init';
import { projectsRouter } from './routers/projects';

export const appRouter = router({
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
