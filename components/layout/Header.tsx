"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-semibold">
          Restoran Öneri
        </Link>
        {user && (
          <nav className="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
            <Link href="/favorites" className="hover:text-foreground">
              Favoriler
            </Link>
            <Link href="/groups" className="hover:text-foreground">
              Gruplar
            </Link>
          </nav>
        )}
      </div>
      <nav className="flex items-center gap-2 text-sm">
        {loading ? null : user ? (
          <>
            <span className="hidden text-muted-foreground sm:inline">
              {user.email ?? user.displayName ?? "Hesabım"}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Çıkış
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Giriş</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Kayıt Ol</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
