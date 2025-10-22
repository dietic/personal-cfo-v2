import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/locale-context";
import "@/styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Personal CFO",
  description: "Track your money. See patterns. Act smarter.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
