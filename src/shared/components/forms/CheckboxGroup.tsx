import type { ReactNode } from "react";
import styles from "../shared.module.css";

export type CheckboxGroupOption = { id: number; label: ReactNode };

export function CheckboxGroup({ options, value, onChange, disabled = false }: { options: CheckboxGroupOption[]; value: number[]; onChange: (value: number[]) => void; disabled?: boolean }) {
  return <div className={styles.field}>{options.map((option) => <label key={option.id}><input disabled={disabled} type="checkbox" checked={value.includes(option.id)} onChange={(event) => onChange(event.target.checked ? [...value, option.id] : value.filter((id) => id !== option.id))} /> {option.label}</label>)}</div>;
}
