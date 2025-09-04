"use client";

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export function ContractHeader() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'symbol',
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'decimals',
  });

  const formatSupply = () => {
    if (!totalSupply || !decimals) return "0";
    const supply = Number(totalSupply) / Math.pow(10, Number(decimals));
    return supply.toLocaleString();
  };

  const etherscanUrl = `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 mb-6 md:mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Contract Info */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {name as string || "Loading..."} ({symbol as string || "..."})
            </h1>
            <p className="text-white/70 text-xs md:text-sm">
              Total Supply: {formatSupply()} {symbol as string || "tokens"}
            </p>
          </div>
        </div>

        {/* Contract Address & Etherscan Link */}
        <div className="flex flex-col lg:items-end gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-white/70 text-sm">Contract:</span>
            <code className="bg-black/20 px-2 py-1 rounded text-white/90 text-xs font-mono">
              {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
            </code>
          </div>
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-300 hover:text-blue-200 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            <span>View on Etherscan</span>
          </a>
        </div>
      </div>
    </div>
  );
}
