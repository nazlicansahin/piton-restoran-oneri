"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const t = useT();

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold">
          {t("app.brand")}
        </Link>
        {user && (
          <nav className="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
            <Link href="/favorites" className="hover:text-foreground">
              {t("header.favorites")}
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
