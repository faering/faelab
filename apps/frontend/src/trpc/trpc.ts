import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@portfolio/api/trpc';

export const trpc = createTRPCReact<AppRouter>();
