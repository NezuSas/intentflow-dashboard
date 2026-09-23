import type { ReactNode } from "react";
import styles from "../shared.module.css";

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
  return <div className={styles.field}>{options.map((option) => <label key={option.id}><input disabled={disabled} type="checkbox" checked={value.includes(option.id)} onChange={(event) => onChange(toggleCheckboxValue(value, option.id, event.target.checked, disabled))} /> {option.label}</label>)}</div>;
}
