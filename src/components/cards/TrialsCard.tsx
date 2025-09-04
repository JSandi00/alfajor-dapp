"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { formatUnits } from 'viem';
import { InfoIcon } from '../ui/Tooltip';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {boolean} from "zod";

export function TrialsCard() {
  const { address } = useAccount();

  // Read contract data
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
  const { writeContract: requestMinterTrial, data: minterTxHash, error: minterError, isPending: minterPending } = useWriteContract();
  const { writeContract: requestBurnerTrial, data: burnerTxHash, error: burnerError, isPending: burnerPending } = useWriteContract();

  const { isLoading: minterTxLoading, isSuccess: minterTxSuccess } = useWaitForTransactionReceipt({
    hash: minterTxHash,
  });

  const { isLoading: burnerTxLoading, isSuccess: burnerTxSuccess } = useWaitForTransactionReceipt({
    hash: burnerTxHash,
  });

  // Helper functions
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

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatBalance = (balance: bigint, decimals: number) => {
    return parseFloat(formatUnits(balance, decimals)).toFixed(4);
  };

  // Calculate trial status
  const minterTrialActive = lastTrialAt && trialMinterDuration ? 
    isTrialActive(lastTrialAt as bigint, trialMinterDuration as bigint) : false;
  
  const burnerTrialActive = lastTrialBurnerAt && trialBurnerDuration ? 
    isTrialActive(lastTrialBurnerAt as bigint, trialBurnerDuration as bigint) : false;

  const minterExpiry = lastTrialAt && trialMinterDuration ? 
    getTrialExpiry(lastTrialAt as bigint, trialMinterDuration as bigint) : null;
    
  const burnerExpiry = lastTrialBurnerAt && trialBurnerDuration ? 
    getTrialExpiry(lastTrialBurnerAt as bigint, trialBurnerDuration as bigint) : null;

  // Status functions
  const getMinterStatus = () => {
    if (!isMinter) return { status: "None", color: "gray" };
    
    const isAdmin = !lastTrialAt || lastTrialAt === BigInt(0);
    
    if (isAdmin) return { status: "Admin", color: "blue" };
    if (minterTrialActive) return { status: "Trial Active", color: "green" };
    return { status: "Trial Expired", color: "yellow" };
  };

  const getBurnerStatus = () => {
    if (!isBurner) return { status: "None", color: "gray" };
    
    const isAdmin = !lastTrialBurnerAt || lastTrialBurnerAt === BigInt(0);
    
    if (isAdmin) return { status: "Admin", color: "blue" };
    if (burnerTrialActive) return { status: "Trial Active", color: "orange" };
    return { status: "Trial Expired", color: "yellow" };
  };

  // Transaction handlers
  const handleRequestMinterTrial = async () => {
    try {
      requestMinterTrial({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestTrialMinter',
      });
      toast('Minter trial request submitted!');
    } catch (error: any) {
      toast.error(`Failed to request minter trial: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleRequestBurnerTrial = async () => {
    try {
      requestBurnerTrial({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestTrialBurner',
      });
      toast('Burner trial request submitted!');
    } catch (error: any) {
      toast.error(`Failed to request burner trial: ${error?.message || 'Unknown error'}`);
    }
  };

  // Success handlers
  useEffect(() => {
    if (minterTxSuccess) {
      toast.success('Minter trial granted successfully!');
      refetchMinter();
      refetchLastTrialAt();
    }
  }, [minterTxSuccess]);

  useEffect(() => {
    if (burnerTxSuccess) {
      toast.success('Burner trial granted successfully!');
      refetchBurner();
      refetchLastTrialBurnerAt();
    }
  }, [burnerTxSuccess]);

  // Error handlers
  useEffect(() => {
    if (minterError) {
      toast.error(`Minter trial failed: ${minterError.message}`);
    }
  }, [minterError]);

  useEffect(() => {
    if (burnerError) {
      toast.error(`Burner trial failed: ${burnerError.message}`);
    }
  }, [burnerError]);

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Trial Access
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-white/70">Connect wallet to view trial status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Trial Access
        </h3>
        <InfoIcon 
          tooltip="Request temporary access to mint or burn tokens for testing purposes" 
          position="left"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Minter Trial */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-white/70 text-sm font-medium">Minter Role</span>
              <InfoIcon 
                tooltip="Allows you to create new tokens. Roles can be permanent (admin) or temporary (trial)." 
                position="top"
              />
            </div>
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

          {trialMinterAllowance as boolean && (
            <div className="bg-black/20 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <span className="text-white/70 text-xs">Trial Allowance</span>
                <InfoIcon 
                  tooltip="Maximum tokens you can mint during your trial period" 
                  position="top"
                />
              </div>
              <p className="text-white text-sm font-semibold">
                {decimals as number ? formatBalance(trialMinterAllowance as bigint, decimals as number) : (trialMinterAllowance as boolean).toString()} {symbol as string || "Tokens"}
              </p>
            </div>
          )}

          {minterExpiry && (
            <div className="bg-black/20 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <span className="text-white/70 text-xs">Expires</span>
                <InfoIcon 
                  tooltip="When your trial access will expire. After this time, you'll need to request a new trial." 
                  position="top"
                />
              </div>
              <p className="text-white text-xs font-mono">
                {formatTimestamp(minterExpiry)}
              </p>
            </div>
          )}

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
              "Request Minter Trial"
            )}
          </button>
        </div>

        {/* Burner Trial */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-white/70 text-sm font-medium">Burner Role</span>
              <InfoIcon 
                tooltip="Allows you to destroy tokens. Useful for testing token burning functionality." 
                position="top"
              />
            </div>
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

          {burnerExpiry && (
            <div className="bg-black/20 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <span className="text-white/70 text-xs">Expires</span>
                <InfoIcon 
                  tooltip="When your burner trial access will expire" 
                  position="top"
                />
              </div>
              <p className="text-white text-xs font-mono">
                {formatTimestamp(burnerExpiry)}
              </p>
            </div>
          )}

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
              "Request Burner Trial"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
