"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LandingMobileMenu from "./mobile-menu";

export default function Navbar() {
  const { locale, setLocale } = useTranslation();
  const pathname = usePathname();

  // Hide auth buttons on auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/reset-password");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-foreground" aria-label="Personal CFO Home">
          {/* Light mode logo */}
          <Image
            src="/cfo-logo.png"
            alt="Personal CFO"
            width={132}
            height={24}
            className="block dark:hidden h-6 w-auto"
            priority
          />
          {/* Dark mode logo */}
          <Image
            src="/cfo-logo-white.png"
            alt="Personal CFO"
            width={132}
            height={24}
            className="hidden dark:block h-6 w-auto"
            priority
          />
        </Link>
        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {!isAuthPage && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
          <div
            className={`flex items-center gap-2 ${
              !isAuthPage ? "ml-1 border-l border-border pl-3" : ""
            }`}
          >
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
        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <LandingMobileMenu />
        </div>
      </div>
    </header>
  );
}
