# ERC20 Contract Integration Guide

## 🚀 Quick Setup

Your `lib/contract.ts` file is ready to use! Just follow these 2 simple steps:

### Step 1: Add Your Contract Address
In `src/lib/contract.ts`, find this line:
```typescript
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
```

Replace with your actual deployed contract address:
```typescript
export const CONTRACT_ADDRESS = "0xYOUR_ACTUAL_CONTRACT_ADDRESS_HERE" as const;
```

### Step 2: Add Your Contract ABI
In `src/lib/contract.ts`, find the `CONTRACT_ABI` array and replace the example ABI with your actual ControlledTokenExtended ABI JSON.

## 📋 How to Get Your ABI

### From Remix IDE:
1. Compile your contract
2. Go to the "contracts" folder in the file explorer
3. Expand your contract folder
4. Click on your contract name
5. Copy the entire ABI array from the "ABI" section

### From Hardhat:
```bash
# ABI location
./artifacts/contracts/ControlledTokenExtended.sol/ControlledTokenExtended.json
```
Copy the `abi` field from this JSON file.

### From Foundry:
```bash
# ABI location
./out/ControlledTokenExtended.sol/ControlledTokenExtended.json
```
Copy the `abi` field from this JSON file.

### From Etherscan (if verified):
1. Go to your contract on Sepolia Etherscan
2. Navigate to the "Contract" tab
3. Scroll down to "Contract ABI"
4. Copy the ABI JSON

## 🎯 Usage Examples

Once configured, you can use the contract in your components:

### Reading Token Info:
```typescript
import { useTokenInfo, useTokenBalance } from '@/lib/token-hooks';

function TokenDisplay() {
  const { name, symbol, decimals, totalSupply } = useTokenInfo();
  const { balance, formattedBalance } = useTokenBalance(userAddress);

  return (
    <div>
      <h2>{name} ({symbol})</h2>
      <p>Your Balance: {formattedBalance}</p>
      <p>Total Supply: {totalSupply?.toString()}</p>
    </div>
  );
}
```

### Transferring Tokens:
```typescript
import { useTokenTransfer } from '@/lib/token-hooks';

function TransferForm() {
  const { transfer, isPending, isConfirmed, hash } = useTokenTransfer();

  const handleTransfer = async () => {
    await transfer('0xRecipientAddress', '100'); // Transfer 100 tokens
  };

  return (
    <button onClick={handleTransfer} disabled={isPending}>
      {isPending ? 'Transferring...' : 'Transfer'}
    </button>
  );
}
```

### Approving Tokens:
```typescript
import { useTokenApproval } from '@/lib/token-hooks';

function ApprovalForm() {
  const { approve, isPending, isConfirmed } = useTokenApproval();

  const handleApprove = async () => {
    await approve('0xSpenderAddress', '1000'); // Approve 1000 tokens
  };

  return (
    <button onClick={handleApprove} disabled={isPending}>
      {isPending ? 'Approving...' : 'Approve'}
    </button>
  );
}
```

## 🔧 Available Functions

### Contract Helpers:
- `getTokenContract()` - Read-only contract instance
- `getTokenContractWithWallet()` - Read-write contract instance
- `getWagmiTokenContract()` - Wagmi-integrated contract instance
- `validateContractConfig()` - Validate your configuration
- `isContractConfigured()` - Check if address is set

### React Hooks:
- `useTokenInfo()` - Get name, symbol, decimals, total supply
- `useTokenBalance(address)` - Get balance for an address
- `useTokenAllowance(owner, spender)` - Get allowance amount
- `useTokenTransfer()` - Transfer tokens
- `useTokenApproval()` - Approve token spending

### Utility Functions:
- `formatTokenAmount()` - Format amounts for display
- `parseTokenAmount()` - Parse user input to wei
- `validateTokenAmount()` - Validate amount input

## 🛠 Extended Functionality

If your ControlledTokenExtended contract has additional functions (mint, burn, pause, etc.), you can:

1. **Add them to the ABI** when you paste your contract ABI
2. **Create custom hooks** following the patterns in `token-hooks.ts`
3. **Uncomment and modify** the example mint/burn hooks provided

Example for adding a pause function:
```typescript
export function useTokenPause() {
  const { writeContract, data: hash, error } = useWriteContract();

  const pause = async () => {
    await writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'pause',
      args: [],
    });
  };

  return { pause, hash, error };
}
```

## ✅ Configuration Validation

After setting up your contract, you can validate the configuration:

```typescript
import { validateContractConfig } from '@/lib/contract';

const { isValid, errors } = validateContractConfig();
if (!isValid) {
  console.error('Contract configuration errors:', errors);
}
```

## 📁 File Structure

```
src/lib/
├── contract.ts       # Main contract configuration (EDIT THIS)
├── token-hooks.ts    # React hooks for token interactions
├── config.ts         # Wagmi configuration
└── networks.ts       # Network utilities
```

## 🚨 Important Notes

1. **Never commit private keys** or sensitive data to your repository
2. **Test on testnet first** before deploying to mainnet
3. **Validate inputs** before making transactions
4. **Handle errors gracefully** in your UI components
5. **Use proper TypeScript types** for better development experience

## 🔒 Security Considerations

- Always validate user inputs
- Use proper error boundaries in React components
- Implement proper loading states
- Never trust client-side validation alone
- Consider implementing transaction confirmation flows
