import type { ReactNode } from "react";import styles from "../shared.module.css";
export const Card=({children,className=""}:{children:ReactNode;className?:string})=><section className={`${styles.card} ${className}`}>{children}</section>;
export const PageHeader=({title,actions,description}:{title:string;actions?:ReactNode;description?:string})=><header className={styles.pageHeader}><div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{actions}</header>;
export const LoadingState=({label="Loading…"}:{label?:string})=><div className={styles.state}>{label}</div>;
export const EmptyState=({label="No records found."}:{label?:string})=><div className={styles.state}>{label}</div>;
export const ErrorState=({message}:{message:string})=><div className={styles.error}>{message}</div>;
