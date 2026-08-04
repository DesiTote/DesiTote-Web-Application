/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'desitotes-media.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**', // Allows loading any file inside your bucket
      },
    ],
  },
};

export default nextConfig;