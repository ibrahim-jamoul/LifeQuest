import type { InputHTMLAttributes } from "react";

export function CozyInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}
