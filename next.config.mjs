/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Vercel deployment, we don't need static export
  // Vercel natively supports Next.js server-side features
  // If you need static export for other hosts, uncomment the line below
  // Note: Static export doesn't support authentication middleware
  // output: 'export',
  
  images: {
    unoptimized: true, // Required if using static export
  },
};

export default nextConfig;
