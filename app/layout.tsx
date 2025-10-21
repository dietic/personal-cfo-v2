import Navbar from "@/components/landing/navbar";
import { ThemeProvider } from "@/components/theme-provider";
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
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
