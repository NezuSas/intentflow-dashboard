import type { ReactNode } from "react";import styles from "../shared.module.css";
export const Table=({children,label}:{children:ReactNode;label:string})=><div className={styles.tableWrap}><table className={styles.table} aria-label={label}>{children}</table></div>;
export const TableEmpty=({colSpan,label}:{colSpan:number;label:string})=><tr><td colSpan={colSpan}><div className={styles.state}>{label}</div></td></tr>;
export type BadgeVariant="success"|"warning"|"error"|"info"|"neutral";
export const StatusBadge=({variant="neutral",children}:{variant?:BadgeVariant;children:ReactNode})=><span className={`${styles.badge} ${variant==="error"?styles.errorBadge:styles[variant]}`}>{children}</span>;
