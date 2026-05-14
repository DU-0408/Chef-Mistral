/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // Proxy /api/* to the backend service.
  // In dev: BACKEND_URL defaults to http://localhost:8000
  // In K8s: BACKEND_URL is set to http://backend.qchef.svc.cluster.local:8000
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
