import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, type TokenInfo } from './contract';
import { formatUnits, parseUnits } from 'viem';
import { useState } from 'react';

// =============================================================================
// CUSTOM HOOKS FOR ERC20 TOKEN INTERACTIONS
// =============================================================================

/**
 * Hook to read basic token information
 */
export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'decimals',
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
    totalSupply: totalSupply as bigint,
    address: CONTRACT_ADDRESS,
    isLoading: !name || !symbol || decimals === undefined || !totalSupply,
  };
}

/**
 * Hook to read token balance for a specific address
 */
export function useTokenBalance(address?: `0x${string}`) {
  const { data: balance, refetch, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { decimals } = useTokenInfo();

  const formattedBalance = balance && decimals !== undefined 
    ? formatUnits(balance as bigint, decimals)
    : '0';

  return {
    balance: balance as bigint,
    formattedBalance,
    refetch,
    isLoading,
  };
}

/**
 * Hook to read allowance between owner and spender
 */
export function useTokenAllowance(owner?: `0x${string}`, spender?: `0x${string}`) {
  const { data: allowance, refetch, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender,
    },
  });

  const { decimals } = useTokenInfo();

  const formattedAllowance = allowance && decimals !== undefined
    ? formatUnits(allowance as bigint, decimals)
    : '0';

  return {
    allowance: allowance as bigint,
    formattedAllowance,
    refetch,
    isLoading,
  };
}

/**
 * Hook for token transfer functionality
 */
export function useTokenTransfer() {
  const [isPending, setIsPending] = useState(false);
  const { writeContract, data: hash, error } = useWriteContract();
  const { decimals } = useTokenInfo(); // ✅ Move hook to top level
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = async (to: `0x${string}`, amount: string) => {
    // ❌ Removed hook call from here
    if (decimals === undefined) {
      throw new Error("Token decimals not loaded");
    }

    const amountInWei = parseUnits(amount, decimals);
    
    setIsPending(true);
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'transfer',
        args: [to, amountInWei],
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook for token approval functionality
 */
export function useTokenApproval() {
  const [isPending, setIsPending] = useState(false);
  const { writeContract, data: hash, error } = useWriteContract();
  const { decimals } = useTokenInfo(); // ✅ Move hook to top level
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (spender: `0x${string}`, amount: string) => {
    // ❌ Removed hook call from here
    if (decimals === undefined) {
      throw new Error("Token decimals not loaded");
    }

    const amountInWei = parseUnits(amount, decimals);
    
    setIsPending(true);
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'approve',
        args: [spender, amountInWei],
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// =============================================================================
// EXAMPLE HOOKS FOR EXTENDED FUNCTIONALITY
// =============================================================================

/**
 * Example hook for minting tokens (if your contract supports it)
 * Uncomment and modify based on your actual contract functions
 */
/*
export function useTokenMint() {
  const [isPending, setIsPending] = useState(false);
  const { writeContract, data: hash, error } = useWriteContract();
  const { decimals } = useTokenInfo(); // ✅ Hook at top level
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const mint = async (to: `0x${string}`, amount: string) => {
    if (decimals === undefined) {
      throw new Error('Token decimals not loaded');
    }

    const amountInWei = parseUnits(amount, decimals);
    
    setIsPending(true);
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mint', // Replace with your actual function name
        args: [to, amountInWei],
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
*/

/**
 * Example hook for burning tokens (if your contract supports it)
 * Uncomment and modify based on your actual contract functions
 */
/*
export function useTokenBurn() {
  const [isPending, setIsPending] = useState(false);
  const { writeContract, data: hash, error } = useWriteContract();
  const { decimals } = useTokenInfo(); // ✅ Hook at top level
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const burn = async (amount: string) => {
    if (decimals === undefined) {
      throw new Error('Token decimals not loaded');
    }

    const amountInWei = parseUnits(amount, decimals);
    
    setIsPending(true);
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'burn', // Replace with your actual function name
        args: [amountInWei],
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    burn,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
*/

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: bigint, decimals: number, displayDecimals: number = 4): string {
  const formatted = formatUnits(amount, decimals);
  return parseFloat(formatted).toFixed(displayDecimals);
}

/**
 * Parse token amount from user input
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  return parseUnits(amount, decimals);
}

/**
 * Validate token amount input
 */
export function validateTokenAmount(amount: string, maxDecimals: number): { isValid: boolean; error?: string } {
  if (!amount || amount === '') {
    return { isValid: false, error: "Amount is required" };
  }

  if (isNaN(Number(amount))) {
    return { isValid: false, error: "Amount must be a valid number" };
  }

  if (Number(amount) <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > maxDecimals) {
    return { isValid: false, error: `Amount can have at most ${maxDecimals} decimal places` };
  }

  return { isValid: true };
}
