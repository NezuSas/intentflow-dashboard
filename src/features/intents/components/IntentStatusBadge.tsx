import { Button, StatusBadge, type BadgeVariant } from "@/shared/components";
import type { Intent } from "../domain/Intent";

export function IntentStatusBadge({ intent, onShowError }: { intent: Intent; onShowError: (intent: Intent) => void }) {
  const status = intent.status.trim().toUpperCase();
  const variant: BadgeVariant = status === "OK" || status === "SUCCESS"
    ? "success"
    : status === "ERROR" || status === "FAILED"
      ? "error"
      : status === "PENDING" ? "warning" : "neutral";
  const badge = <StatusBadge variant={variant}>{intent.status}</StatusBadge>;

  return status === "ERROR"
    ? <Button type="button" variant="text" aria-label={`View error details for intent ${intent.id}`} onClick={() => onShowError(intent)}>{badge}</Button>
    : badge;
}
