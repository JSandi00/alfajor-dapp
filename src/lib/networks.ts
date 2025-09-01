// Network utilities for wagmi v2
export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 5:
      return 'Goerli Testnet';
    case 137:
      return 'Polygon';
    case 80001:
      return 'Polygon Mumbai';
    case 56:
      return 'BSC';
    case 97:
      return 'BSC Testnet';
    case 43114:
      return 'Avalanche';
    case 43113:
      return 'Avalanche Fuji';
    case 250:
      return 'Fantom';
    case 4002:
      return 'Fantom Testnet';
    case 42161:
      return 'Arbitrum One';
    case 421613:
      return 'Arbitrum Goerli';
    case 10:
      return 'Optimism';
    case 420:
      return 'Optimism Goerli';
    default:
      return 'Unknown Network';
  }
};

export const isTestnet = (chainId: number): boolean => {
  const testnets = [11155111, 5, 80001, 97, 43113, 4002, 421613, 420];
  return testnets.includes(chainId);
};

export const isSepoliaTestnet = (chainId: number): boolean => {
  return chainId === 11155111;
};
