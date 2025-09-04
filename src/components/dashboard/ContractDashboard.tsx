"use client";

import { useAccount } from 'wagmi';
import { isAdmin } from '@/lib/contract';
import { ContractHeader } from '@/components/ui';
import { StatusCard, TrialsCard, MintCard, BurnCard, AllowanceCard, AdminPanel } from '@/components/cards';

export function ContractDashboard() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        <svg className="w-16 h-16 text-white/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-white/70 mb-6">Connect your wallet to interact with the Alfajor token contract</p>
        <div className="space-y-4 text-left max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white/80 text-sm">View your token balance</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-white/80 text-sm">Request trial access for minting/burning</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span className="text-white/80 text-sm">Mint, burn, and transfer tokens</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-white/80 text-sm">Manage token allowances</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Contract Header */}
      <ContractHeader />

      {/* Cards Grid Layout */}
      <div className="space-y-6 md:space-y-8">
        {/* Row 1: Status and Trials */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <StatusCard />
          <TrialsCard />
        </div>

        {/* Row 2: Mint and Burn */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <MintCard />
          <BurnCard />
        </div>

        {/* Row 3: Allowance (Full Width) */}
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <AllowanceCard />
        </div>

        {/* Admin Panel (Full Width) - Only for admin users */}
        {isAdmin(address) && (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-purple-400/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-6 h-6 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Admin Control Panel
                </h3>
                <span className="text-purple-200 text-sm font-medium bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                  Administrator Access
                </span>
              </div>
              <AdminPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
