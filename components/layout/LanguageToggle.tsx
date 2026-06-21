"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Dil değiştir / Change language"
      onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
      className="font-medium uppercase"
    >
      {locale === "tr" ? "EN" : "TR"}
    </Button>
  );
}
