"use client";

import { ThemeProvider } from "@/contexts/ThemeProvider";

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
