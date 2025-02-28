/** @type {import('next').NextConfig} */
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.APP_ENV || "development"}` });

console.log("Loaded ENV File:", `.env.${process.env.APP_ENV || "development"}`);

const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gateway.pinata.cloud',
                port: '',
                pathname: '/ipfs/**',
            },
        ],
    },
    // Update WebSocket proxy to point to your Railway backend
    async rewrites() {
        return [
            {
                source: '/socket.io/:path*',
                destination: 'https://web-production-14046.up.railway.app/socket.io/:path*',
            },
        ];
    },
};

export default nextConfig;