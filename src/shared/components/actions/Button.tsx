import { Button as AntButton } from "antd";
import type { ButtonProps } from "antd";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "text" | "link";
type Props = Omit<ButtonProps, "type" | "danger" | "htmlType" | "loading" | "children" | "variant"> & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled"> & { variant?: ButtonVariant; loading?: boolean; loadingLabel?: ReactNode; children?: ReactNode };
const variantProps: Record<ButtonVariant, Pick<ButtonProps, "type" | "danger">> = { primary: { type: "primary" }, secondary: { type: "default" }, ghost: { type: "text" }, danger: { type: "primary", danger: true }, text: { type: "text" }, link: { type: "link" } };
export function Button({ variant = "secondary", loading = false, loadingLabel, children, type, disabled, ...props }: Props) { return <AntButton {...variantProps[variant]} {...props} htmlType={type} disabled={disabled || loading} loading={loading}>{loading && loadingLabel ? loadingLabel : children}</AntButton>; }
