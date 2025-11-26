import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
    /* config options here */
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Cloudflare Pages/Workers compatibility
    output: undefined, // Let @cloudflare/next-on-pages handle the output
    // Ensure proper fetch handling for Cloudflare Workers
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default withFlowbiteReact(nextConfig);