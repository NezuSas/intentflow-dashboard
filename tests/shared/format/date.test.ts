import { describe, expect, it } from "vitest";
import { formatCalendarDate, formatGuayaquilDateTime } from "@/shared/format/date";

describe("dashboard date formatting", () => {
  it("shows an intent in the Guayaquil day rather than the browser day", () => {
    expect(formatGuayaquilDateTime("2026-09-24T01:00:00Z")).toContain("23/09/2026");
  });

  it("keeps date-only subscription values on their stated day", () => {
    expect(formatCalendarDate("2026-09-23")).toBe("23/09/2026");
  });
});
