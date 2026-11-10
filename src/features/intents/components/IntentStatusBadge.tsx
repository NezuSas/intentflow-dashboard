import { Button, StatusBadge, type BadgeVariant } from "@/shared/components";
import type { Intent } from "../domain/Intent";

export function IntentStatusBadge({ intent, onShowError }: { intent: Intent; onShowError: (intent: Intent) => void }) {
  const status = intent.status.trim().toUpperCase();
  const variant: BadgeVariant = status === "OK" || status === "SUCCESS"
    ? "success"
    : status === "ERROR" || status === "FAILED"
      ? "error"
      : status === "PENDING" ? "warning" : "neutral";
  const label = status === "OK" || status === "SUCCESS"
    ? "Correcta"
    : status === "ERROR" || status === "FAILED"
      ? "Fallida"
      : status === "PENDING" ? "Pendiente" : intent.status;
  const badge = <StatusBadge variant={variant}>{label}</StatusBadge>;

  return status === "ERROR"
    ? <Button type="button" variant="text" aria-label={`Ver el error de la intención ${intent.id}`} onClick={() => onShowError(intent)}>{badge}</Button>
    : badge;
}
