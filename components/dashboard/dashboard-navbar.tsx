"use client";

import { MobileMenu } from "@/components/dashboard/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function DashboardNavbar() {
  const { profile, user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile menu button */}
        <MobileMenu />

        {/* Logo on mobile (isotype) */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 md:hidden"
          aria-label="Personal CFO Dashboard"
        >
          <Image
            src="/cfo-isotype.png"
            alt="Personal CFO"
            width={28}
            height={28}
            className="h-7 w-7"
          />
        </Link>

        <h1 className="text-base font-semibold md:text-xl">
          <span className="hidden sm:inline">
            {t("dashboard.navbar.welcomeBack")}{" "}
          </span>
          {profile?.name || "User"}!
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {profile?.name} {profile?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                {t("dashboard.navigation.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signOut();
              }}
            >
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("dashboard.navbar.signOut")}
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
