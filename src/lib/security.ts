export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 4) {
    return "••••";
  }
  return `••••${trimmed.slice(-4)}`;
}

export function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cache-Control": "no-store",
};
