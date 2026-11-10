import { Alert, Card as AntCard, Empty, Flex, Spin, Typography } from "antd";
import type { ReactNode } from "react";
import styles from "../shared.module.css";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <AntCard className={className}>{children}</AntCard>;

export const Page = ({ children }: { children: ReactNode }) => <main className={styles.page}>{children}</main>;

export const ActionGroup = ({ children }: { children: ReactNode }) => <div className={styles.actionGroup}>{children}</div>;

export const PageHeader = ({ title, actions, description }: { title: string; actions?: ReactNode; description?: string }) => (
  <header className={styles.pageHeader}>
    <div>
      <Typography.Title level={1}>{title}</Typography.Title>
      {description && <span className={styles.pageDescription}>{description}</span>}
    </div>
    {actions && <div>{actions}</div>}
  </header>
);

export const LoadingState = ({ label = "Cargando…" }: { label?: string }) => (
  <Flex className={styles.state} vertical align="center" gap={8}>
    <Spin />
    <Typography.Text type="secondary">{label}</Typography.Text>
  </Flex>
);

export const EmptyState = ({ label = "Sin registros." }: { label?: string }) => <Empty description={label} image={Empty.PRESENTED_IMAGE_SIMPLE} />;

export const ErrorState = ({ message }: { message: string }) => <Alert type="error" message={message} showIcon style={{ marginBottom: 16 }} />;

/** Etiqueta neutra para orígenes, tipos y categorías. */
export const Chip = ({ children }: { children: ReactNode }) => <span className={styles.chip}>{children}</span>;
