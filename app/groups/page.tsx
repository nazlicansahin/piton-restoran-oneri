"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GroupListItemDto } from "@/lib/types";

function GroupsContent() {
  const { getToken } = useAuth();
  const [groups, setGroups] = useState<GroupListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await api.getGroups(token);
      setGroups(res.items);
    } catch {
      toast.error("Gruplar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error("Grup adı en az 3 karakter olmalı");
      return;
    }
    setCreating(true);
    const token = await getToken();
    if (!token) return;
    try {
      const res = await api.createGroup(token, {
        name: name.trim(),
        description: description.trim() || null,
      });
      setGroups((prev) => [res.item, ...prev]);
      setName("");
      setDescription("");
      toast.success("Grup oluşturuldu");
    } catch {
      toast.error("Grup oluşturulamadı");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Gruplarım</h1>

      <Card className="mb-6 p-4">
        <form onSubmit={onCreate} className="flex flex-col gap-3">
          <p className="font-medium">Yeni grup oluştur</p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Grup adı</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hafta Sonu Gurmeleri"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desc">Açıklama (opsiyonel)</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={creating} className="self-start">
            {creating ? "Oluşturuluyor..." : "Oluştur"}
          </Button>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : groups.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Henüz bir grubun yok. Yukarıdan oluşturabilirsin.
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link href={`/groups/${g.id}`}>
                <Card className="p-4 transition-colors hover:bg-accent">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{g.name}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {g.role}
                    </span>
                  </div>
                  {g.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {g.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {g.memberCount} üye
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <RequireAuth>
      <GroupsContent />
    </RequireAuth>
  );
}
