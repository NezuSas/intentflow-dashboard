import { Alert, Card as AntCard, Empty, Flex, Spin, Typography } from "antd";import type { ReactNode } from "react";import styles from "../shared.module.css";
export const Card=({children,className=""}:{children:ReactNode;className?:string})=><AntCard className={className}>{children}</AntCard>;
export const Page=({children}:{children:ReactNode})=><main className={styles.page}>{children}</main>;
export const ActionGroup=({children}:{children:ReactNode})=><div className={styles.actionGroup}>{children}</div>;
export const PageHeader=({title,actions,description}:{title:string;actions?:ReactNode;description?:string})=><Flex className={styles.pageHeader} justify="space-between" align="center" gap={16}><div><Typography.Title level={1}>{title}</Typography.Title>{description&&<Typography.Text type="secondary">{description}</Typography.Text>}</div>{actions}</Flex>;
export const LoadingState=({label="Loading…"}:{label?:string})=><Flex className={styles.state} vertical align="center" gap={8}><Spin /><Typography.Text type="secondary">{label}</Typography.Text></Flex>;
export const EmptyState=({label="No records found."}:{label?:string})=><Empty description={label} />;
export const ErrorState=({message}:{message:string})=><Alert type="error" message={message} showIcon />;
