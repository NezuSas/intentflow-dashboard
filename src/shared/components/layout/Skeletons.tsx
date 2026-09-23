import { Skeleton } from "antd";
import { Card, Page, PageHeader } from "./Primitives";
import { TablePanel } from "../data/Table";
import styles from "../shared.module.css";

export function TableSkeleton({
  columns,
  rows = 5,
  label = "Loading table...",
}: {
  columns: number;
  rows?: number;
  label?: string;
}) {
  return (
    <div className={styles.skeletonTable} role="status" aria-label={label}>
      <div aria-hidden="true">
        {Array.from({ length: rows + 1 }, (_, row) => (
          <div
            key={row}
            className={`${styles.skeletonRow} ${row === 0 ? styles.skeletonHeader : ""}`}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(96px, 1fr))` }}
          >
            {Array.from({ length: columns }, (_, column) => (
              <Skeleton.Input
                key={column}
                active
                size="small"
                style={{ width: `${55 + ((row + column) % 3) * 15}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TablePageSkeleton({
  title,
  tableTitle,
  columns,
}: {
  title: string;
  tableTitle: string;
  columns: number;
}) {
  return (
    <Page>
      <PageHeader title={title} actions={<Skeleton.Button active size="large" />} />
      <TablePanel title={tableTitle}>
        <TableSkeleton columns={columns} label={`Loading ${tableTitle.toLowerCase()}...`} />
      </TablePanel>
    </Page>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.skeletonCards} role="status" aria-label="Loading dashboard statistics...">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className={styles.skeletonCard}>
          <Skeleton active title={{ width: "45%" }} paragraph={{ rows: 2, width: ["70%", "55%"] }} />
        </Card>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className={styles.skeletonForm} role="status" aria-label="Loading form options...">
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className={styles.skeletonField} aria-hidden="true">
          <Skeleton.Input active size="small" style={{ width: 110 }} />
          <Skeleton.Input active block style={{ width: "100%" }} />
        </div>
      ))}
    </div>
  );
}
