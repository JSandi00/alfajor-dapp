import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Web3 Sepolia App',
  projectId: 'd7a54b9d10f44c92bab52ede7118efbc', // Get this from https://cloud.walletconnect.com
  chains: [sepolia],
  ssr: true,
});
