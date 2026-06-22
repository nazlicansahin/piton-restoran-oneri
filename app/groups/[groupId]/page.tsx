"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { useUserData } from "@/hooks/useUserData";
import { api, ApiClientError } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupDetailSkeleton } from "@/components/skeletons/GroupDetailSkeleton";
import type { GroupDetailsDto, GroupFavoriteDto } from "@/lib/types";

function GroupDetailContent({ groupId }: { groupId: string }) {
  const t = useT();
  const { getToken } = useAuth();
  const { favorites } = useUserData();
  const [group, setGroup] = useState<GroupDetailsDto | null>(null);
  const [groupFavorites, setGroupFavorites] = useState<GroupFavoriteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const canManage = group?.role === "owner" || group?.role === "admin";

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const [detail, favs] = await Promise.all([
        api.getGroup(token, groupId),
        api.getGroupFavorites(token, groupId),
      ]);
      setGroup(detail.item);
      setGroupFavorites(favs.items);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : t("group.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, groupId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const onInvite = async (e: FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) return;
    try {
      await api.createInvite(token, groupId, inviteEmail.trim());
      setInviteEmail("");
      toast.success(t("group.inviteCreated"));
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : t("group.inviteError"),
      );
    }
  };

  const addToGroup = async (placeId: string) => {
    const fav = favorites[placeId];
    if (!fav) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await api.addGroupFavorite(token, groupId, {
        placeId: fav.placeId,
        name: fav.name,
        cuisine: fav.cuisine,
        address: fav.address,
        lat: fav.lat,
        lng: fav.lng,
      });
      setGroupFavorites((prev) => [res.item, ...prev]);
      toast.success(t("group.added"));
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : t("group.addError"),
      );
    }
  };

  const removeFromGroup = async (placeId: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      await api.removeGroupFavorite(token, groupId, placeId);
      setGroupFavorites((prev) => prev.filter((f) => f.placeId !== placeId));
    } catch {
      toast.error(t("group.removeError"));
    }
  };

  if (loading) {
    return <GroupDetailSkeleton />;
  }
  if (error || !group) {
    return (
      <p className="p-6 text-sm text-destructive">
        {error ?? t("group.notFound")}
      </p>
    );
  }

  const groupPlaceIds = new Set(groupFavorites.map((f) => f.placeId));
  const addableFavorites = Object.values(favorites).filter(
    (f) => !groupPlaceIds.has(f.placeId),
  );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">{group.name}</h1>
      {group.description && (
        <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-semibold">
            {t("group.members", { count: group.members.length })}
          </h2>
          <ul className="flex flex-col gap-1.5">
            {group.members.map((m) => (
              <li
                key={m.userId}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="truncate">
                  {m.displayName ?? m.email ?? t("group.member")}
                </span>
                <span className="text-xs text-muted-foreground">{m.role}</span>
              </li>
            ))}
          </ul>

          {canManage && (
            <form onSubmit={onInvite} className="mt-3 flex gap-2">
              <Input
                type="email"
                placeholder={t("group.invitePlaceholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" size="sm">
                {t("group.invite")}
              </Button>
            </form>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">
            {t("group.favorites", { count: groupFavorites.length })}
          </h2>
          <ul className="flex flex-col gap-1.5">
            {groupFavorites.map((f) => (
              <li
                key={f.placeId}
                className="flex items-start justify-between rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {f.name ?? t("place.unnamed")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {f.cuisine ?? t("place.noCuisine")}
                    {f.addedByName ? ` · ${f.addedByName}` : ""}
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => removeFromGroup(f.placeId)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted"
                    aria-label={t("group.remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
            {groupFavorites.length === 0 && (
              <li className="text-xs text-muted-foreground">
                {t("group.noFavorites")}
              </li>
            )}
          </ul>

          {canManage && addableFavorites.length > 0 && (
            <Card className="mt-3 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t("group.addFromFavorites")}
              </p>
              <ul className="flex flex-col gap-1">
                {addableFavorites.slice(0, 8).map((f) => (
                  <li key={f.placeId} className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm">
                      {f.name ?? t("place.unnamed")}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToGroup(f.placeId)}
                    >
                      {t("group.add")}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

export default function GroupDetailPage() {
  const params = useParams<{ groupId: string }>();
  return (
    <RequireAuth>
      <GroupDetailContent groupId={params.groupId} />
    </RequireAuth>
  );
}
