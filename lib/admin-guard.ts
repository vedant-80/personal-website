import { cache } from "react";
import { auth } from "@/lib/auth";
import { isAdminEmail, safeReturnPath } from "@/lib/admin-identity";
import { redirect } from "next/navigation";

export const getAdminSession = cache(async () => {
  const session = await auth();
  return isAdminEmail(session?.user?.email) ? session : null;
});

export async function requireAdmin(returnTo = "/admin") {
  const session = await getAdminSession();
  if (!session) redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(safeReturnPath(returnTo))}`);
  return session;
}
