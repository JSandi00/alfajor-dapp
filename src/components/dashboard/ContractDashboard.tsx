"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUnits, parseUnits } from 'viem';
import {useState, useEffect, ReactNode} from 'react';

/**
 * Dashboard Component for ControlledTokenExtended Contract
 * Shows wallet balance, minter/burner status, trial information, and permissions
 */
export function ContractDashboard() {
  const { address } = useAccount();
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form states
  const [mintForm, setMintForm] = useState({ to: '', amount: '' });
  const [burnAmount, setBurnAmount] = useState('');
  const [allowanceForm, setAllowanceForm] = useState({ spender: '', amount: '' });
  const [burnFromForm, setBurnFromForm] = useState({ owner: '', amount: '' });

  // ERC20 Balance
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useReadContract({
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

  // Role constants
  const { data: MINTER_ROLE } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'MINTER_ROLE',
  });

  const { data: BURNER_ROLE } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'BURNER_ROLE',
  });

  // Role checks
  const { data: isMinter, isLoading: minterLoading, refetch: refetchMinter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasRole',
    args: MINTER_ROLE && address ? [MINTER_ROLE, address] : undefined,
    query: { enabled: !!MINTER_ROLE && !!address },
  });

  const { data: isBurner, isLoading: burnerLoading, refetch: refetchBurner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasRole',
    args: BURNER_ROLE && address ? [BURNER_ROLE, address] : undefined,
    query: { enabled: !!BURNER_ROLE && !!address },
  });

  // Trial configurations
  const { data: trialMinterEnabled } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialMinterEnabled',
  });

  const { data: trialBurnerEnabled } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialBurnerEnabled',
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

  const { data: trialBurnerDuration } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialBurnerDuration',
  });

  const { data: trialMinterCooldown } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialMinterCooldown',
  });

  const { data: trialBurnerCooldown } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'trialBurnerCooldown',
  });

  // Last trial timestamps
  const { data: lastTrialAt, refetch: refetchLastTrialAt } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'lastTrialAt',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: lastTrialBurnerAt, refetch: refetchLastTrialBurnerAt } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'lastTrialBurnerAt',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Allowance check (for burnFrom functionality)
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'allowance',
    args: burnFromForm.owner && address ? [burnFromForm.owner as `0x${string}`, address] : undefined,
    query: { enabled: !!burnFromForm.owner && !!address },
  });

  // Transaction hooks for trial requests
  const { writeContract: requestMinterTrial, data: minterTxHash, error: minterError, isPending: minterPending } = useWriteContract();
  const { writeContract: requestBurnerTrial, data: burnerTxHash, error: burnerError, isPending: burnerPending } = useWriteContract();

  // Transaction hooks for mint and burn
  const { writeContract: mintTokens, data: mintTxHash, error: mintError, isPending: mintPending } = useWriteContract();
  const { writeContract: burnTokens, data: burnTxHash, error: burnError, isPending: burnPending } = useWriteContract();

  // Transaction hooks for approve and burnFrom
  const { writeContract: approveSpender, data: approveTxHash, error: approveError, isPending: approvePending } = useWriteContract();
  const { writeContract: burnFromOwner, data: burnFromTxHash, error: burnFromError, isPending: burnFromPending } = useWriteContract();

  // Wait for transaction receipts
  const { isLoading: minterTxLoading, isSuccess: minterTxSuccess } = useWaitForTransactionReceipt({
    hash: minterTxHash,
  });

  const { isLoading: burnerTxLoading, isSuccess: burnerTxSuccess } = useWaitForTransactionReceipt({
    hash: burnerTxHash,
  });

  const { isLoading: mintTxLoading, isSuccess: mintTxSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  const { isLoading: burnTxLoading, isSuccess: burnTxSuccess } = useWaitForTransactionReceipt({
    hash: burnTxHash,
  });

  const { isLoading: approveTxLoading, isSuccess: approveTxSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isLoading: burnFromTxLoading, isSuccess: burnFromTxSuccess } = useWaitForTransactionReceipt({
    hash: burnFromTxHash,
  });

  // Helper functions
  const formatBalance = (balance: bigint, decimals: number) => {
    return parseFloat(formatUnits(balance, decimals)).toFixed(4);
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isTrialActive = (lastTrialTime: bigint, duration: bigint) => {
    if (!lastTrialTime || lastTrialTime === BigInt(0)) return false;
    const expiryTime = lastTrialTime + duration;
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    return currentTime < expiryTime;
  };

  const getTrialExpiry = (lastTrialTime: bigint, duration: bigint) => {
    if (!lastTrialTime || lastTrialTime === BigInt(0)) return null;
    return lastTrialTime + duration;
  };

  // Calculate trial status variables BEFORE they are used in functions
  const minterTrialActive = lastTrialAt && trialMinterDuration ? 
    isTrialActive(lastTrialAt as bigint, trialMinterDuration as bigint) : false;
  
  const burnerTrialActive = lastTrialBurnerAt && trialBurnerDuration ? 
    isTrialActive(lastTrialBurnerAt as bigint, trialBurnerDuration as bigint) : false;

  const minterExpiry = lastTrialAt && trialMinterDuration ? 
    getTrialExpiry(lastTrialAt as bigint, trialMinterDuration as bigint) : null;
    
  const burnerExpiry = lastTrialBurnerAt && trialBurnerDuration ? 
    getTrialExpiry(lastTrialBurnerAt as bigint, trialBurnerDuration as bigint) : null;

  // Consolidated status functions
  const getMinterStatus = (): {status: string, color: string} => {
    if (!isMinter) return { status: "None", color: "gray" };
    
    const isAdmin = !lastTrialAt || lastTrialAt === BigInt(0);
    
    if (isAdmin) return { status: "Admin", color: "blue" };
    if (minterTrialActive) return { status: "Trial Active", color: "green" };
    return { status: "Trial Expired", color: "yellow" };
  };

  const getBurnerStatus = (): {status: string, color: string} => {
    if (!isBurner) return { status: "None", color: "gray" };
    
    const isAdmin = !lastTrialBurnerAt || lastTrialBurnerAt === BigInt(0);
    
    if (isAdmin) return { status: "Admin", color: "blue" };
    if (burnerTrialActive) return { status: "Trial Active", color: "orange" };
    return { status: "Trial Expired", color: "yellow" };
  };

  // Helper functions for mint/burn validation
  const canMint = () => {
    if (!isMinter) return false;
    
    const isAdmin = !lastTrialAt || lastTrialAt === BigInt(0);
    return isAdmin || minterTrialActive;
  };

  const canBurn = () => {
    if (!isBurner) return false;
    
    const isAdmin = !lastTrialBurnerAt || lastTrialBurnerAt === BigInt(0);
    return isAdmin || burnerTrialActive;
  };

  const getRemainingAllowance = () => {
    if (!trialMinterAllowance || !decimals) return "0";
    return formatBalance(trialMinterAllowance as bigint, decimals as number);
  };

  const getCurrentAllowance = () => {
    if (!currentAllowance || !decimals) return "0";
    return formatBalance(currentAllowance as bigint, decimals as number);
  };

  const canBurnFrom = () => {
    return canBurn() && burnFromForm.owner && currentAllowance && (currentAllowance as bigint) > BigInt(0);
  };

  // Toast management
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Transaction handlers
  const handleRequestMinterTrial = async () => {
    try {
      requestMinterTrial({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestTrialMinter',
      });
      showToast('info', 'Transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'Transaction failed';
      if (errorMessage.includes('TrialCooldownActive')) {
        showToast('error', 'Cooldown period is still active. Please wait before requesting another trial.');
      } else if (errorMessage.includes('TrialsDisabled')) {
        showToast('error', 'Trial minting is currently disabled.');
      } else if (errorMessage.includes('TrialGlobalCapReached')) {
        showToast('error', 'Global trial cap has been reached. No more trials available.');
      } else {
        showToast('error', `Transaction failed: ${errorMessage}`);
      }
    }
  };

  const handleRequestBurnerTrial = async () => {
    try {
      requestBurnerTrial({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestTrialBurner',
      });
      showToast('info', 'Transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'Transaction failed';
      if (errorMessage.includes('TrialCooldownActive')) {
        showToast('error', 'Cooldown period is still active. Please wait before requesting another trial.');
      } else if (errorMessage.includes('TrialsDisabled')) {
        showToast('error', 'Trial burning is currently disabled.');
      } else {
        showToast('error', `Transaction failed: ${errorMessage}`);
      }
    }
  };

  // Mint and Burn handlers
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mintForm.to || !mintForm.amount) {
      showToast('error', 'Please fill in all fields');
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
      
      showToast('info', 'Mint transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'Mint failed';
      showToast('error', `Mint failed: ${errorMessage}`);
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!burnAmount) {
      showToast('error', 'Please enter amount to burn');
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
      
      showToast('info', 'Burn transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'Burn failed';
      showToast('error', `Burn failed: ${errorMessage}`);
    }
  };

  // Approve and BurnFrom handlers
  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allowanceForm.spender || !allowanceForm.amount) {
      showToast('error', 'Please fill in all fields');
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
      
      showToast('info', 'Approve transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'Approve failed';
      showToast('error', `Approve failed: ${errorMessage}`);
    }
  };

  const handleBurnFrom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!burnFromForm.owner || !burnFromForm.amount) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    if (!canBurnFrom()) {
      showToast('error', 'Insufficient allowance or missing burner access');
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
      
      showToast('info', 'BurnFrom transaction submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'BurnFrom failed';
      showToast('error', `BurnFrom failed: ${errorMessage}`);
    }
  };

  // Auto-refresh after successful transactions
  useEffect(() => {
    if (minterTxSuccess) {
      showToast('success', 'Trial minter access granted successfully!');
      // Refresh all relevant data
      refetchMinter();
      refetchLastTrialAt();
      refetchBalance();
    }
  }, [minterTxSuccess, refetchMinter, refetchLastTrialAt, refetchBalance]);

  useEffect(() => {
    if (burnerTxSuccess) {
      showToast('success', 'Trial burner access granted successfully!');
      // Refresh all relevant data
      refetchBurner();
      refetchLastTrialBurnerAt();
    }
  }, [burnerTxSuccess, refetchBurner, refetchLastTrialBurnerAt]);

  useEffect(() => {
    if (mintTxSuccess) {
      showToast('success', 'Tokens minted successfully!');
      // Clear form and refresh data
      setMintForm({ to: '', amount: '' });
      refetchBalance();
    }
  }, [mintTxSuccess, refetchBalance]);

  useEffect(() => {
    if (burnTxSuccess) {
      showToast('success', 'Tokens burned successfully!');
      // Clear form and refresh data
      setBurnAmount('');
      refetchBalance();
    }
  }, [burnTxSuccess, refetchBalance]);

  useEffect(() => {
    if (approveTxSuccess) {
      showToast('success', 'Approval successful!');
      // Clear form and refresh allowance
      setAllowanceForm({ spender: '', amount: '' });
      refetchAllowance();
    }
  }, [approveTxSuccess, refetchAllowance]);

  useEffect(() => {
    if (burnFromTxSuccess) {
      showToast('success', 'BurnFrom successful!');
      // Clear form and refresh data
      setBurnFromForm({ owner: '', amount: '' });
      refetchBalance();
      refetchAllowance();
    }
  }, [burnFromTxSuccess, refetchBalance, refetchAllowance]);

  // Handle transaction errors
  useEffect(() => {
    if (minterError) {
      const errorMessage = minterError.message || 'Transaction failed';
      if (errorMessage.includes('TrialCooldownActive')) {
        showToast('error', 'Cooldown period is still active for minter trials.');
      } else if (errorMessage.includes('TrialsDisabled')) {
        showToast('error', 'Trial minting is currently disabled.');
      } else if (errorMessage.includes('TrialGlobalCapReached')) {
        showToast('error', 'Global trial minter cap reached.');
      } else {
        showToast('error', `Minter trial request failed: ${errorMessage}`);
      }
    }
  }, [minterError]);

  useEffect(() => {
    if (burnerError) {
      const errorMessage = burnerError.message || 'Transaction failed';
      if (errorMessage.includes('TrialCooldownActive')) {
        showToast('error', 'Cooldown period is still active for burner trials.');
      } else if (errorMessage.includes('TrialsDisabled')) {
        showToast('error', 'Trial burning is currently disabled.');
      } else {
        showToast('error', `Burner trial request failed: ${errorMessage}`);
      }
    }
  }, [burnerError]);

  useEffect(() => {
    if (mintError) {
      const errorMessage = mintError.message || 'Mint transaction failed';
      showToast('error', `Mint failed: ${errorMessage}`);
    }
  }, [mintError]);

  useEffect(() => {
    if (burnError) {
      const errorMessage = burnError.message || 'Burn transaction failed';
      showToast('error', `Burn failed: ${errorMessage}`);
    }
  }, [burnError]);

  useEffect(() => {
    if (approveError) {
      const errorMessage = approveError.message || 'Approve transaction failed';
      showToast('error', `Approve failed: ${errorMessage}`);
    }
  }, [approveError]);

  useEffect(() => {
    if (burnFromError) {
      const errorMessage = burnFromError.message || 'BurnFrom transaction failed';
      showToast('error', `BurnFrom failed: ${errorMessage}`);
    }
  }, [burnFromError]);

  // Refetch allowance when burnFromForm.owner changes
  useEffect(() => {
    if (burnFromForm.owner && address) {
      refetchAllowance();
    }
  }, [burnFromForm.owner, address, refetchAllowance]);

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        <svg className="w-16 h-16 text-white/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-white/70">Connect your wallet to view your contract dashboard</p>
      </div>
    );
  }



  return (

    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border animate-fadeIn ${
          toast.type === 'success' ? 'bg-green-500/20 border-green-400/30 text-green-100' :
          toast.type === 'error' ? 'bg-red-500/20 border-red-400/30 text-red-100' :
          'bg-blue-500/20 border-blue-400/30 text-blue-100'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-auto pl-2 opacity-70 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Contract Dashboard</h2>
        <p className="text-white/70">Your permissions and balances on Alfajor Coin Smart Contract</p>
      </div>

      {/* Token Balance Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-6 h-6 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            Token Balance
          </h3>
          <span className="text-blue-200 text-sm font-medium bg-blue-500/20 px-3 py-1 rounded-full">
            ERC20
          </span>
        </div>

        {balanceLoading ? (
          <div className="h-16 bg-white/20 rounded-lg animate-pulse"></div>
        ) : (
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-1">
                {balance && decimals ? formatBalance(balance as bigint, decimals as number) : "0.0000"}
              </p>
              <p className="text-white/70 text-sm">
                {symbol as string || "Tokens"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Minter Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Minter Status
            </h3>
          </div>

          <div className="space-y-3">
            {/* Consolidated Minter Status */}
            <div className="flex items-center justify-between">
              <span className="text-white/70">Access Status:</span>
              {minterLoading ? (
                  <div className="h-6 w-20 bg-white/20 rounded animate-pulse"></div>
              ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getMinterStatus().color === "green"
                          ? "bg-green-500/20 text-green-300 border border-green-400/30"
                          : getMinterStatus().color === "blue"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                              : getMinterStatus().color === "yellow"
                                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                                  : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                  }`}>
                  {getMinterStatus().status}
                </span>
              )}
            </div>

            {/* Trial Allowance */}
            {trialMinterAllowance as bigint && (
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-white/70 text-sm mb-1">Trial Allowance:</p>
                  <p className="text-white font-semibold">
                    {decimals as string ? formatBalance(trialMinterAllowance as bigint, decimals as number) : (trialMinterAllowance as bigint).toString()} {(symbol as string) || "Tokens"}
                  </p>
                </div>
            )}

            {/* Trial Expiry */}
            {minterExpiry && (
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/70 text-sm mb-1">Trial Expires:</p>
                <p className="text-white font-mono text-sm">
                  {formatTimestamp(minterExpiry)}
                </p>
              </div>
            )}

            {/* Request Trial Button */}
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={handleRequestMinterTrial}
                disabled={!trialMinterEnabled || minterTrialActive || minterPending || minterTxLoading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {(minterPending || minterTxLoading) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {minterPending ? "Confirming..." : "Processing..."}
                  </>
                ) : minterTrialActive ? (
                  "Trial Active"
                ) : !trialMinterEnabled ? (
                  "Trial Disabled"
                ) : (
                  "Get Trial Minter"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Burner Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Burner Status
            </h3>
          </div>

          <div className="space-y-3">
            {/* Consolidated Burner Status */}
            <div className="flex items-center justify-between">
              <span className="text-white/70">Access Status:</span>
              {burnerLoading ? (
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse"></div>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getBurnerStatus().color === "orange" 
                    ? "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                    : getBurnerStatus().color === "blue"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                    : getBurnerStatus().color === "yellow"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                    : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                }`}>
                  {getBurnerStatus().status}
                </span>
              )}
            </div>

            {/* Trial Expiry */}
            {burnerExpiry && (
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/70 text-sm mb-1">Trial Expires:</p>
                <p className="text-white font-mono text-sm">
                  {formatTimestamp(burnerExpiry)}
                </p>
              </div>
            )}

            {/* Request Trial Button */}
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={handleRequestBurnerTrial}
                disabled={!trialBurnerEnabled || burnerTrialActive || burnerPending || burnerTxLoading}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {(burnerPending || burnerTxLoading) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {burnerPending ? "Confirming..." : "Processing..."}
                  </>
                ) : burnerTrialActive ? (
                  "Trial Active"
                ) : !trialBurnerEnabled ? (
                  "Trial Disabled"
                ) : (
                  "Get Trial Burner"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Allowance & BurnFrom Demo Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-6 h-6 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            Allowance & BurnFrom Demo
          </h3>
          <span className="text-purple-200 text-sm font-medium bg-purple-500/20 px-3 py-1 rounded-full">
            Two-Step Process
          </span>
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
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Spender Address (who can burnFrom)
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={allowanceForm.spender}
                  onChange={(e) => setAllowanceForm(prev => ({ ...prev, spender: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Allowance Amount (whole tokens)
                </label>
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
                <p className="text-white/70 text-sm mb-1">
                  Allowance from {burnFromForm.owner.slice(0, 6)}...{burnFromForm.owner.slice(-4)} to You:
                </p>
                <p className="text-white font-semibold">
                  {getCurrentAllowance()} {(symbol as string) || "Tokens"}
                </p>
                {(!currentAllowance || (currentAllowance as bigint) === BigInt(0)) && (
                  <p className="text-red-300 text-xs mt-1">
                    ⚠️ No allowance available
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleBurnFrom} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Owner Address (tokens to burn from)
                </label>
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
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Amount to Burn (whole tokens)
                </label>
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
                ) : !currentAllowance || (currentAllowance as bigint) === BigInt(0) ? (
                  "No Allowance Available"
                ) : (
                  "Burn From Owner"
                )}
              </button>
            </form>

            {!canBurn() && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <p className="text-yellow-100 text-sm">
                  ⚠️ You need active burner access to use burnFrom. Request a trial above.
                </p>
              </div>
            )}

            {canBurn() && (!currentAllowance || (currentAllowance as bigint) === BigInt(0)) && burnFromForm.owner && (
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                <p className="text-orange-100 text-sm">
                  🔍 No allowance found. The owner needs to approve you first in Step 1.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
          <h5 className="text-purple-200 font-medium mb-2">💡 How to use:</h5>
          <ol className="text-purple-100 text-sm space-y-1 list-decimal list-inside">
            <li>**Step 1**: Owner approves a spender address with an allowance amount</li>
            <li>**Step 2**: Spender (with BURNER_ROLE active) can burnFrom the owner&apos;s tokens</li>
            <li>**Note**: The spender must have active burner access to execute burnFrom</li>
            <li>**Tip**: You can test both steps by approving yourself, then burning from your own address</li>
          </ol>
        </div>
      </div>

      {/* Mint and Burn Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mint Panel */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Mint Tokens
            </h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              canMint() 
                ? getMinterStatus().color === "blue"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                  : "bg-green-500/20 text-green-300 border border-green-400/30"
                : "bg-red-500/20 text-red-300 border border-red-400/30"
            }`}>
              {canMint() ?
                getMinterStatus().color === "blue" ? "Admin Access" : "Trial Access"
                : "Not Available"
              }
            </span>
          </div>

          {/* Remaining Allowance */}
          {canMint() && (
            <div className="bg-black/20 rounded-lg p-3 mb-4">
              <p className="text-white/70 text-sm mb-1">Remaining Allowance:</p>
              <p className="text-white font-semibold">
                {getRemainingAllowance()} {(symbol as string) || "Tokens"}
              </p>
            </div>
          )}

          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                To Address
              </label>
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
              <label className="block text-white/70 text-sm font-medium mb-2">
                Amount (whole tokens)
              </label>
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
                ⚠️ You need active minter access to mint tokens. Request a trial above.
              </p>
            </div>
          )}
        </div>

        {/* Burn Panel */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Burn Tokens
            </h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              canBurn() 
                ? getBurnerStatus().color === "blue"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                  : "bg-red-500/20 text-red-300 border border-red-400/30"
                : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
            }`}>
              {canBurn() ?
                getBurnerStatus().color === "blue" ? "Admin Access" : "Trial Access"
                : "Not Available"
              }
            </span>
          </div>

          {/* Current Balance */}
          <div className="bg-black/20 rounded-lg p-3 mb-4">
            <p className="text-white/70 text-sm mb-1">Your Balance:</p>
            <p className="text-white font-semibold">
              {(balance as bigint) && (decimals as number) ? formatBalance(balance as bigint, decimals as number) : "0.0000"} {(symbol as string) || "Tokens"}
            </p>
          </div>

          <form onSubmit={handleBurn} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Amount to Burn (whole tokens)
              </label>
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
                ⚠️ You need active burner access to burn tokens. Request a trial above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Status */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Permission Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              getMinterStatus().color === "green" 
                ? "bg-green-500/20 border border-green-400/30"
                : getMinterStatus().color === "blue"
                ? "bg-blue-500/20 border border-blue-400/30"
                : getMinterStatus().color === "yellow"
                ? "bg-yellow-500/20 border border-yellow-400/30"
                : "bg-gray-500/20 border border-gray-400/30"
            }`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <p className="text-sm text-white/70 mb-1">Minter Access</p>
            <p className={`text-lg font-medium ${
              getMinterStatus().color === "green" ? "text-green-300" 
                : getMinterStatus().color === "blue" ? "text-blue-300"
                : getMinterStatus().color === "yellow" ? "text-yellow-300" 
                : "text-gray-300"
            }`}>
              {getMinterStatus().status}
            </p>
          </div>

          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              getBurnerStatus().color === "orange" 
                ? "bg-orange-500/20 border border-orange-400/30"
                : getBurnerStatus().color === "blue"
                ? "bg-blue-500/20 border border-blue-400/30"
                : getBurnerStatus().color === "yellow"
                ? "bg-yellow-500/20 border border-yellow-400/30"
                : "bg-gray-500/20 border border-gray-400/30"
            }`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
            <p className="text-sm text-white/70 mb-1">Burner Access</p>
            <p className={`text-lg font-medium ${
              getBurnerStatus().color === "orange" ? "text-orange-300" 
                : getBurnerStatus().color === "blue" ? "text-blue-300"
                : getBurnerStatus().color === "yellow" ? "text-yellow-300" 
                : "text-gray-300"
            }`}>
              {getBurnerStatus().status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
