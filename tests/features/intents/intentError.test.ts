import { describe, expect, it } from "vitest";

import type { Intent } from "@/features/intents/domain/Intent";
import { getIntentErrorPresentation } from "@/features/intents/domain/intentError";

const intentWith = (error_code: string | null, output: string | null) =>
  ({ error_code, output } as Intent);

describe("intent error presentation", () => {
  it("shows a specific friendly name for a new error code", () => {
    const error = getIntentErrorPresentation(intentWith("bridge_timeout", "timeout comunicando con ADB Bridge"));
    expect(error.title).toBe("Connection check timed out");
  });

  it("does not claim an old unreachable error means the board is offline", () => {
    const error = getIntentErrorPresentation(intentWith(null, "Estado actual ADB: 'unreachable'"));
    expect(error.title).toBe("Board status is unknown");
  });

  it("falls back safely for an unrecognized error", () => {
    const error = getIntentErrorPresentation(intentWith(null, "unexpected bridge output"));
    expect(error.title).toBe("Command could not be executed");
  });
});
