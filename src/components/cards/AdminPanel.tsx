"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { parseUnits } from 'viem';
import { InfoIcon } from '../ui/Tooltip';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function AdminPanel() {
  // Admin form states
  const [trialMinterConfigForm, setTrialMinterConfigForm] = useState({
    allowance: '',
    duration: '',
    enabled: true,
    globalCap: '',
    cooldown: ''
  });
  
  const [trialBurnerConfigForm, setTrialBurnerConfigForm] = useState({
    duration: '',
    cooldown: '',
    enabled: true
  });

  // Admin transaction hooks
  const { writeContract: setTrialMinterConfig, data: trialMinterConfigTxHash, error: trialMinterConfigError, isPending: trialMinterConfigPending } = useWriteContract();
  const { writeContract: setTrialBurnerConfig, data: trialBurnerConfigTxHash, error: trialBurnerConfigError, isPending: trialBurnerConfigPending } = useWriteContract();

  // Admin transaction receipts
  const { isLoading: trialMinterConfigTxLoading, isSuccess: trialMinterConfigTxSuccess } = useWaitForTransactionReceipt({
    hash: trialMinterConfigTxHash,
  });
  
  const { isLoading: trialBurnerConfigTxLoading, isSuccess: trialBurnerConfigTxSuccess } = useWaitForTransactionReceipt({
    hash: trialBurnerConfigTxHash,
  });

  // Admin validation helpers
  const validateTrialMinterConfig = () => {
    const errors: string[] = [];
    
    if (!trialMinterConfigForm.allowance || parseFloat(trialMinterConfigForm.allowance) < 0) {
      errors.push('Allowance must be a non-negative number');
    }
    if (!trialMinterConfigForm.duration || parseInt(trialMinterConfigForm.duration) < 0) {
      errors.push('Duration must be a non-negative number (seconds)');
    }
    if (!trialMinterConfigForm.globalCap || parseFloat(trialMinterConfigForm.globalCap) < 0) {
      errors.push('Global cap must be a non-negative number');
    }
    if (!trialMinterConfigForm.cooldown || parseInt(trialMinterConfigForm.cooldown) < 0) {
      errors.push('Cooldown must be a non-negative number (seconds)');
    }
    
    return errors;
  };
  
  const validateTrialBurnerConfig = () => {
    const errors: string[] = [];
    
    if (!trialBurnerConfigForm.duration || parseInt(trialBurnerConfigForm.duration) < 0) {
      errors.push('Duration must be a non-negative number (seconds)');
    }
    if (!trialBurnerConfigForm.cooldown || parseInt(trialBurnerConfigForm.cooldown) < 0) {
      errors.push('Cooldown must be a non-negative number (seconds)');
    }
    
    return errors;
  };

  // Admin transaction handlers
  const handleSetTrialMinterConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateTrialMinterConfig();
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }
    
    try {
      const allowanceWei = parseUnits(trialMinterConfigForm.allowance, 18);
      const duration = BigInt(parseInt(trialMinterConfigForm.duration));
      const globalCapWei = parseUnits(trialMinterConfigForm.globalCap, 18);
      const cooldown = BigInt(parseInt(trialMinterConfigForm.cooldown));
      
      setTrialMinterConfig({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'setTrialMinterConfig',
        args: [allowanceWei, duration, trialMinterConfigForm.enabled, globalCapWei, cooldown],
      });
      
      toast('Trial minter config update submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'Configuration update failed';
      toast.error(`Failed to update trial minter config: ${errorMessage}`);
    }
  };
  
  const handleSetTrialBurnerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateTrialBurnerConfig();
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }
    
    try {
      const duration = BigInt(parseInt(trialBurnerConfigForm.duration));
      const cooldown = BigInt(parseInt(trialBurnerConfigForm.cooldown));
      
      setTrialBurnerConfig({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'setTrialBurnerConfig',
        args: [duration, cooldown, trialBurnerConfigForm.enabled],
      });
      
      toast('Trial burner config update submitted! Waiting for confirmation...');
    } catch (error: any) {
      const errorMessage = error?.message || 'Configuration update failed';
      toast.error(`Failed to update trial burner config: ${errorMessage}`);
    }
  };

  // Admin transaction success handlers
  useEffect(() => {
    if (trialMinterConfigTxSuccess) {
      toast.success('Trial minter configuration updated successfully!');
      setTrialMinterConfigForm({
        allowance: '',
        duration: '',
        enabled: true,
        globalCap: '',
        cooldown: ''
      });
    }
  }, [trialMinterConfigTxSuccess]);
  
  useEffect(() => {
    if (trialBurnerConfigTxSuccess) {
      toast.success('Trial burner configuration updated successfully!');
      setTrialBurnerConfigForm({
        duration: '',
        cooldown: '',
        enabled: true
      });
    }
  }, [trialBurnerConfigTxSuccess]);

  // Admin error handlers
  useEffect(() => {
    if (trialMinterConfigError) {
      const errorMessage = trialMinterConfigError.message || 'Trial minter config update failed';
      toast.error(`Failed to update trial minter config: ${errorMessage}`);
    }
  }, [trialMinterConfigError]);
  
  useEffect(() => {
    if (trialBurnerConfigError) {
      const errorMessage = trialBurnerConfigError.message || 'Trial burner config update failed';
      toast.error(`Failed to update trial burner config: ${errorMessage}`);
    }
  }, [trialBurnerConfigError]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trial Minter Configuration */}
        <div className="bg-black/20 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              M
            </div>
            <h4 className="text-lg font-medium text-white">Trial Minter Config</h4>
            <InfoIcon 
              tooltip="Configure trial minting parameters: allowance, duration, global cap, and cooldown" 
              position="top"
            />
          </div>

          <form onSubmit={handleSetTrialMinterConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-white/70 text-sm font-medium">
                    Allowance (tokens)
                  </label>
                  <InfoIcon 
                    tooltip="Number of tokens users can mint during trial period" 
                    position="top"
                  />
                </div>
                <input
                  type="number"
                  placeholder="1000"
                  step="0.000000000000000001"
                  value={trialMinterConfigForm.allowance}
                  onChange={(e) => setTrialMinterConfigForm(prev => ({ ...prev, allowance: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-green-400/50"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-white/70 text-sm font-medium">
                    Duration (seconds)
                  </label>
                  <InfoIcon 
                    tooltip="How long trial access lasts (e.g., 86400 = 1 day)" 
                    position="top"
                  />
                </div>
                <input
                  type="number"
                  placeholder="86400"
                  value={trialMinterConfigForm.duration}
                  onChange={(e) => setTrialMinterConfigForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-green-400/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-white/70 text-sm font-medium">
                    Global Cap (tokens)
                  </label>
                  <InfoIcon 
                    tooltip="Maximum total tokens that can be granted via trials" 
                    position="top"
                  />
                </div>
                <input
                  type="number"
                  placeholder="10000"
                  step="0.000000000000000001"
                  value={trialMinterConfigForm.globalCap}
                  onChange={(e) => setTrialMinterConfigForm(prev => ({ ...prev, globalCap: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-green-400/50"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-white/70 text-sm font-medium">
                    Cooldown (seconds)
                  </label>
                  <InfoIcon 
                    tooltip="Time users must wait between trial requests (e.g., 604800 = 1 week)" 
                    position="top"
                  />
                </div>
                <input
                  type="number"
                  placeholder="604800"
                  value={trialMinterConfigForm.cooldown}
                  onChange={(e) => setTrialMinterConfigForm(prev => ({ ...prev, cooldown: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-green-400/50"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="minterEnabled"
                checked={trialMinterConfigForm.enabled}
                onChange={(e) => setTrialMinterConfigForm(prev => ({ ...prev, enabled: e.target.checked }))}
                className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="minterEnabled" className="text-white/70 text-sm">
                Enable Trial Minter
              </label>
            </div>

            <button
              type="submit"
              disabled={trialMinterConfigPending || trialMinterConfigTxLoading}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {(trialMinterConfigPending || trialMinterConfigTxLoading) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {trialMinterConfigPending ? "Confirming..." : "Processing..."}
                </>
              ) : (
                "Update Minter Config"
              )}
            </button>
          </form>
        </div>

        {/* Trial Burner Configuration */}
        <div className="bg-black/20 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              B
            </div>
            <h4 className="text-lg font-medium text-white">Trial Burner Config</h4>
            <InfoIcon 
              tooltip="Configure trial burning parameters: duration, cooldown, and enable/disable" 
              position="top"
            />
          </div>

          <form onSubmit={handleSetTrialBurnerConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-white/70 text-sm font-medium">
                    Duration (seconds)
                  </label>
                  <InfoIcon 
                    tooltip="How long burner trial access lasts (e.g., 86400 = 1 day)" 
                    position="top"
                  />
                </div>
                <input
                  type="number"
                  placeholder="86400"
                  value={trialBurnerConfigForm.duration}
                  onChange={(e) => setTrialBurnerConfigForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400/50"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <label className="block text-white/70 text-sm font-medium">
                    Cooldown (seconds)
                  </label>
                  <InfoIcon 
                    tooltip="Time users must wait between burner trial requests" 
                    position="top"
                  />
                </div>
                <input
                  type="number"
                  placeholder="604800"
                  value={trialBurnerConfigForm.cooldown}
                  onChange={(e) => setTrialBurnerConfigForm(prev => ({ ...prev, cooldown: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400/50"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="burnerEnabled"
                checked={trialBurnerConfigForm.enabled}
                onChange={(e) => setTrialBurnerConfigForm(prev => ({ ...prev, enabled: e.target.checked }))}
                className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="burnerEnabled" className="text-white/70 text-sm">
                Enable Trial Burner
              </label>
            </div>

            <button
              type="submit"
              disabled={trialBurnerConfigPending || trialBurnerConfigTxLoading}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {(trialBurnerConfigPending || trialBurnerConfigTxLoading) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {trialBurnerConfigPending ? "Confirming..." : "Processing..."}
                </>
              ) : (
                "Update Burner Config"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Admin Instructions */}
      <div className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-lg">
        <h5 className="text-purple-200 font-medium mb-2">🔧 Admin Configuration Guide:</h5>
        <ul className="text-purple-100 text-sm space-y-1 list-disc list-inside">
          <li><strong>Allowance</strong>: Number of tokens users can mint during trial period</li>
          <li><strong>Duration</strong>: How long trial access lasts (in seconds, e.g., 86400 = 1 day)</li>
          <li><strong>Global Cap</strong>: Maximum total tokens that can be granted via trials</li>
          <li><strong>Cooldown</strong>: Time users must wait between trial requests (in seconds)</li>
          <li><strong>Enable/Disable</strong>: Toggle trial system on or off</li>
        </ul>
      </div>
    </div>
  );
}
