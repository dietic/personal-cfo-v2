"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Github, Linkedin, Mail, PiggyBank, Twitter } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Top section */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">
                {t("landing.footer.brand")}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {t("landing.footer.tagline")}
            </p>
            {/* Social links */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@personal-cfo.io"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              {t("landing.footer.product")}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-primary">
                  {t("landing.footer.features")}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-primary">
                  {t("landing.footer.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-primary">
                  {t("landing.footer.analytics")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              {t("landing.footer.legal")}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  {t("landing.footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  {t("landing.footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  {t("landing.footer.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {t("landing.footer.brand")}.{" "}
            {t("landing.footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
