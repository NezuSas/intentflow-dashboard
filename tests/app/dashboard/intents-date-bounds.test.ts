import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getGuayaquilDayBounds,
} from "@/app/dashboard/intents/page";

describe(
  "getGuayaquilDayBounds",
  () => {
    it(
      "uses a half-open interval for a regular day",
      () => {
        expect(
          getGuayaquilDayBounds("2026-09-23")
        ).toEqual({
          executedAtAfter:
            "2026-09-23T00:00:00-05:00",
          executedAtBefore:
            "2026-09-24T00:00:00-05:00",
        });
      }
    );

    it(
      "crosses a month boundary without using local time",
      () => {
        expect(
          getGuayaquilDayBounds("2026-09-30")
        ).toMatchObject({
          executedAtBefore:
            "2026-10-01T00:00:00-05:00",
        });
      }
    );

    it(
      "crosses a year boundary without using local time",
      () => {
        expect(
          getGuayaquilDayBounds("2026-12-31")
        ).toMatchObject({
          executedAtBefore:
            "2027-01-01T00:00:00-05:00",
        });
      }
    );
  }
);
