"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { getNetworkName, isSepoliaTestnet } from '@/lib/networks';
import { TokenInfo, TokenTransfer, ContractDiagnostics } from '@/components/token';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 animate-pulse">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-12 bg-white/10 rounded-lg mb-8 animate-pulse"></div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="h-10 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Alfajor Sepolia App
            </h1>
            <p className="text-white/70 text-lg">
              Connect your wallet and interact with Alfajor contract
            </p>
          </div>
          
          {/* Wallet Connection Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl mb-8 text-center">
            {/* Connect button */}
            <div className="mb-8">
              <ConnectButton />
            </div>
            
            {/* Connected state */}
            {isConnected && address ? (
              <div className="space-y-6">
                {/* Success message */}
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-green-100 font-semibold">Wallet Connected!</span>
                  </div>
                </div>

                {/* Wallet details */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  {/* Address */}
                  <div>
                    <p className="text-white/70 text-sm font-medium mb-2">
                      Wallet Address:
                    </p>
                    <div className="bg-black/20 rounded-lg p-3 font-mono text-sm">
                      <p className="text-white break-all">
                        {address}
                      </p>
                    </div>
                  </div>

                  {/* Balance */}
                  {balance && (
                    <div>
                      <p className="text-white/70 text-sm font-medium mb-2">
                        Balance:
                      </p>
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-white text-lg font-semibold">
                          {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Network info */}
                  <div>
                    <p className="text-white/70 text-sm font-medium mb-2">
                      Network:
                    </p>
                    <div className="flex items-center bg-black/20 rounded-lg p-3">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        isSepoliaTestnet(chainId) ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <p className="text-white">
                        {getNetworkName(chainId)} ({chainId})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Network warning */}
                {chainId && !isSepoliaTestnet(chainId) && (
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
                    <p className="text-yellow-100 text-sm">
                      ⚠️ Please switch to Sepolia testnet for the best experience
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Disconnected state */
              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-blue-100 font-semibold">Ready to Connect</span>
                  </div>
                  <p className="text-blue-100/80 text-sm">
                    Click the connect button above to link your wallet and see your address
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Contract Interaction Section */}
          {isConnected && address && (
            <div className="space-y-8">
              {/* Contract Verification Toggle */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowVerification(!showVerification)}
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    showVerification 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {showVerification ? (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                  {showVerification ? 'Hide Diagnostics' : 'Show Contract Diagnostics'}
                </button>
                
                <p className="text-white/60 text-sm text-center">
                  {showVerification 
                    ? 'Diagnostic panel is open - see detailed contract status below'
                    : 'Click to verify your contract setup and troubleshoot issues'
                  }
                </p>
              </div>
              
              {/* Contract Verification Section */}
              {showVerification && (
                <div className="animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    Contract Diagnostics
                  </h2>
                  <ContractDiagnostics />
                </div>
              )}
              
              {/* Token Functions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Token Information */}
                <TokenInfo />
                
                {/* Token Transfer */}
                <TokenTransfer />
              </div>
            </div>
          )}
          
          {/* Footer info */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-white/50 text-sm">
              Make sure you&#39;re connected to <strong className="text-white/70">Sepolia testnet</strong>
            </p>
            <p className="text-white/40 text-xs">
              Need test ETH? Visit{' '}
              <a 
                href="https://sepoliafaucet.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline"
              >
                Sepolia Faucet
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
