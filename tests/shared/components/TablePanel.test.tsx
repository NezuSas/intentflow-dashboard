// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button, EmptyState, Pagination, StatusBadge, Table, TableEmpty, TablePanel } from "@/shared/components";

let container: HTMLDivElement;
let root: Root;
const click = async (element: Element | null) => {
  expect(element).not.toBeNull();
  await act(async () => { (element as HTMLElement).click(); });
};

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({
    matches: false, addListener: () => undefined, removeListener: () => undefined,
    addEventListener: () => undefined, removeEventListener: () => undefined,
  }) });
  const getComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element) => getComputedStyle(element));
  class ResizeObserverMock { observe() {} unobserve() {} disconnect() {} }
  globalThis.ResizeObserver = ResizeObserverMock;
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => { root.unmount(); }); document.body.replaceChildren(); vi.restoreAllMocks(); });

describe("TablePanel shared behavior", () => {
  it("renders mapped rows, multiple columns, actions and badges while preserving cell events and styles", async () => {
    const onAction = vi.fn();
    const onCellClick = vi.fn();
    const onCellMouseDown = vi.fn();
    const rows = [{ id: 1, name: "Alpha", active: true }, { id: 2, name: "Beta", active: false }];
    await act(async () => {
      root.render(
        <TablePanel title="Records">
          <Table label="Records table">
            <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {null}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td className="named-cell" style={{ fontWeight: 600 }} onClick={onCellClick} onMouseDown={onCellMouseDown}>{row.name}</td>
                  <td><StatusBadge variant={row.active ? "success" : "neutral"}>{row.active ? "Active" : "Inactive"}</StatusBadge></td>
                  <td><Button onClick={() => onAction(row.id)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TablePanel>
      );
    });

    expect(container.querySelector(".ant-card h2")?.textContent).toBe("Records");
    expect(container.querySelectorAll(".ant-table-tbody tr.ant-table-row")).toHaveLength(2);
    expect(container.querySelectorAll(".ant-table-thead th")).toHaveLength(4);
    expect(container.textContent).toContain("Active");
    const cell = container.querySelector(".named-cell") as HTMLElement;
    expect(cell.style.fontWeight).toBe("600");
    await click(cell);
    await act(async () => { cell.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); });
    expect(onCellClick).toHaveBeenCalledOnce();
    expect(onCellMouseDown).toHaveBeenCalledOnce();
    await click(container.querySelector(".ant-table-tbody button"));
    expect(onAction).toHaveBeenCalledWith(1);
  });

  it("renders TableEmpty and pagination under the table", async () => {
    const onNext = vi.fn();
    await act(async () => {
      root.render(
        <TablePanel title="Empty records" pagination={<Pagination page={1} pageSize={20} totalCount={40} onPageChange={onNext} />}>
          <Table label="Empty table"><thead><tr><th>ID</th></tr></thead><tbody><TableEmpty colSpan={1} label="No records available." /></tbody></Table>
        </TablePanel>
      );
    });
    expect(container.textContent).toContain("No records available.");
    expect(container.querySelector(".ant-pagination")).not.toBeNull();
    await click(container.querySelector(".ant-pagination-next button"));
    expect(onNext).toHaveBeenCalledWith(2);
  });

  it("accepts a shared EmptyState as conditional content", async () => {
    await act(async () => { root.render(<TablePanel title="No data">{false}<EmptyState label="Nothing to show" /></TablePanel>); });
    expect(container.textContent).toContain("Nothing to show");
  });

  it("passes a selected page number directly to the page handler", async () => {
    const onPageChange = vi.fn();
    await act(async () => {
      root.render(<Pagination page={1} pageSize={20} totalCount={100} onPageChange={onPageChange} />);
    });
    await click(container.querySelector(".ant-pagination-item-4"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
