// This file holds the TRPC router for site content management
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  SiteContentInputSchema,
  SiteContentSchema,
  SiteContentPresetCreateInputSchema,
  SiteContentPresetSchema,
  SiteContentPresetSummarySchema,
} from '@portfolio/types';

import {
  createSiteContentPreset,
  deleteSiteContentPreset,
  getSiteContent,
  getSiteContentPreset,
  listSiteContentPresets,
  upsertSiteContent,
} from '../../modules/siteContent/service.js';
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

  presets: router({
    list: adminProcedure.output(z.array(SiteContentPresetSummarySchema)).query(async ({ ctx }) => {
      const ownerId = ctx.session?.userId;
      if (!ownerId) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return listSiteContentPresets(ownerId);
    }),

    get: adminProcedure
      .input(z.object({ id: z.string() }))
      .output(SiteContentPresetSchema)
      .query(async ({ ctx, input }) => {
        const ownerId = ctx.session?.userId;
        if (!ownerId) throw new TRPCError({ code: 'UNAUTHORIZED' });
        const preset = await getSiteContentPreset(ownerId, input.id);
        if (!preset) throw new TRPCError({ code: 'NOT_FOUND' });
        return preset;
      }),

    create: adminProcedure
      .input(SiteContentPresetCreateInputSchema)
      .output(SiteContentPresetSummarySchema)
      .mutation(async ({ ctx, input }) => {
        const ownerId = ctx.session?.userId;
        if (!ownerId) throw new TRPCError({ code: 'UNAUTHORIZED' });
        return createSiteContentPreset(ownerId, input);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const ownerId = ctx.session?.userId;
        if (!ownerId) throw new TRPCError({ code: 'UNAUTHORIZED' });
        await deleteSiteContentPreset(ownerId, input.id);
      }),
  }),
});
