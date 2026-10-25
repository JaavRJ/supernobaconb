export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface Site {
  name: string;
  description: string;
  nav: NavItem[];
  social: SocialLink[];
}

export const site: Site = {
  name: "Supernoba",
  description: "Sitio oficial de Supernoba: música, libros y proyectos.",
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Música", href: "/musica" },
    { label: "Libros", href: "/libros" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Videos", href: "/videos" },
    { label: "Tienda", href: "/tienda" },
    { label: "Sobre mí", href: "/sobre-mi" },
  ],
  social: [
    { label: "Spotify", href: "https://open.spotify.com/artist/3DYjzvSLoweDPSqo7hJUMb" },
    { label: "Apple Music", href: "https://music.apple.com/es/artist/supernoba/1885508885" },
    { label: "YouTube", href: "https://www.youtube.com/@supernobaconb" },
  ],
};
