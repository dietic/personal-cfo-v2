import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/locale-context";
import "@/styles/globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export const metadata = {
  title: "Personal CFO",
  description: "Track your money. See patterns. Act smarter.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LocaleProvider>
              {children}
              <Toaster position="top-right" richColors />
            </LocaleProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
