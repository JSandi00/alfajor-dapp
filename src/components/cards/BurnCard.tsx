"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUnits, parseUnits } from 'viem';
import { InfoIcon } from '../ui/Tooltip';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function BurnCard() {
  const { address } = useAccount();
  const [burnAmount, setBurnAmount] = useState('');

  // Read contract data
  const { data: BURNER_ROLE } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'BURNER_ROLE',
  });

  const { data: isBurner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasRole',
    args: BURNER_ROLE && address ? [BURNER_ROLE, address] : undefined,
    query: { enabled: !!BURNER_ROLE && !!address },
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: trialBurnerDuration } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialBurnerDuration',
  });

  const { data: lastTrialBurnerAt } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'lastTrialBurnerAt',
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

  // Transaction hooks
  const { writeContract: burnTokens, data: burnTxHash, error: burnError, isPending: burnPending } = useWriteContract();
  const { isLoading: burnTxLoading, isSuccess: burnTxSuccess } = useWaitForTransactionReceipt({
    hash: burnTxHash,
  });

  // Helper functions
  const isTrialActive = (lastTrialTime: bigint, duration: bigint) => {
    if (!lastTrialTime || lastTrialTime === BigInt(0)) return false;
    const expiryTime = lastTrialTime + duration;
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    return currentTime < expiryTime;
  };

  const formatBalance = (balance: bigint, decimals: number) => {
    return parseFloat(formatUnits(balance, decimals)).toFixed(4);
  };

  const burnerTrialActive = lastTrialBurnerAt && trialBurnerDuration ? 
    isTrialActive(lastTrialBurnerAt as bigint, trialBurnerDuration as bigint) : false;

  const canBurn = () => {
    if (!isBurner) return false;
    const isAdmin = !lastTrialBurnerAt || lastTrialBurnerAt === BigInt(0);
    return isAdmin || burnerTrialActive;
  };

  const getBurnerStatus = () => {
    if (!isBurner) return { status: "None", color: "gray" };
    const isAdmin = !lastTrialBurnerAt || lastTrialBurnerAt === BigInt(0);
    if (isAdmin) return { status: "Admin", color: "blue" };
    if (burnerTrialActive) return { status: "Trial Active", color: "orange" };
    return { status: "Trial Expired", color: "yellow" };
  };

  // Transaction handler
  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!burnAmount) {
      toast.error('Please enter amount to burn');
      return;
    }

    try {
      const amountWei = parseUnits(burnAmount, 18);
      
      burnTokens({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'burn',
        args: [amountWei],
      });
      
      toast('Burn transaction submitted!');
    } catch (error: any) {
      toast.error(`Burn failed: ${error?.message || 'Unknown error'}`);
    }
  };

  // Success handler
  useEffect(() => {
    if (burnTxSuccess) {
      toast.success('Tokens burned successfully!');
      setBurnAmount('');
      refetchBalance();
    }
  }, [burnTxSuccess]);

  // Error handler
  useEffect(() => {
    if (burnError) {
      toast.error(`Burn failed: ${burnError.message}`);
    }
  }, [burnError]);

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Burn Tokens
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-white/70">Connect wallet to burn tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Burn Tokens
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            canBurn() 
              ? getBurnerStatus().color === "blue"
                ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                : "bg-red-500/20 text-red-300 border border-red-400/30"
              : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
          }`}>
            {canBurn() ?
              getBurnerStatus().color === "blue" ? "Admin Access" : "Trial Access"
              : "No Access"
            }
          </span>
          <InfoIcon 
            tooltip="Permanently destroy tokens from your balance. This action cannot be undone!" 
            position="left"
          />
        </div>
      </div>

      {/* Current Balance */}
      <div className="bg-black/20 rounded-lg p-3 mb-4">
        <div className="flex items-center mb-1">
          <span className="text-white/70 text-sm">Your Balance</span>
          <InfoIcon 
            tooltip="Your current token balance that can be burned" 
            position="top"
          />
        </div>
        <p className="text-white font-semibold">
          {balance && decimals ? formatBalance(balance as bigint, decimals as number) : "0.0000"} {symbol as string || "Tokens"}
        </p>
      </div>

      <form onSubmit={handleBurn} className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-white/70 text-sm font-medium">
              Amount to Burn (whole tokens)
            </label>
            <InfoIcon 
              tooltip="Number of tokens to burn. These tokens will be permanently removed from the total supply." 
              position="right"
            />
          </div>
          <input
            type="number"
            placeholder="1.0"
            step="0.000000000000000001"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            disabled={!canBurn()}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={!canBurn() || burnPending || burnTxLoading || !burnAmount}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {(burnPending || burnTxLoading) ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {burnPending ? "Confirming..." : "Processing..."}
            </>
          ) : !canBurn() ? (
            "Burner Access Required"
          ) : (
            "Burn Tokens"
          )}
        </button>
      </form>

      {!canBurn() && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
          <p className="text-yellow-100 text-sm">
            ⚠️ You need active burner access to burn tokens. Request a trial in the Trials section.
          </p>
        </div>
      )}
    </div>
  );
}
