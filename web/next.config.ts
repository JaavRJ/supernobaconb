import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La raíz del repo tiene otro package-lock.json (el sitio viejo); fijamos web/ como raíz.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/dgrhyyuef/**" }],
  },
  // URLs del sitio viejo: /parte1 … /parte4 ahora viven en el lector
  async redirects() {
    return [1, 2, 3, 4].map((n) => ({
      source: `/parte${n}`,
      destination: `/libros/bduem/leer/parte-${n}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
