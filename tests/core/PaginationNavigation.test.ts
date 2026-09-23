import { describe, expect, it } from "vitest";
import { pageAfterDeletion } from "@/core/Pagination";

describe("page navigation after deleting a row", () => {
  const meta = (count: number, page: number) => ({ count, page, pageSize: 20, next: null, previous: null });

  it("returns to the previous page if the deleted row was the last one", () => {
    expect(pageAfterDeletion(meta(21, 2))).toBe(1);
  });

  it("stays on the current page when it still contains rows", () => {
    expect(pageAfterDeletion(meta(22, 2))).toBe(2);
  });

  it("keeps the first page for an empty collection", () => {
    expect(pageAfterDeletion(meta(1, 1))).toBe(1);
  });
});
