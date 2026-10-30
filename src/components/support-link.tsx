import { SUPPORT_EMAIL } from "@/lib/config";

export function SupportLink({ compact = false }: { compact?: boolean }) {
  return (
    <p className={compact ? "support-link support-link--compact" : "support-link"}>
      Need help? Contact support.{" "}
      <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
    </p>
  );
}
