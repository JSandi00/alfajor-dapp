"use client";

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUnits } from 'viem';
import { InfoIcon } from '../ui/Tooltip';

export function StatusCard() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'decimals',
  });

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'symbol',
  });

  const formatBalance = (balance: bigint, decimals: number) => {
    return parseFloat(formatUnits(balance, decimals)).toFixed(4);
  };

  if (!isConnected || !address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Wallet Status
          </h3>
        </div>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <p className="text-white/70">Connect your wallet to view status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Wallet Status
        </h3>
        <span className="text-green-200 text-sm font-medium bg-green-500/20 px-3 py-1 rounded-full">
          Connected
        </span>
      </div>

      <div className="space-y-4">
        {/* Wallet Address */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-white/70 text-sm font-medium">Address</span>
            <InfoIcon 
              tooltip="Your connected wallet address that will interact with the contract" 
              position="right"
            />
          </div>
          <div className="bg-black/20 rounded-lg p-3 font-mono text-sm">
            <p className="text-white break-all">
              {address}
            </p>
          </div>
        </div>

        {/* Token Balance */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-white/70 text-sm font-medium">Token Balance</span>
            <InfoIcon 
              tooltip="Your current balance of the contract's tokens" 
              position="right"
            />
          </div>
          {balanceLoading ? (
            <div className="bg-black/20 rounded-lg p-3 animate-pulse">
              <div className="h-6 bg-white/20 rounded"></div>
            </div>
          ) : (
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-white text-lg font-semibold">
                {balance && decimals ? formatBalance(balance as bigint, decimals as number) : "0.0000"} {symbol as string || "Tokens"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
