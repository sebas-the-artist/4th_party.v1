function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function readClerkPublishableKey(): string {
  return env("CLERK_PUBLISHABLE_KEY") || env("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

export function readClerkSecretKey(): string {
  return env("CLERK_SECRET_KEY");
}

export function clerkKeysReady(): boolean {
  const publishable = readClerkPublishableKey();
  const secret = readClerkSecretKey();
  const pkOk = publishable.startsWith("pk_live_") || publishable.startsWith("pk_test_");
  const skOk = secret.startsWith("sk_live_") || secret.startsWith("sk_test_");
  return pkOk && skOk;
}
