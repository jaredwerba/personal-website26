import "server-only";

// Single source of truth for the admin email gate.
// Defaults to jwerba@icloud.com so the /admin route works even if the env
// var isn't wired yet. Case-insensitive to be defensive against email
// provider quirks (Gmail treats Foo@ == foo@ etc.).
export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || "jwerba@icloud.com").toLowerCase();
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === getAdminEmail();
}
