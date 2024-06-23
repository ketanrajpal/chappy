/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
        includePaths: ['./styles'],
    },
    images: {
        domains: [
            's3-external-1.amazonaws.com',
            '1ywc2t8gphehkhvw.public.blob.vercel-storage.com',
        ],
    },
}

export default nextConfig
