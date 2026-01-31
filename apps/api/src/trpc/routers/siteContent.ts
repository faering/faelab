// This file holds the TRPC router for site content management
import { TRPCError } from '@trpc/server';
import { SiteContentInputSchema, SiteContentSchema } from '@portfolio/types';

import { getSiteContent, upsertSiteContent } from '../../modules/siteContent/service.js';
import { adminProcedure, router } from '../init.js';

export const siteContentRouter = router({
  get: adminProcedure.output(SiteContentSchema.nullable()).query(async ({ ctx }) => {
    const ownerId = ctx.session?.userId;
    if (!ownerId) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return getSiteContent(ownerId);
  }),

  upsert: adminProcedure
    .input(SiteContentInputSchema)
    .output(SiteContentSchema)
    .mutation(async ({ ctx, input }) => {
      const ownerId = ctx.session?.userId;
      if (!ownerId) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return upsertSiteContent(ownerId, input);
    }),
});
