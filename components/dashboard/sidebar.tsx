"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/locale-context";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CreditCard,
  FileText,
  Globe,
  Home,
  LineChart,
  Receipt,
  Settings,
  Shield,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "dashboard", href: "/dashboard", icon: Home },
  { name: "cards", href: "/cards", icon: CreditCard },
  { name: "transactions", href: "/transactions", icon: Receipt },
  { name: "statements", href: "/statements", icon: FileText },
  { name: "analytics", href: "/analytics", icon: LineChart },
  { name: "budgets", href: "/budgets", icon: Target },
  { name: "alerts", href: "/alerts", icon: AlertCircle },
];

const bottomNavigation = [
  { name: "settings", href: "/settings", icon: Settings },
  { name: "admin", href: "/admin", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          aria-label="Personal CFO Dashboard"
        >
          {/* Light logo */}
          <Image
            src="/cfo-logo.png"
            alt="Personal CFO"
            width={132}
            height={24}
            className="block dark:hidden h-6 w-auto"
            priority
          />
          {/* Dark logo */}
          <Image
            src="/cfo-logo-white.png"
            alt="Personal CFO"
            width={132}
            height={24}
            className="hidden dark:block h-6 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(`dashboard.navigation.${item.name}`)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t p-4 space-y-1">
        {/* Locale switcher */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={toggleLocale}
        >
          <Globe className="h-5 w-5" />
          <span>{locale === "en" ? "Español" : "English"}</span>
        </Button>

        {bottomNavigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(`dashboard.navigation.${item.name}`)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
