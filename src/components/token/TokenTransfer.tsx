"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTokenTransfer } from '@/lib/token-hooks';
import { validateTokenAmount } from '@/lib/token-hooks';
import { isAddress } from 'viem';

/**
 * Token Transfer Component
 * Allows users to transfer tokens to another address
 */
export function TokenTransfer() {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});

  const { transfer, isPending, isConfirming, isConfirmed, hash, error } = useTokenTransfer();

  const validateForm = () => {
    const newErrors: { recipient?: string; amount?: string } = {};

    // Validate recipient address
    if (!recipient) {
      newErrors.recipient = "Recipient address is required";
    } else if (!isAddress(recipient)) {
      newErrors.recipient = "Invalid Ethereum address";
    } else if (recipient.toLowerCase() === address?.toLowerCase()) {
      newErrors.recipient = "Cannot transfer to yourself";
    }

    // Validate amount
    const amountValidation = validateTokenAmount(amount, 18);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransfer = async () => {
    if (!validateForm()) return;

    try {
      await transfer(recipient as `0x${string}`, amount);
      // Clear form on success
      setRecipient('');
      setAmount('');
      setErrors({});
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setAmount(value);
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: undefined }));
      }
    }
  };

  if (!address) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="text-center">
          <svg className="w-12 h-12 text-white/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <p className="text-white/70">Connect your wallet to transfer tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
        <h3 className="text-xl font-bold text-white">Transfer Tokens</h3>
      </div>

      <div className="space-y-4">
        {/* Recipient Address Input */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              if (errors.recipient) {
                setErrors(prev => ({ ...prev, recipient: undefined }));
              }
            }}
            placeholder="0x..."
            className={`w-full bg-black/20 border rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
              errors.recipient
                ? 'border-red-400 focus:ring-red-400/50'
                : 'border-white/20 focus:ring-blue-400/50'
            }`}
          />
          {errors.recipient && (
            <p className="text-red-400 text-sm mt-1">{errors.recipient}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className={`w-full bg-black/20 border rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
              errors.amount
                ? 'border-red-400 focus:ring-red-400/50'
                : 'border-white/20 focus:ring-blue-400/50'
            }`}
          />
          {errors.amount && (
            <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={isPending || isConfirming || !recipient || !amount}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {isPending || isConfirming ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isPending ? "Confirming..." : "Processing..."}
            </div>
          ) : (
            "Transfer Tokens"
          )}
        </button>

        {/* Transaction Status */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
            <p className="text-red-100 text-sm">
              <strong>Error:</strong> {error.message}
            </p>
          </div>
        )}

        {hash && isConfirming && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <p className="text-yellow-100 text-sm mb-2">
              <strong>Transaction Submitted:</strong>
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-200 hover:text-yellow-100 text-sm font-mono break-all underline"
            >
              {hash}
            </a>
          </div>
        )}

        {isConfirmed && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-green-100 text-sm">
                <strong>Transfer Successful!</strong> Tokens have been transferred.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
