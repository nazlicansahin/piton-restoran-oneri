import type {
  ApiError,
  FavoriteDto,
  GroupDetailsDto,
  GroupFavoriteDto,
  GroupInviteDto,
  GroupListItemDto,
  PreferencesDto,
} from "./types";

export class ApiClientError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body) headers.set("Content-Type", "application/json");

  const res = await fetch(path, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = data as ApiError;
    throw new ApiClientError(
      err.code ?? "error",
      err.message ?? "İstek başarısız oldu.",
      res.status,
    );
  }
  return data as T;
}

export const api = {
  // Favorites
  getFavorites: (token: string) =>
    request<{ items: FavoriteDto[] }>("/api/favorites", token),
  putFavorite: (token: string, placeId: string, body: Omit<FavoriteDto, "placeId" | "createdAt">) =>
    request<{ ok: true }>(`/api/favorites/${placeId}`, token, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteFavorite: (token: string, placeId: string) =>
    request<{ ok: true }>(`/api/favorites/${placeId}`, token, {
      method: "DELETE",
    }),

  // Preferences
  getPreferences: (token: string) =>
    request<{ item: PreferencesDto }>("/api/me/preferences", token),
  putPreferences: (
    token: string,
    body: { maxDistanceKm: number; pricePreference: string | null; cuisines: string[] },
  ) =>
    request<{ item: PreferencesDto }>("/api/me/preferences", token, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  // Groups
  getGroups: (token: string) =>
    request<{ items: GroupListItemDto[] }>("/api/groups", token),
  createGroup: (token: string, body: { name: string; description?: string | null }) =>
    request<{ item: GroupListItemDto }>("/api/groups", token, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getGroup: (token: string, groupId: string) =>
    request<{ item: GroupDetailsDto }>(`/api/groups/${groupId}`, token),
  getGroupFavorites: (token: string, groupId: string) =>
    request<{ items: GroupFavoriteDto[] }>(
      `/api/groups/${groupId}/favorites`,
      token,
    ),
  addGroupFavorite: (
    token: string,
    groupId: string,
    body: Record<string, unknown>,
  ) =>
    request<{ item: GroupFavoriteDto }>(`/api/groups/${groupId}/favorites`, token, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeGroupFavorite: (token: string, groupId: string, placeId: string) =>
    request<{ ok: true }>(`/api/groups/${groupId}/favorites/${placeId}`, token, {
      method: "DELETE",
    }),
  createInvite: (token: string, groupId: string, email: string) =>
    request<{ item: GroupInviteDto }>(`/api/groups/${groupId}/invites`, token, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};
