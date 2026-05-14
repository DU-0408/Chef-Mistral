/** @type {import('next').NextConfig} */

const backendUrl =
  process.env.BACKEND_URL ??
  "http://localhost:8000";

console.log("Using BACKEND_URL:", backendUrl);

const nextConfig = {
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;