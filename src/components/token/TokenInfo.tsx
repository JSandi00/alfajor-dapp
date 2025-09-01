'use client';

import { useAccount } from 'wagmi';
import { useTokenInfo, useTokenBalance } from '@/lib/token-hooks';
import { isContractConfigured, validateContractConfig, CONTRACT_ADDRESS } from '@/lib/contract';

/**
 * Token Information Display Component
 * Shows basic token info and user balance
 */
export function TokenInfo() {
  const { address } = useAccount();
  const { name, symbol, decimals, totalSupply, isLoading: tokenLoading } = useTokenInfo();
  const { balance, formattedBalance, isLoading: balanceLoading } = useTokenBalance(address);

  // Check if contract is properly configured
  const isConfigured = isContractConfigured();
  const { isValid, errors } = validateContractConfig();

  if (!isConfigured) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6">
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <span className="text-yellow-100 font-semibold">Contract Not Configured</span>
        </div>
        <p className="text-yellow-100/80 text-sm mb-4">
          Please configure your ControlledTokenExtended contract address and ABI in <code className="bg-black/20 px-1 rounded">src/lib/contract.ts</code>
        </p>
        <p className="text-yellow-100/60 text-xs">
          See <code>CONTRACT_SETUP.md</code> for detailed instructions.
        </p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-red-100 font-semibold">Configuration Errors</span>
        </div>
        <ul className="text-red-100/80 text-sm space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-pulse">
        <div className="h-6 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded mb-2"></div>
        <div className="h-4 bg-white/20 rounded mb-2"></div>
        <div className="h-4 bg-white/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      {/* Token Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">
            {name || 'ControlledTokenExtended'}
          </h3>
          <p className="text-white/70 text-sm">
            {symbol || 'CTE'} • {decimals} decimals
          </p>
        </div>
        <div className="bg-blue-500/20 px-3 py-1 rounded-full">
          <span className="text-blue-200 text-xs font-medium">ERC20</span>
        </div>
      </div>

      {/* Contract Address */}
      <div className="mb-4">
        <p className="text-white/70 text-sm mb-2">Contract Address:</p>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-white font-mono text-xs break-all">
            {CONTRACT_ADDRESS}
          </p>
        </div>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-4">
          <p className="text-white/70 text-sm mb-1">Total Supply</p>
          <p className="text-white text-lg font-semibold">
            {totalSupply ? (
              Number(totalSupply) / Math.pow(10, decimals || 18)
            ).toLocaleString() : '--'}
          </p>
        </div>
        
        {address && (
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-white/70 text-sm mb-1">Your Balance</p>
            {balanceLoading ? (
              <div className="h-6 bg-white/20 rounded animate-pulse"></div>
            ) : (
              <p className="text-white text-lg font-semibold">
                {formattedBalance || '0.0000'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-between bg-green-500/20 border border-green-400/30 rounded-lg p-3">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
          <span className="text-green-100 text-sm font-medium">
            Contract Ready
          </span>
        </div>
        <span className="text-green-100/70 text-xs">
          Sepolia Testnet
        </span>
      </div>
    </div>
  );
}
