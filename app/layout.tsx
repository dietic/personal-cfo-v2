import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/locale-context";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Personal CFO",
  description: "Track your money. See patterns. Act smarter.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/cfo-favicon.png", type: "image/png" },
    ],
    apple: "/cfo-favicon.png",
    shortcut: "/favicon.ico",
  },
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
