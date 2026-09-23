import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "../shared.module.css";
export type ButtonVariant="primary"|"secondary"|"ghost"|"danger";
export function Button({variant="secondary",loading=false,loadingLabel="Loading…",children,className="",disabled,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:ButtonVariant;loading?:boolean;loadingLabel?:ReactNode;children:ReactNode}){return <button {...props} disabled={disabled||loading} className={`${styles.button} ${styles[variant]} ${className}`}>{loading?loadingLabel:children}</button>}
