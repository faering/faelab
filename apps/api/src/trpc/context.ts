import '@fastify/cookie';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { getSession } from '../auth/sessionStore.js';

export async function createTRPCContext({ req }: CreateFastifyContextOptions) {
  const sessionId = req.cookies?.admin_session;
  const session = getSession(sessionId);
  return {
    req,
    session,
    isAdmin: Boolean(session),
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
