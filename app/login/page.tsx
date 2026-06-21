"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Giriş başarılı");
      router.push("/");
    } catch (err) {
      toast.error("Giriş başarısız: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      await signInWithGoogle();
      toast.success("Giriş başarılı");
      router.push("/");
    } catch (err) {
      toast.error("Google girişi başarısız: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>
            Favorilerini ve gruplarını kullanmak için giriş yap.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full"
          >
            Google ile devam et
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            veya
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              Giriş Yap
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/register" className="underline">
              Kayıt ol
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
