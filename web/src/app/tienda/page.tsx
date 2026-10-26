import { ProductPiece } from "@/components/shop/ProductPiece";
import { getProducts } from "@/content";
import styles from "./page.module.css";

export const metadata = {
  title: "Tienda",
  description:
    "Dónde comprar el libro impreso de Brillo de una Estrella Muerta y lo que venga de Supernoba.",
};

// Giros leves fijos, alternados entre productos
const TILTS = [-2.5, 2];

export default function TiendaPage() {
  const products = getProducts();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tienda</h1>
        <p className={styles.tagline}>lo que se puede tener en las manos</p>
      </header>
      <div className={styles.products}>
        {products.map((product, i) => (
          <ProductPiece key={product.id} product={product} rotate={TILTS[i % TILTS.length]} />
        ))}
      </div>
      <p className={styles.more}>Discos y más cosas vendrán después.</p>
    </div>
  );
}
