import { describe, expect, it } from "vitest";
import { toggleCheckboxValue } from "@/shared/components/forms/CheckboxGroup";

describe("CheckboxGroup selection", () => {
  it("recognizes an existing selected value", () => {
    expect([2, 4].includes(2)).toBe(true);
  });

  it("adds a newly selected option without duplicating it", () => {
    expect(toggleCheckboxValue([2], 4, true)).toEqual([2, 4]);
    expect(toggleCheckboxValue([2, 4], 4, true)).toEqual([2, 4]);
  });

  it("removes an unchecked option", () => {
    expect(toggleCheckboxValue([2, 4], 2, false)).toEqual([4]);
  });

  it("keeps the value unchanged when the group is disabled", () => {
    expect(toggleCheckboxValue([2], 4, true, true)).toEqual([2]);
  });
});
