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

export default function RegisterPage() {
  const { signInWithGoogle, registerWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı");
      return;
    }
    setBusy(true);
    try {
      await registerWithEmail(email, password);
      toast.success("Hesap oluşturuldu");
      router.push("/");
    } catch (err) {
      toast.error("Kayıt başarısız: " + (err as Error).message);
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
          <CardTitle>Kayıt Ol</CardTitle>
          <CardDescription>
            Yeni bir hesap oluştur veya Google ile devam et.
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

          <form onSubmit={handleRegister} className="flex flex-col gap-3">
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
              Hesap Oluştur
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="underline">
              Giriş yap
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
