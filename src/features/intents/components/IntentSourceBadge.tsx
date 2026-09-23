import { StatusBadge } from "@/shared/components";
import type { Intent, IntentSource } from "../domain/Intent";

const sourceLabels: Record<IntentSource, string> = {
  unknown: "Unknown",
  google_home: "Google Home",
  home_assistant: "Home Assistant",
  api: "API",
};

export function IntentSourceBadge({ source }: { source: Intent["source"] }) {
  const label = source && Object.prototype.hasOwnProperty.call(sourceLabels, source)
    ? sourceLabels[source]
    : sourceLabels.unknown;

  return <StatusBadge variant="neutral">{label}</StatusBadge>;
}
