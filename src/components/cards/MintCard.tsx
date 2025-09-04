"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUnits, parseUnits } from 'viem';
import { InfoIcon } from '../ui/Tooltip';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function MintCard() {
  const { address } = useAccount();
  const [mintForm, setMintForm] = useState({ to: '', amount: '' });

  // Read contract data
  const { data: MINTER_ROLE } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'MINTER_ROLE',
  });

  const { data: isMinter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasRole',
    args: MINTER_ROLE && address ? [MINTER_ROLE, address] : undefined,
    query: { enabled: !!MINTER_ROLE && !!address },
  });

  const { data: trialMinterAllowance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialMinterAllowance',
  });

  const { data: trialMinterDuration } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialMinterDuration',
  });

  const { data: lastTrialAt } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'lastTrialAt',
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
  const { writeContract: mintTokens, data: mintTxHash, error: mintError, isPending: mintPending } = useWriteContract();
  const { isLoading: mintTxLoading, isSuccess: mintTxSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
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

  const minterTrialActive = lastTrialAt && trialMinterDuration ? 
    isTrialActive(lastTrialAt as bigint, trialMinterDuration as bigint) : false;

  const canMint = () => {
    if (!isMinter) return false;
    const isAdmin = !lastTrialAt || lastTrialAt === BigInt(0);
    return isAdmin || minterTrialActive;
  };

  const getMinterStatus = () => {
    if (!isMinter) return { status: "None", color: "gray" };
    const isAdmin = !lastTrialAt || lastTrialAt === BigInt(0);
    if (isAdmin) return { status: "Admin", color: "blue" };
    if (minterTrialActive) return { status: "Trial Active", color: "green" };
    return { status: "Trial Expired", color: "yellow" };
  };

  const getRemainingAllowance = () => {
    if (!trialMinterAllowance || !decimals) return "0";
    return formatBalance(trialMinterAllowance as bigint, decimals as number);
  };

  // Transaction handler
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mintForm.to || !mintForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const amountWei = parseUnits(mintForm.amount, 18);
      
      mintTokens({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [mintForm.to as `0x${string}`, amountWei],
      });
      
      toast('Mint transaction submitted!');
    } catch (error: any) {
      toast.error(`Mint failed: ${error?.message || 'Unknown error'}`);
    }
  };

  // Success handler
  useEffect(() => {
    if (mintTxSuccess) {
      toast.success('Tokens minted successfully!');
      setMintForm({ to: '', amount: '' });
    }
  }, [mintTxSuccess]);

  // Error handler
  useEffect(() => {
    if (mintError) {
      toast.error(`Mint failed: ${mintError.message}`);
    }
  }, [mintError]);

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Mint Tokens
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-white/70">Connect wallet to mint tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Mint Tokens
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            canMint() 
              ? getMinterStatus().color === "blue"
                ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                : "bg-green-500/20 text-green-300 border border-green-400/30"
              : "bg-red-500/20 text-red-300 border border-red-400/30"
          }`}>
            {canMint() ?
              getMinterStatus().color === "blue" ? "Admin Access" : "Trial Access"
              : "No Access"
            }
          </span>
          <InfoIcon 
            tooltip="Create new tokens and send them to any address. Requires minter role (admin or active trial)." 
            position="left"
          />
        </div>
      </div>

      {/* Remaining Allowance */}
      {canMint() && (
        <div className="bg-black/20 rounded-lg p-3 mb-4">
          <div className="flex items-center mb-1">
            <span className="text-white/70 text-sm">Remaining Allowance</span>
            <InfoIcon 
              tooltip="How many tokens you can still mint in your current trial period" 
              position="top"
            />
          </div>
          <p className="text-white font-semibold">
            {getRemainingAllowance()} {symbol as string || "Tokens"}
          </p>
        </div>
      )}

      <form onSubmit={handleMint} className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-white/70 text-sm font-medium">
              To Address
            </label>
            <InfoIcon 
              tooltip="The wallet address that will receive the newly minted tokens" 
              position="right"
            />
          </div>
          <input
            type="text"
            placeholder="0x..."
            value={mintForm.to}
            onChange={(e) => setMintForm(prev => ({ ...prev, to: e.target.value }))}
            disabled={!canMint()}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-white/70 text-sm font-medium">
              Amount (whole tokens)
            </label>
            <InfoIcon 
              tooltip="Number of tokens to mint. Enter whole numbers (e.g., 100 for 100 tokens)" 
              position="right"
            />
          </div>
          <input
            type="number"
            placeholder="1.0"
            step="0.000000000000000001"
            value={mintForm.amount}
            onChange={(e) => setMintForm(prev => ({ ...prev, amount: e.target.value }))}
            disabled={!canMint()}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={!canMint() || mintPending || mintTxLoading || !mintForm.to || !mintForm.amount}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {(mintPending || mintTxLoading) ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mintPending ? "Confirming..." : "Processing..."}
            </>
          ) : !canMint() ? (
            "Minter Access Required"
          ) : (
            "Mint Tokens"
          )}
        </button>
      </form>

      {!canMint() && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
          <p className="text-yellow-100 text-sm">
            ⚠️ You need active minter access to mint tokens. Request a trial in the Trials section.
          </p>
        </div>
      )}
    </div>
  );
}
