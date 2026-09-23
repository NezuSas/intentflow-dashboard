import { Form, Input as AntInput, Select as AntSelect } from "antd";
import type { InputProps, SelectProps } from "antd";
import type { TextAreaProps } from "antd/es/input";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <AntInput {...(props as unknown as InputProps)} />;
export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <AntInput.TextArea {...(props as unknown as TextAreaProps)} />;
export const Select = ({ children, onChange, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => {
  const options = (Array.isArray(children) ? children : [children]).filter(Boolean).map((child) => {
    const option = child as React.ReactElement<{ value: string | number; children: ReactNode }>;
    return { value: option.props.value, label: option.props.children };
  });
  return <AntSelect {...(props as unknown as SelectProps)} options={options} onChange={(value) => onChange?.({ target: { value: String(value) } } as React.ChangeEvent<HTMLSelectElement>)} />;
};
export function FormField({ label, error, required, children, className = "" }: { label: string; error?: string; required?: boolean; children: ReactNode; className?: string }) { return <Form.Item className={className} label={label} required={required} validateStatus={error ? "error" : undefined} help={error}>{children}</Form.Item>; }
