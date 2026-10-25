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
};

export default nextConfig;
