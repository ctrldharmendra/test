// const nextConfig = {
//   reactStrictMode: false,
// devIndicators: {
//     autoPrerender: false,
//   },
//   allowedDevOrigins: ['192.168.16.101', '192.168.2.240'],
// };

// export default nextConfig;



const nextConfig = {
  reactStrictMode: false,
  devIndicators: {
    autoPrerender: false,
  },
  
  allowedDevOrigins: ['192.168.16.101', '192.168.2.241'],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;