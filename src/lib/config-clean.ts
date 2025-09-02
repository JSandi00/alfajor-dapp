// Alternative configuration to completely disable external analytics
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Web3 Sepolia App',
  projectId: 'd7a54b9d10f44c92bab52ede7118efbc',
  chains: [sepolia],
  ssr: true,
});

// Optional: For production, you might want to add custom transport
// to have more control over network requests
export const configWithCustomTransport = getDefaultConfig({
  appName: 'Web3 Sepolia App',
  projectId: 'd7a54b9d10f44c92bab52ede7118efbc',
  chains: [sepolia],
  ssr: true,
  // You can uncomment this if you want to use custom RPC
  // transports: {
  //   [sepolia.id]: http('https://your-custom-rpc-url'),
  // },
});
