import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
    /* config options here */
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Cloudflare Pages/Workers compatibility
    output: undefined, // Let @cloudflare/next-on-pages handle the output
};

export default withFlowbiteReact(nextConfig);