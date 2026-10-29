"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { Field } from "./Field";
import styles from "./ListEditor.module.css";

interface ListEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  /** Dibuja el contenido de un elemento; `update` reemplaza ese elemento. */
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
  /** Valor de un elemento nuevo. */
  newItem: () => T;
  addLabel?: string;
  emptyText?: string;
  /** Nombre para lectores de pantalla, p. ej. "enlace". */
  itemName?: string;
}

/** Lista editable de valores u objetos pequeños: agregar, quitar y subir o bajar. */
export function ListEditor<T>({
  items,
  onChange,
  renderItem,
  newItem,
  addLabel = "Agregar",
  emptyText = "Todavía no hay nada.",
  itemName = "elemento",
}: ListEditorProps<T>) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className={styles.list}>
      {items.length === 0 ? <p className={styles.empty}>{emptyText}</p> : null}
      <ul className={styles.items}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.body}>
              {renderItem(item, index, (next) => onChange(items.map((it, i) => (i === index ? next : it))))}
            </div>
            <div className={styles.tools}>
              <Button
                variant="quiet"
                small
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label={`Subir ${itemName} ${index + 1}`}
              >
                ↑
              </Button>
              <Button
                variant="quiet"
                small
                disabled={index === items.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label={`Bajar ${itemName} ${index + 1}`}
              >
                ↓
              </Button>
              <Button
                variant="danger"
                small
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={`Quitar ${itemName} ${index + 1}`}
              >
                Quitar
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <Button variant="quiet" small onClick={() => onChange([...items, newItem()])}>
          + {addLabel}
        </Button>
      </div>
    </div>
  );
}

interface StringListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  placeholder?: string;
  type?: "text" | "url" | "textarea";
}

/** Atajo de `ListEditor` para una lista de textos (enlaces, párrafos, etc.). */
export function StringListEditor({ label, items, onChange, addLabel, placeholder, type = "text" }: StringListEditorProps) {
  return (
    <ListEditor
      items={items}
      onChange={onChange}
      newItem={() => ""}
      addLabel={addLabel}
      itemName={label.toLowerCase()}
      renderItem={(value, index, update) =>
        type === "textarea" ? (
          <Field label={`${label} ${index + 1}`} type="textarea" rows={4} value={value} placeholder={placeholder} onChange={update} />
        ) : (
          <Field label={`${label} ${index + 1}`} type={type} value={value} placeholder={placeholder} onChange={update} />
        )
      }
    />
  );
}
