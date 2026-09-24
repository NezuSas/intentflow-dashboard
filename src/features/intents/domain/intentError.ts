import type { Intent } from "./Intent";

interface ErrorPresentation {
  title: string;
  description: string;
}

const errorPresentations: Record<string, ErrorPresentation> = {
  board_not_configured: {
    title: "Board connection is not configured",
    description: "The board has no ADB address configured. Check its connection settings.",
  },
  bridge_timeout: {
    title: "Connection check timed out",
    description: "The ADB bridge did not respond in time. The board's status could not be confirmed.",
  },
  bridge_network_error: {
    title: "ADB bridge is unreachable",
    description: "The server could not contact the bridge. This does not confirm whether the board is on or off.",
  },
  bridge_http_error: {
    title: "ADB bridge returned an error",
    description: "The bridge responded, but could not complete the connection check.",
  },
  adb_offline: {
    title: "Board is offline",
    description: "ADB cannot communicate with this board. Check its power and network connection.",
  },
  adb_unauthorized: {
    title: "ADB authorization required",
    description: "The board has not authorized this ADB connection.",
  },
  adb_state_unknown: {
    title: "Board status is unknown",
    description: "The bridge could not confirm that the board is ready for commands.",
  },
  command_not_allowed: {
    title: "Command is not available",
    description: "This command is not allowed for the board's version or subscription plan.",
  },
  command_failed: {
    title: "Command could not be executed",
    description: "The bridge reported a failure. See the technical details for its response.",
  },
  execution_error: {
    title: "Execution was interrupted",
    description: "An unexpected error occurred while processing the command.",
  },
};

const legacyStates: Record<string, string> = {
  unreachable: "adb_state_unknown",
  unknown: "adb_state_unknown",
  offline: "adb_offline",
  unauthorized: "adb_unauthorized",
};

export function getIntentErrorPresentation(intent: Intent): ErrorPresentation {
  const legacyState = intent.output?.match(/^Estado actual ADB: '([^']+)'$/)?.[1];
  const code = intent.error_code || (legacyState && legacyStates[legacyState]);
  return (code && errorPresentations[code]) || errorPresentations.command_failed;
}
