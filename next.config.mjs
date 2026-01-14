/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        localPatterns: [
            {
                pathname: '/logo.png',
                search: '?v=*',
            },
        ],
    },
};

export default nextConfig;
