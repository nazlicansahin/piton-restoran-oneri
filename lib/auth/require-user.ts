import { ApiException } from "@/lib/http";
import { getOrCreateUser, type AppUser } from "./get-or-create-user";
import { verifyToken } from "./verify-token";

/**
 * Resolve the authenticated app user for a protected route.
 * Throws an `ApiException` (401) when the token is missing/invalid.
 */
export async function requireUser(request: Request): Promise<AppUser> {
  const header = request.headers.get("authorization");

  let verified;
  try {
    verified = await verifyToken(header);
  } catch (err) {
    const reason = (err as Error).message;
    if (reason === "admin_not_configured") {
      throw new ApiException(
        "auth_unavailable",
        "Sunucu kimlik doğrulaması yapılandırılmamış.",
        503,
      );
    }
    throw new ApiException("unauthorized", "Geçerli oturum bulunamadı.", 401);
  }

  return getOrCreateUser(verified);
}
