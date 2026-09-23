import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, normalizeSelectOptions } from "@/shared/components/forms/Controls";

const option = (value: string | number, label: string, disabled = false) =>
  createElement("option", { value, disabled }, label);

describe("Select adapter", () => {
  it("normalizes static options", () => {
    expect(normalizeSelectOptions([option("", "All clients"), option("12", "Acme")])).toEqual([
      { value: "", label: "All clients", disabled: false },
      { value: "12", label: "Acme", disabled: false },
    ]);
  });

  it("flattens static options followed by mapped options, as used by Intents filters", () => {
    const clients = [{ id: 4, name: "Acme" }, { id: 8, name: "Nezu" }];
    const children = [option("", "All clients"), clients.map((client) => option(client.id, client.name)), null];

    expect(normalizeSelectOptions(children)).toEqual([
      { value: "", label: "All clients", disabled: false },
      { value: 4, label: "Acme", disabled: false },
      { value: 8, label: "Nezu", disabled: false },
    ]);
  });

  it("preserves numeric values and skips null or conditional children", () => {
    expect(normalizeSelectOptions([null, false, option(7, "Seven"), undefined])).toEqual([
      { value: 7, label: "Seven", disabled: false },
    ]);
  });

  it("adapts Ant Design values to the native onChange contract", () => {
    const onChange = vi.fn();
    const element = Select({ children: option(5, "Five"), onChange });

    (element.props.onChange as (value: number) => void)(5);

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: { value: "5" } }));
  });

  it("forwards disabled state and disabled options", () => {
    const element = Select({ children: option("archived", "Archived", true), disabled: true });

    expect(element.props.disabled).toBe(true);
    expect(element.props.options).toEqual([{ value: "archived", label: "Archived", disabled: true }]);
  });
});
