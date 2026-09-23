import { Empty, Skeleton, Table as AntTable, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { isValidElement, type ReactElement, type ReactNode, type TdHTMLAttributes } from "react";
import { Card } from "../layout/Primitives";
import styles from "../shared.module.css";

type Cell = { content: ReactNode; props: Omit<TdHTMLAttributes<HTMLTableCellElement>, "children"> };
type Row = { key: string; cells: Cell[] };
const elements = (value: ReactNode) => {
  const result: ReactElement[] = [];
  const visit = (child: ReactNode): void => {
    if (Array.isArray(child)) {
      child.forEach(visit);
    } else if (isValidElement(child)) {
      result.push(child);
    }
  };

  visit(value);
  return result;
};

/** Canonical Ant Design table adapter for the declarative table markup used by feature pages. */
export const Table = ({ children, label }: { children: ReactNode; label: string }) => {
  const sections = elements(children) as Array<ReactElement<{ children?: ReactNode }>>;
  const head = sections.find((section) => section.type === "thead");
  const body = sections.find((section) => section.type === "tbody");
  const headerRow = elements(head?.props.children)[0] as ReactElement<{ children?: ReactNode }> | undefined;
  const headers = elements(headerRow?.props.children).map((cell) => (cell.props as { children?: ReactNode }).children);
  const parsedRows = elements(body?.props.children).map((row, index) => {
    if (row.type === TableEmpty) {
      return { rows: [] as Row[], emptyMessage: (row.props as { label: string }).label };
    }
    const cells = elements((row.props as { children?: ReactNode }).children);
    if (cells.length === 1 && cells[0].type === TableEmpty) {
      return { rows: [] as Row[], emptyMessage: (cells[0].props as { label: string }).label };
    }
    if (cells.length === 1 && (cells[0].props as { colSpan?: number }).colSpan) {
      const cell = cells[0].props as { children?: ReactNode; label?: unknown };
      const child = cell.children;
      const label = typeof cell.label === "string"
        ? cell.label
        : isValidElement(child) && typeof (child.props as { label?: unknown }).label === "string"
          ? (child.props as { label: string }).label
          : "No records found.";
      return { rows: [] as Row[], emptyMessage: label };
    }
    return { rows: [{ key: String(row.key ?? index), cells: cells.map((cell) => {
      const { children: content, ...props } = cell.props as TdHTMLAttributes<HTMLTableCellElement>;
      return { content, props };
    }) }], emptyMessage: "No records found." };
  });
  const rows = parsedRows.flatMap((result) => result.rows);
  const emptyMessage = parsedRows.find((result) => result.rows.length === 0)?.emptyMessage ?? "No records found.";
  const columns: ColumnsType<Row> = headers.map((title, index) => ({
    key: String(index),
    title,
    render: (_value, row) => row.cells[index]?.content,
    onCell: (row) => row.cells[index]?.props ?? {},
  }));
  return <AntTable<Row> aria-label={label} columns={columns} dataSource={rows} pagination={false} size="middle" scroll={{ x: "max-content" }} locale={{ emptyText: <Empty description={emptyMessage} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }} />;
};

export const TablePanel = ({ title, children, pagination, refreshing = false }: { title: string; children: ReactNode; pagination?: ReactNode; refreshing?: boolean }) => (
  <Card className={styles.tablePanel}>
    <div className={styles.tablePanelHeading}>
      <h2 className={styles.tablePanelTitle}>{title}</h2>
      {refreshing && <div className={styles.tablePanelRefresh} role="status"><Skeleton.Input active size="small" style={{ width: 64 }} /><span>Updating...</span></div>}
    </div>
    {children}
    {pagination && <div className={styles.tablePanelPagination}>{pagination}</div>}
  </Card>
);

export const TableEmpty = ({ colSpan, label }: { colSpan: number; label: string }) => <td colSpan={colSpan}><span data-table-empty={label} /></td>;
export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";
export const StatusBadge = ({ variant = "neutral", children }: { variant?: BadgeVariant; children: ReactNode }) => <Tag color={variant === "neutral" ? undefined : variant}>{children}</Tag>;
