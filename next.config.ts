import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 忽略 formidable 在服务端的打包问题
      config.externals.push({
        formidable: 'commonjs formidable',
      });
    }
    return config;
  },
  /* config options here */
};

export default nextConfig;
