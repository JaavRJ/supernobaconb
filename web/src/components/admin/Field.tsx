"use client";

import { useId } from "react";
import styles from "./Field.module.css";
import ui from "./ui.module.css";

interface Option {
  value: string;
  label: string;
}

interface CommonProps {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

type FieldProps = CommonProps &
  (
    | { type?: "text" | "url" | "date"; value: string; onChange: (value: string) => void }
    | { type: "textarea"; rows?: number; value: string; onChange: (value: string) => void }
    | {
        type: "number";
        value: number | null;
        onChange: (value: number | null) => void;
        min?: number;
        max?: number;
        step?: number;
      }
    | { type: "select"; value: string; options: Option[]; onChange: (value: string) => void }
    | { type: "checkbox"; value: boolean; onChange: (value: boolean) => void }
  );

/** Campo de formulario con etiqueta, pista y error: texto, área, número, fecha, selector o casilla. */
export function Field(props: FieldProps) {
  const id = useId();
  const { label, error, hint, required, disabled } = props;
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    disabled,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: ui.input,
  };

  let control;
  if (props.type === "textarea") {
    control = (
      <textarea
        {...common}
        rows={props.rows ?? 5}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  } else if (props.type === "number") {
    control = (
      <input
        {...common}
        type="number"
        inputMode="decimal"
        min={props.min}
        max={props.max}
        step={props.step}
        placeholder={props.placeholder}
        value={props.value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          const n = Number(raw);
          props.onChange(raw === "" || Number.isNaN(n) ? null : n);
        }}
      />
    );
  } else if (props.type === "select") {
    control = (
      <select {...common} value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (props.type === "checkbox") {
    return (
      <div className={styles.field}>
        <label className={styles.check} htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            className={styles.box}
            checked={props.value}
            disabled={disabled}
            aria-describedby={describedBy}
            onChange={(e) => props.onChange(e.target.checked)}
          />
          <span>{label}</span>
        </label>
        {hint ? (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  } else {
    control = (
      <input
        {...common}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {control}
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
