"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTranslation } from "@/hooks/use-translation";
import { Globe, LogIn, Menu, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingMobileMenu() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);

  // Close menu when viewport becomes desktop size
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && open) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const toggleLocale = () => setLocale(locale === "en" ? "es" : "en");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left flex items-center gap-2">
            <Image src="/cfo-isotype.png" alt="Personal CFO" width={24} height={24} className="h-6 w-6" />
            <span className="sr-only">Personal CFO</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          </Link>
          <Link href="/register" onClick={() => setOpen(false)}>
            <Button className="w-full justify-start gap-2">
              <Rocket className="h-4 w-4" />
              <span>Get Started</span>
            </Button>
          </Link>

          <div className="my-2 h-px w-full bg-border" />

          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={toggleLocale}
          >
            <Globe className="h-4 w-4" />
            <span>{locale === "en" ? "Español" : "English"}</span>
          </Button>

          <div className="flex items-center justify-between rounded-md border p-2">
            <span className="text-sm">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
