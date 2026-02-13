/** @type {import('next').NextConfig} */
// Force Rebuild: 2026-01-14 T20:00
const nextConfig = {
    // output: 'export', // Disabled to support Server Actions/DB
    images: {
        unoptimized: true,
        localPatterns: [
            {
                pathname: '/logo.png',
                search: '?v=*',
            },
        ],
    },
};

export default nextConfig;
