'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useTokenInfo, useTokenBalance } from '@/lib/token-hooks';
import { CONTRACT_ADDRESS, validateContractConfig } from '@/lib/contract';
import { getNetworkName, isSepoliaTestnet } from '@/lib/networks';

/**
 * Contract Diagnostics Component
 * Comprehensive testing and validation of contract setup
 */
export function ContractDiagnostics() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { name, symbol, decimals, totalSupply, isLoading } = useTokenInfo();
  const { balance, formattedBalance, isLoading: balanceLoading } = useTokenBalance(address);
  
  const [diagnosticResults, setDiagnosticResults] = useState({
    contractConfig: false,
    contractExists: false,
    networkCorrect: false,
    walletConnected: false,
    hasTokens: false,
    canTransfer: false
  });

  useEffect(() => {
    const runDiagnostics = () => {
      const { isValid } = validateContractConfig();
      const contractExists = !!name && !!symbol && decimals !== undefined;
      const networkCorrect = isSepoliaTestnet(chainId);
      const walletConnected = isConnected && !!address;
      const hasTokens = balance !== undefined && balance > 0n;
      const canTransfer = contractExists && networkCorrect && walletConnected && hasTokens;

      setDiagnosticResults({
        contractConfig: isValid,
        contractExists,
        networkCorrect,
        walletConnected,
        hasTokens,
        canTransfer
      });
    };

    if (!isLoading && !balanceLoading) {
      runDiagnostics();
    }
  }, [isLoading, balanceLoading, name, symbol, decimals, chainId, isConnected, address, balance]);

  const DiagnosticItem = ({ 
    label, 
    status, 
    description, 
    action 
  }: { 
    label: string; 
    status: boolean; 
    description: string;
    action?: string;
  }) => (
    <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
        status ? 'bg-green-500' : 'bg-red-500'
      }`}>
        {status ? (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium">{label}</h4>
        <p className="text-white/70 text-sm mt-1">{description}</p>
        {action && !status && (
          <p className="text-yellow-300 text-sm mt-2">💡 {action}</p>
        )}
      </div>
    </div>
  );

  if (isLoading || balanceLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mr-3"></div>
          <span className="text-white font-medium">Running diagnostics...</span>
        </div>
      </div>
    );
  }

  const overallStatus = Object.values(diagnosticResults).every(result => result);

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`border rounded-xl p-6 ${
        overallStatus 
          ? 'bg-green-500/20 border-green-400/30' 
          : 'bg-yellow-500/20 border-yellow-400/30'
      }`}>
        <div className="flex items-center mb-4">
          {overallStatus ? (
            <svg className="w-8 h-8 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          )}
          <div>
            <h3 className={`text-xl font-bold ${overallStatus ? 'text-green-100' : 'text-yellow-100'}`}>
              {overallStatus ? 'All Systems Ready!' : 'Setup Required'}
            </h3>
            <p className={`text-sm ${overallStatus ? 'text-green-100/80' : 'text-yellow-100/80'}`}>
              {overallStatus 
                ? 'Your contract is fully configured and ready for transfers.'
                : 'Some configuration steps are needed before transfers will work.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-6">Diagnostic Results</h3>
        
        <div className="space-y-4">
          <DiagnosticItem
            label="Contract Configuration"
            status={diagnosticResults.contractConfig}
            description={`Contract address: ${CONTRACT_ADDRESS}`}
            action="Check that CONTRACT_ADDRESS and CONTRACT_ABI are properly set in src/lib/contract.ts"
          />

          <DiagnosticItem
            label="Contract Accessibility"
            status={diagnosticResults.contractExists}
            description={
              diagnosticResults.contractExists
                ? `Contract found: ${name} (${symbol}), ${decimals} decimals`
                : "Unable to read contract data"
            }
            action="Verify contract is deployed on Sepolia and ABI is correct"
          />

          <DiagnosticItem
            label="Network Connection"
            status={diagnosticResults.networkCorrect}
            description={`Connected to: ${getNetworkName(chainId)} (${chainId})`}
            action="Switch to Sepolia testnet (Chain ID: 11155111)"
          />

          <DiagnosticItem
            label="Wallet Connection"
            status={diagnosticResults.walletConnected}
            description={
              diagnosticResults.walletConnected
                ? `Connected: ${address}`
                : "No wallet connected"
            }
            action="Connect your wallet using the Connect Wallet button"
          />

          <DiagnosticItem
            label="Token Balance"
            status={diagnosticResults.hasTokens}
            description={
              diagnosticResults.hasTokens
                ? `Balance: ${formattedBalance} ${symbol}`
                : balance === 0n 
                  ? "Balance: 0 tokens"
                  : "Unable to check balance"
            }
            action="You need tokens to transfer. Try minting or requesting trial tokens."
          />

          <DiagnosticItem
            label="Transfer Ready"
            status={diagnosticResults.canTransfer}
            description={
              diagnosticResults.canTransfer
                ? "All requirements met for token transfers"
                : "Transfer functionality not available"
            }
            action="Complete all above requirements to enable transfers"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            View on Etherscan
          </a>

          {address && (
            <a
              href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              Your Token Holdings
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
