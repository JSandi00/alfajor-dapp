// Alternative configuration to completely disable external analytics
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Web3 Sepolia App',
  projectId: 'd7a54b9d10f44c92bab52ede7118efbc',
  chains: [sepolia],
  ssr: true,
  
  // Disable analytics and telemetry
  appInfo: {
    appName: 'Web3 Sepolia App',
    // Remove all external links to prevent analytics calls
    learnMoreUrl: undefined,
    disclaimer: undefined,
  },
});

// Optional: For production, you might want to add custom transport
// to have more control over network requests
export const configWithCustomTransport = getDefaultConfig({
  appName: 'Web3 Sepolia App',
  projectId: 'd7a54b9d10f44c92bab52ede7118efbc',
  chains: [sepolia],
  ssr: true,
  
  // Custom configuration to minimize external calls
  appInfo: {
    appName: 'Web3 Sepolia App',
  },
  
  // You can uncomment this if you want to use custom RPC
  // transports: {
  //   [sepolia.id]: http('https://your-custom-rpc-url'),
  // },
});
