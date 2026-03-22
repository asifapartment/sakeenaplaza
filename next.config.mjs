/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
        ],

        // ➤ Add this
        qualities: [60, 65, 70, 75, 80, 90, 95, 100],
    },
    experimental: {
        serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    },
};

export default nextConfig;
