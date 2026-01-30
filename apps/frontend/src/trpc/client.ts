import { httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';

import { trpc } from './trpc';

function getApiBaseUrl() {
  // Optional override: set VITE_API_BASE_URL=http://localhost:3001
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return envUrl?.trim() ? envUrl.trim().replace(/\/$/, '') : 'http://localhost:3001';
}

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/trpc`,
      }),
    ],
  });
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
