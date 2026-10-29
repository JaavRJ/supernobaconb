import type { ButtonHTMLAttributes } from "react";
import styles from "./ui.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "quiet" | "danger";
  small?: boolean;
}

/** Botón del admin: principal (dorado), discreto o de borrar. */
export function Button({ variant = "primary", small, className, type = "button", ...rest }: ButtonProps) {
  const classes = [
    styles.button,
    variant === "quiet" ? styles.quiet : variant === "danger" ? styles.danger : "",
    small ? styles.small : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...rest} />;
}
