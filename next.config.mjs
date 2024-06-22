/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
        includePaths: ['./styles'],
    },
    images: {
        domains: ['s3-external-1.amazonaws.com'],
    },
}

export default nextConfig
