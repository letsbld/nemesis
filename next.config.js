const withFlowbiteReact = require('flowbite-react/plugin/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = withFlowbiteReact(nextConfig);

