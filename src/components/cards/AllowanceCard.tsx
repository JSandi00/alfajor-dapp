"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUnits, parseUnits } from 'viem';
import { InfoIcon } from '../ui/Tooltip';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function AllowanceCard() {
  const { address } = useAccount();
  const [allowanceForm, setAllowanceForm] = useState({ spender: '', amount: '' });
  const [burnFromForm, setBurnFromForm] = useState({ owner: '', amount: '' });

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

  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'allowance',
    args: burnFromForm.owner && address ? [burnFromForm.owner as `0x${string}`, address] : undefined,
    query: { enabled: !!burnFromForm.owner && !!address },
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
  const { writeContract: approveSpender, data: approveTxHash, error: approveError, isPending: approvePending } = useWriteContract();
  const { writeContract: burnFromOwner, data: burnFromTxHash, error: burnFromError, isPending: burnFromPending } = useWriteContract();

  const { isLoading: approveTxLoading, isSuccess: approveTxSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isLoading: burnFromTxLoading, isSuccess: burnFromTxSuccess } = useWaitForTransactionReceipt({
    hash: burnFromTxHash,
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

  const getCurrentAllowance = () => {
    if (!currentAllowance || !decimals) return "0";
    return formatBalance(currentAllowance as bigint, decimals as number);
  };

  const canBurnFrom = () => {
    return canBurn() && burnFromForm.owner && currentAllowance && currentAllowance as bigint > BigInt(0);
  };

  // Transaction handlers
  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allowanceForm.spender || !allowanceForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const amountWei = parseUnits(allowanceForm.amount, 18);
      
      approveSpender({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'approve',
        args: [allowanceForm.spender as `0x${string}`, amountWei],
      });
      
      toast('Approve transaction submitted!');
    } catch (error: any) {
      toast.error(`Approve failed: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleBurnFrom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!burnFromForm.owner || !burnFromForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!canBurnFrom()) {
      toast.error('Insufficient allowance or missing burner access');
      return;
    }

    try {
      const amountWei = parseUnits(burnFromForm.amount, 18);
      
      burnFromOwner({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'burnFrom',
        args: [burnFromForm.owner as `0x${string}`, amountWei],
      });
      
      toast('BurnFrom transaction submitted!');
    } catch (error: any) {
      toast.error(`BurnFrom failed: ${error?.message || 'Unknown error'}`);
    }
  };

  // Success handlers
  useEffect(() => {
    if (approveTxSuccess) {
      toast.success('Approval successful!');
      setAllowanceForm({ spender: '', amount: '' });
      refetchAllowance();
    }
  }, [approveTxSuccess]);

  useEffect(() => {
    if (burnFromTxSuccess) {
      toast.success('BurnFrom successful!');
      setBurnFromForm({ owner: '', amount: '' });
      refetchAllowance();
    }
  }, [burnFromTxSuccess]);

  // Error handlers
  useEffect(() => {
    if (approveError) {
      toast.error(`Approve failed: ${approveError.message}`);
    }
  }, [approveError]);

  useEffect(() => {
    if (burnFromError) {
      toast.error(`BurnFrom failed: ${burnFromError.message}`);
    }
  }, [burnFromError]);

  // Refetch allowance when owner changes
  useEffect(() => {
    if (burnFromForm.owner && address) {
      refetchAllowance();
    }
  }, [burnFromForm.owner, address, refetchAllowance]);

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            Allowance & BurnFrom
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-white/70">Connect wallet to manage allowances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          Allowance & BurnFrom
        </h3>
        <InfoIcon 
          tooltip="Approve others to spend your tokens, or burn tokens from approved accounts. This is a two-step process." 
          position="left"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Approve */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              1
            </div>
            <h4 className="text-lg font-medium text-white">Approve Spender</h4>
          </div>

          <form onSubmit={handleApprove} className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-white/70 text-sm font-medium">
                  Spender Address
                </label>
                <InfoIcon 
                  tooltip="The wallet address that will be allowed to spend your tokens (e.g., for burnFrom)" 
                  position="right"
                />
              </div>
              <input
                type="text"
                placeholder="0x..."
                value={allowanceForm.spender}
                onChange={(e) => setAllowanceForm(prev => ({ ...prev, spender: e.target.value }))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-white/70 text-sm font-medium">
                  Allowance Amount
                </label>
                <InfoIcon 
                  tooltip="Maximum number of tokens the spender can use on your behalf" 
                  position="right"
                />
              </div>
              <input
                type="number"
                placeholder="1.0"
                step="0.000000000000000001"
                value={allowanceForm.amount}
                onChange={(e) => setAllowanceForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
              />
            </div>

            <button
              type="submit"
              disabled={approvePending || approveTxLoading || !allowanceForm.spender || !allowanceForm.amount}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {(approvePending || approveTxLoading) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {approvePending ? "Confirming..." : "Processing..."}
                </>
              ) : (
                "Approve Spender"
              )}
            </button>
          </form>
        </div>

        {/* Step 2: BurnFrom */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              2
            </div>
            <h4 className="text-lg font-medium text-white">BurnFrom Owner</h4>
            <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${
              canBurn() 
                ? getBurnerStatus().color === "blue"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                  : "bg-red-500/20 text-red-300 border border-red-400/30"
                : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
            }`}>
              {canBurn() ?
                getBurnerStatus().color === "blue" ? "Admin Access" : "Trial Active"
                : "Need Burner Role"
              }
            </span>
          </div>

          {/* Current Allowance Display */}
          {burnFromForm.owner && (
            <div className="bg-black/20 rounded-lg p-3 mb-4">
              <div className="flex items-center mb-1">
                <span className="text-white/70 text-xs">
                  Allowance from {burnFromForm.owner.slice(0, 6)}...{burnFromForm.owner.slice(-4)} to You
                </span>
                <InfoIcon 
                  tooltip="Amount this owner has approved you to spend on their behalf" 
                  position="top"
                />
              </div>
              <p className="text-white font-semibold">
                {getCurrentAllowance()} {symbol as string || "Tokens"}
              </p>
              {(!currentAllowance || currentAllowance === BigInt(0)) && (
                <p className="text-red-300 text-xs mt-1">
                  ⚠️ No allowance available
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleBurnFrom} className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-white/70 text-sm font-medium">
                  Owner Address
                </label>
                <InfoIcon 
                  tooltip="The wallet address whose tokens you want to burn (must have approved you first)" 
                  position="right"
                />
              </div>
              <input
                type="text"
                placeholder="0x..."
                value={burnFromForm.owner}
                onChange={(e) => setBurnFromForm(prev => ({ ...prev, owner: e.target.value }))}
                disabled={!canBurn()}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-white/70 text-sm font-medium">
                  Amount to Burn
                </label>
                <InfoIcon 
                  tooltip="Number of tokens to burn from the owner's account. Cannot exceed your allowance." 
                  position="right"
                />
              </div>
              <input
                type="number"
                placeholder="1.0"
                step="0.000000000000000001"
                value={burnFromForm.amount}
                onChange={(e) => setBurnFromForm(prev => ({ ...prev, amount: e.target.value }))}
                disabled={!canBurnFrom()}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={!canBurnFrom() || burnFromPending || burnFromTxLoading || !burnFromForm.owner || !burnFromForm.amount}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {(burnFromPending || burnFromTxLoading) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {burnFromPending ? "Confirming..." : "Processing..."}
                </>
              ) : !canBurn() ? (
                "Burner Access Required"
              ) : !currentAllowance || currentAllowance === BigInt(0) ? (
                "No Allowance Available"
              ) : (
                "Burn From Owner"
              )}
            </button>
          </form>

          {!canBurn() && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
              <p className="text-yellow-100 text-sm">
                ⚠️ You need active burner access to use burnFrom. Request a trial in the Trials section.
              </p>
            </div>
          )}

          {canBurn() && (!currentAllowance || currentAllowance === BigInt(0)) && burnFromForm.owner && (
            <div className="mt-4 p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg">
              <p className="text-orange-100 text-sm">
                🔍 No allowance found. The owner needs to approve you first in Step 1.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
        <h5 className="text-blue-200 font-medium mb-2">💡 How to use:</h5>
        <ol className="text-blue-100 text-sm space-y-1 list-decimal list-inside">
          <li><strong>Step 1</strong>: Owner approves a spender address with an allowance amount</li>
          <li><strong>Step 2</strong>: Spender (with BURNER_ROLE active) can burnFrom the owner&#39;s tokens</li>
          <li><strong>Note</strong>: The spender must have active burner access to execute burnFrom</li>
          <li><strong>Tip</strong>: You can test both steps by approving yourself, then burning from your own address</li>
        </ol>
      </div>
    </div>
  );
}
