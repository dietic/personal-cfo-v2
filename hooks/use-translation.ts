"use client";

import { t, type Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    // TODO: read from user settings or navigator
    setLocale("en");
  }, []);

  return {
    t: (key: string) => t(locale, key),
    locale,
    setLocale,
  };
}
