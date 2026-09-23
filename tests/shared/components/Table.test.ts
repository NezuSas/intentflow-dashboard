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
      { key: "intent-1", cells: [{ content: "1", props: {} }, { content: "Success", props: {} }] },
      { key: "intent-2", cells: [{ content: "2", props: {} }, { content: "Error", props: {} }] },
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

  it("handles TableEmpty directly under tbody", () => {
    const element = Table({ label: "Users", children: [header("ID"), createElement("tbody", null, createElement(TableEmpty, { colSpan: 1, label: "No users found." }))] });

    expect(element.props.dataSource).toEqual([]);
    expect(element.props.locale.emptyText.props.description).toBe("No users found.");
  });

  it("preserves cell styling and mouse actions", () => {
    const onMouseDown = () => undefined;
    const status = createElement("td", { style: { cursor: "pointer" }, onMouseDown }, "Error");
    const element = Table({ label: "Intents", children: [header("Status"), createElement("tbody", null, createElement("tr", { key: 4 }, status))] });
    const cell = element.props.dataSource[0].cells[0];

    expect(cell.content).toBe("Error");
    expect(element.props.columns[0].onCell(element.props.dataSource[0])).toEqual({ style: { cursor: "pointer" }, onMouseDown });
  });
});
