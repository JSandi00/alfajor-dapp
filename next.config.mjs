/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle node polyfills
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      os: false,
      url: false
    };
    
    // External packages that should not be bundled
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Improve caching
    if (!isServer) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        compression: 'gzip'
      };
    }
    
    return config;
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
