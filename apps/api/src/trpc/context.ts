import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export async function createTRPCContext({ req }: CreateFastifyContextOptions) {
  return {
    req
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
