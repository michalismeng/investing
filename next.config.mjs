import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default nextConfig;

export const webpack = (config, { isServer }) => {
  if (isServer) {
    config.plugins = [...config.plugins, new PrismaPlugin()];
  }

  return config;
};
