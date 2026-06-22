"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const t = useT();

  return (
    <header className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <Link href="/" className="truncate font-semibold">
          {t("app.brand")}
        </Link>
        {user && (
          <nav className="flex items-center">
            <Link
              href="/favorites"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground sm:text-sm"
            >
              <Heart className="h-4 w-4 shrink-0" />
              <span>{t("header.favorites")}</span>
            </Link>
          </nav>
        )}
      </div>
      <nav className="flex items-center gap-1 text-sm">
        <LanguageToggle />
        <ThemeToggle />
        {loading ? null : user ? (
          <>
            <span className="hidden text-muted-foreground sm:inline">
              {user.email ?? user.displayName ?? t("header.account")}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              {t("header.signOut")}
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{t("header.signIn")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">{t("header.signUp")}</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
