"use server";
import { signIn, signOut } from "@/lib/auth";
import { safeReturnPath } from "@/lib/admin-identity";

export async function adminSignIn(returnTo: string) { await signIn("google", { redirectTo: safeReturnPath(returnTo) }); }
export async function adminSignOut(returnTo: string) { await signOut({ redirectTo: safeReturnPath(returnTo) }); }
