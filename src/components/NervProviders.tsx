"use client";

import { ThemeProvider, NervToastProvider } from "@mdrbx/nerv-ui";

export default function NervProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NervToastProvider>
        {children}
      </NervToastProvider>
    </ThemeProvider>
  );
}
