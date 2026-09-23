import { Form, Input as AntInput, Select as AntSelect } from "antd";
import type { InputProps, SelectProps } from "antd";
import type { TextAreaProps } from "antd/es/input";
import { Children, isValidElement } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <AntInput {...(props as unknown as InputProps)} />;
export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <AntInput.TextArea {...(props as unknown as TextAreaProps)} />;

type NativeOptionProps = {
  value?: string | number;
  children?: ReactNode;
  disabled?: boolean;
};

/** Converts native option markup into Ant Design options without assuming a flat children array. */
export const normalizeSelectOptions = (children: ReactNode) =>
  Children.toArray(children).flatMap((child) => {
    if (!isValidElement<NativeOptionProps>(child) || child.type !== "option" || child.props.value === undefined) {
      return [];
    }

    return [{ value: child.props.value, label: child.props.children, disabled: child.props.disabled }];
  });

export const Select = ({ children, onChange, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => {
  const options = normalizeSelectOptions(children);
  return <AntSelect {...(props as unknown as SelectProps)} options={options} onChange={(value) => onChange?.({ target: { value: String(value) } } as ChangeEvent<HTMLSelectElement>)} />;
};
export function FormField({ label, error, required, children, className = "" }: { label: string; error?: string; required?: boolean; children: ReactNode; className?: string }) { return <Form.Item className={className} label={label} required={required} validateStatus={error ? "error" : undefined} help={error}>{children}</Form.Item>; }
