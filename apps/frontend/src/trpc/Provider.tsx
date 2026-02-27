import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { trpc } from './trpc';
import { createQueryClient, createTrpcClient } from './client';

type Props = {
  children: React.ReactNode;
};

export default function TrpcProvider({ children }: Props) {
  const [queryClient] = React.useState(() => createQueryClient());
  const [trpcClient] = React.useState(() => createTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
