import { TRPCError } from '@trpc/server';

import {
  CreateProjectInputSchema,
  DeleteProjectInputSchema,
  ProjectSchema,
  UpdateProjectInputSchema,
} from '@portfolio/types';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '../../modules/projects/service.js';
import { publicProcedure, router } from '../init.js';

export const projectsRouter = router({
  list: publicProcedure.output(ProjectSchema.array()).query(async () => {
    return listProjects();
  }),

  create: publicProcedure
    .input(CreateProjectInputSchema)
    .output(ProjectSchema)
    .mutation(async ({ input }) => {
      try {
        return await createProject(input);
      } catch (err: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: err?.message ?? 'Failed to create project',
        });
      }
    }),

  update: publicProcedure
    .input(UpdateProjectInputSchema)
    .output(ProjectSchema)
    .mutation(async ({ input }) => {
      const updated = await updateProject(input.id, input.data);
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      return updated;
    }),

  delete: publicProcedure
    .input(DeleteProjectInputSchema)
    .output(DeleteProjectInputSchema)
    .mutation(async ({ input }) => {
      const ok = await deleteProject(input.id);
      if (!ok) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      return input;
    }),
});
