import { initTRPC, TRPCError } from '@trpc/server';

import type { TRPCContext } from './context.js';

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    console.error('[TRPC Error]', {
      code: error.code,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const adminMiddleware = t.middleware(({ ctx, next }) => {
	if (!ctx.isAdmin) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to access this resource' });
	}
	return next();
});

export const adminProcedure = t.procedure.use(adminMiddleware);
