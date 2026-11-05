import type { NextConfig } from "next";

const PRIVATE_RESULT_HEADERS = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  async headers() {
    return [
      {
        source: "/track/:path*",
        headers: PRIVATE_RESULT_HEADERS,
      },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        condition: {
          all: [{ not: "foreign" }, { not: { path: /\.module\.css$/ } }],
        },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
