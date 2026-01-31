import { initTRPC, TRPCError } from '@trpc/server';

import type { TRPCContext } from './context.js';

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const adminMiddleware = t.middleware(({ ctx, next }) => {
	if (!ctx.isAdmin) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to access this resource' });
	}
	return next();
});

export const adminProcedure = t.procedure.use(adminMiddleware);
