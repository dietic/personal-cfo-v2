"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { PiggyBank } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { locale, setLocale } = useTranslation();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <PiggyBank className="h-5 w-5 text-primary" />
          <span className="font-semibold">PersonalCFO</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
          <div className="ml-1 flex items-center gap-2 border-l border-border pl-3">
            <Button
              variant={locale === "es" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLocale("es")}
            >
              ES
            </Button>
            <Button
              variant={locale === "en" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLocale("en")}
            >
              EN
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
