/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {
        bodySizeLimit: "10mb", // หรือ "20mb" ตามที่ต้องการ
      },
    },
  };
  
  export default nextConfig;