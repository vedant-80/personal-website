export function isAdminEmail(email: unknown): boolean {
  const configured = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!configured && typeof email === "string" && email.trim().toLowerCase() === configured;
}

export function safeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\x00-\x20]/.test(value) || value.startsWith("/api/")) return "/admin";
  return value;
}
