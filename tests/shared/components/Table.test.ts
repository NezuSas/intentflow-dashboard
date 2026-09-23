import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Table, TableEmpty } from "@/shared/components/data/Table";

const header = (...titles: string[]) =>
  createElement("thead", null, createElement("tr", null, titles.map((title) => createElement("th", { key: title }, title))));

const row = (key: string, ...values: string[]) =>
  createElement("tr", { key }, values.map((value, index) => createElement("td", { key: index }, value)));

describe("Table adapter", () => {
  it("handles conditional children and preserves row keys and cells", () => {
    const element = Table({
      label: "Intents",
      children: [header("ID", "Status"), createElement("tbody", null, [row("intent-1", "1", "Success"), false, [row("intent-2", "2", "Error")]])],
    });

    expect(element.props.dataSource).toEqual([
      { key: "intent-1", cells: ["1", "Success"] },
      { key: "intent-2", cells: ["2", "Error"] },
    ]);
    expect(element.props.columns.map((column: { title: string }) => column.title)).toEqual(["ID", "Status"]);
  });

  it("uses TableEmpty labels without treating it as a data row", () => {
    const element = Table({
      label: "Intents",
      children: [header("ID", "Status"), createElement("tbody", null, createElement("tr", null, createElement(TableEmpty, { colSpan: 2, label: "No intents found." })))],
    });
    const empty = element.props.locale.emptyText;

    expect(element.props.dataSource).toEqual([]);
    expect(empty.props.description).toBe("No intents found.");
  });
});
