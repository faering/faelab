import { TRPCError } from '@trpc/server';

import {
  CreateVideoInputSchema,
  DeleteVideoInputSchema,
  VideoSchema,
  UpdateVideoInputSchema,
} from '@faelab/types';
import {
  createVideo,
  deleteVideo,
  listVideos,
  updateVideo,
} from '../../modules/videos/service.js';
import { adminProcedure, publicProcedure, router } from '../init.js';

export const videosRouter = router({
  list: publicProcedure.output(VideoSchema.array()).query(async () => {
    return listVideos();
  }),

  create: adminProcedure
    .input(CreateVideoInputSchema)
    .output(VideoSchema)
    .mutation(async ({ input }) => {
      try {
        return await createVideo(input);
      } catch (err: any) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: err?.message ?? 'Failed to create video',
        });
      }
    }),

  update: adminProcedure
    .input(UpdateVideoInputSchema)
    .output(VideoSchema)
    .mutation(async ({ input }) => {
      const updated = await updateVideo(input.id, input.data);
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found' });
      return updated;
    }),

  delete: adminProcedure
    .input(DeleteVideoInputSchema)
    .output(DeleteVideoInputSchema)
    .mutation(async ({ input }) => {
      const ok = await deleteVideo(input.id);
      if (!ok) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found' });
      return input;
    }),
});
