'use client';

import { ThemeProvider } from '@/themes';
import { SupabaseProvider } from './SupabaseProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </ThemeProvider>
  );
}
