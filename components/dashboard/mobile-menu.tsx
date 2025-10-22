"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocale } from "@/contexts/locale-context";
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/statements", label: "Statements", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

export function MobileMenu() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  // Close menu when viewport becomes desktop size
  useEffect(() => {
    const handleResize = () => {
      // 768px is the md breakpoint in Tailwind
      if (window.innerWidth >= 768 && open) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-6">
          <SheetTitle className="text-left">Personal CFO</SheetTitle>
        </SheetHeader>
        <div className="flex h-[calc(100%-5rem)] flex-col justify-between p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t pt-4">
            {/* Locale switcher */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3"
              onClick={toggleLocale}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm">
                {locale === "en" ? "Español" : "English"}
              </span>
            </Button>

            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              // TODO: Check if user is admin for admin link
              if (item.adminOnly) {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
