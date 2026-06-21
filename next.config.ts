import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  // Enable standalone output for Docker container deployments
  output: "standalone",

  // Enable strict mode for React
  reactStrictMode: true,
 
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://maps.googleapis.com https://lh3.googleusercontent.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
              "frame-src 'self' https://*.firebaseapp.com",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
    ];
  },
 
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
      },
    ],
  },
 
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
 
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};
 
export default nextConfig;
