import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
  },
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
  ],
  typescript: {
    // Disable type checking during build if needed
    ignoreBuildErrors: false,
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  output: 'standalone', // Untuk deployment standalone
  compress: true, // Aktifkan kompresi
  productionBrowserSourceMaps: false, // Nonaktifkan sourcemaps di production
};

export default withBundleAnalyzer(nextConfig);