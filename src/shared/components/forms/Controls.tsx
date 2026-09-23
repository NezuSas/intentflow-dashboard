import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import styles from "../shared.module.css";
export const Input=(props:InputHTMLAttributes<HTMLInputElement>)=><input {...props} className={`${styles.control} ${props.className||""}`}/>;
export const Select=({children,...props}:SelectHTMLAttributes<HTMLSelectElement>)=><select {...props} className={`${styles.control} ${props.className||""}`}>{children}</select>;
export const Textarea=(props:TextareaHTMLAttributes<HTMLTextAreaElement>)=><textarea {...props} className={`${styles.control} ${props.className||""}`}/>;
export function FormField({label,error,required,children,className=""}:{label:string;error?:string;required?:boolean;children:ReactNode;className?:string}){return <label className={`${styles.field} ${className}`}><span className={styles.label}>{label}{required?" *":""}</span>{children}{error&&<span className={styles.error}>{error}</span>}</label>}
