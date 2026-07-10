import path from "node:path";

const projectRoot = path.resolve(process.cwd());

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      {
        source: "/app",
        destination: "/",
        permanent: true,
      },
      {
        source: "/app/shop",
        destination: "/catalog",
        permanent: true,
      },
      {
        source: "/app/vendors",
        destination: "/vendors",
        permanent: true,
      },
      {
        source: "/app/track",
        destination: "/track-order",
        permanent: true,
      },
      {
        source: "/app/cart",
        destination: "/cart",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
