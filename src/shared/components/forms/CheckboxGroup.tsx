import { Checkbox } from "antd";
import type { ReactNode } from "react";

export type CheckboxGroupOption = { id: number; label: ReactNode };

export const toggleCheckboxValue = (
  value: number[],
  id: number,
  checked: boolean,
  disabled = false,
) => {
  if (disabled) return value;

  return checked
    ? value.includes(id) ? value : [...value, id]
    : value.filter((currentId) => currentId !== id);
};

export function CheckboxGroup({ options, value, onChange, disabled = false }: { options: CheckboxGroupOption[]; value: number[]; onChange: (value: number[]) => void; disabled?: boolean }) {
  return <Checkbox.Group disabled={disabled} value={value} onChange={(nextValue) => onChange(nextValue.map(Number))} options={options.map((option) => ({ value: option.id, label: option.label }))} />;
}
