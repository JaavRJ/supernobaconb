/** Secciones del admin: las usan la navegación del encabezado y la portada */
export interface AdminSection {
  href: string;
  label: string;
  description: string;
}

export const adminSections: AdminSection[] = [
  { href: "/admin/obras", label: "Obras", description: "Sencillos, EP y álbumes, y su lugar en el cielo." },
  { href: "/admin/canciones", label: "Canciones", description: "Letras, créditos, audios y videos." },
  { href: "/admin/hilos", label: "Hilos y nebulosa", description: "Conexiones entre obras y señales de la nebulosa." },
  { href: "/admin/fotos", label: "Fotos y tienda", description: "Galería, productos, Sobre mí y redes." },
  { href: "/admin/diario", label: "Diario y escritos", description: "Entradas del proceso, letras, poemas y textos." },
  { href: "/admin/libro", label: "Libro", description: "Partes, capítulos y notas del autor." },
  { href: "/admin/newsletter", label: "Newsletter", description: "Suscriptores y descarga de la lista." },
  { href: "/admin/importar", label: "Importar", description: "Pasar el contenido local a Firestore." },
];
