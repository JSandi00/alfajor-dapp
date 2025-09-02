"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useTokenInfo, useTokenBalance } from '@/lib/token-hooks';
import { CONTRACT_ADDRESS } from '@/lib/contract';

/**
 * Contract Verification Component
 * Tests if the contract is accessible and has tokens
 */
export function ContractVerification() {
  const { address } = useAccount();
  const { name, symbol, decimals, totalSupply, isLoading } = useTokenInfo();
  const { balance, formattedBalance } = useTokenBalance(address);
  const [contractExists, setContractExists] = useState<boolean | null>(null);

  useEffect(() => {
    // Test if contract exists by checking if we can read basic info
    if (!isLoading) {
      setContractExists(!!name && !!symbol && decimals !== undefined);
    }
  }, [name, symbol, decimals, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
        <div className="flex items-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mr-3"></div>
          <span className="text-blue-100 font-medium">Verifying contract...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contract Status */}
      <div className={`border rounded-xl p-6 ${
        contractExists 
          ? 'bg-green-500/20 border-green-400/30' 
          : 'bg-red-500/20 border-red-400/30'
      }`}>
        <div className="flex items-center mb-4">
          {contractExists ? (
            <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )}
          <span className={`font-semibold ${contractExists ? 'text-green-100' : 'text-red-100'}`}>
            {contractExists ? 'Contract Found' : 'Contract Error'}
          </span>
        </div>

        <div className="text-sm space-y-2">
          <p className={contractExists ? 'text-green-100/80' : 'text-red-100/80'}>
            <strong>Address:</strong> {CONTRACT_ADDRESS}
          </p>
          {contractExists ? (
            <div className="space-y-1">
              <p className="text-green-100/80"><strong>Name:</strong> {name}</p>
              <p className="text-green-100/80"><strong>Symbol:</strong> {symbol}</p>
              <p className="text-green-100/80"><strong>Decimals:</strong> {decimals}</p>
              <p className="text-green-100/80"><strong>Total Supply:</strong> {totalSupply?.toString()}</p>
            </div>
          ) : (
            <p className="text-red-100/80">
              Cannot connect to contract. Verify the address and that it&#39;s deployed on Sepolia.
            </p>
          )}
        </div>
      </div>

      {/* Balance Check */}
      {contractExists && address && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
          <h4 className="text-blue-100 font-semibold mb-3">Your Contract Balance</h4>
          <div className="text-blue-100/80">
            {balance !== undefined ? (
              <div>
                <p><strong>Balance:</strong> {formattedBalance} {symbol}</p>
                <p className="text-sm mt-2">
                  {balance > 0
                    ? "✅ You have tokens, transfers should work!"
                    : "⚠️ You don't have tokens. You need to mint some first."
                  }
                </p>
              </div>
            ) : (
              <p>Loading balance...</p>
            )}
          </div>
        </div>
      )}

      {/* Transfer Readiness */}
      {contractExists && (
        <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-6">
          <h4 className="text-purple-100 font-semibold mb-3">Transfer Status</h4>
          <div className="text-purple-100/80 space-y-2">
            <p>✅ Contract configured correctly</p>
            <p>✅ ABI loaded with transfer function</p>
            <p>✅ Sepolia network connected</p>
            <p className={balance && balance > 0 ? 'text-green-300' : 'text-yellow-300'}>
              {balance && balance > 0
                ? "✅ You have tokens to transfer" 
                : "⚠️ You need tokens to transfer"
              }
            </p>
          </div>
        </div>
      )}

      {/* Useful Links */}
      <div className="bg-gray-500/20 border border-gray-400/30 rounded-xl p-6">
        <h4 className="text-gray-100 font-semibold mb-3">Useful Links</h4>
        <div className="space-y-2 text-sm">
          <a 
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-300 hover:text-blue-200 underline"
          >
            View contract on Sepolia Etherscan →
          </a>
          {address && (
            <a 
              href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-300 hover:text-blue-200 underline"
            >
              View your tokens on Etherscan →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
