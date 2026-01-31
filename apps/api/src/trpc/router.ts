// This file holds the main TRPC router combining all sub-routers
import { router } from './init.js';
import { projectsRouter } from './routers/projects.js';
import { siteContentRouter } from './routers/siteContent.js';

export const appRouter = router({
  projects: projectsRouter,
  siteContent: siteContentRouter,
});

export type AppRouter = typeof appRouter;
