import Link from "next/link";
import { Polaroid } from "@/components/era/Polaroid";
import { content } from "@/lib/content";
import type { Product } from "@/types/content";
import styles from "./ProductPiece.module.css";

/** Un producto como pieza editorial: foto en polaroid y, al lado, datos y compra */
export async function ProductPiece({ product, rotate }: { product: Product; rotate: number }) {
  const work = product.workId ? (await content()).getWork(product.workId) : undefined;
  const readHref = work?.type === "libro" ? work.href : undefined;

  return (
    <article className={styles.piece}>
      <div className={styles.photo}>
        <Polaroid src={product.image.src} alt={product.image.alt} rotate={rotate} />
      </div>
      <div className={styles.text}>
        <p className={styles.format}>{product.format}</p>
        <h2 className={styles.name}>{product.name}</h2>
        <p className={styles.description}>{product.description}</p>
        {product.price ? <p className={styles.price}>{product.price}</p> : null}
        <div className={styles.actions}>
          <a
            className={styles.buy}
            href={product.buy.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Comprar en {product.buy.store}
            <span className={styles.srOnly}> (se abre en una pestaña nueva)</span>
          </a>
          {readHref ? (
            <Link className={styles.read} href={readHref}>
              Leer en línea
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
