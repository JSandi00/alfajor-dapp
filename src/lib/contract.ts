import { createPublicClient, createWalletClient, http, custom, getContract } from 'viem';
import { sepolia } from 'viem/chains';
import { getAccount, getWalletClient, getPublicClient } from 'wagmi/actions';
import { config } from './config';

// =============================================================================
// CONTRACT CONFIGURATION
// =============================================================================

/**
 * 🔧 CONFIGURE ADMIN ADDRESS HERE
 * Replace with the actual admin wallet address that should have access to admin functions
 * This address will see the Admin Control Panel in the dashboard
 */
export const ADMIN_ADDRESS: `0x${string}` = "0x24d3DF4f3Bd673f5ACF8398076636242BBda3792"; // Replace with actual admin address


export const CONTRACT_ADDRESS: `0x${string}` = "0xD4f9B52777dDEa5002A6B44C249A4dE16fdEFc79";
export const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * 🔧 PASTE YOUR CONTRACT ABI HERE
 * Replace the placeholder array below with your actual ControlledTokenExtended ABI JSON
 * 
 * To get your ABI:
 * 1. From Remix: Copy from the "Compilation Details" after compiling
 * 2. From Hardhat: Copy from artifacts/contracts/YourContract.sol/YourContract.json
 * 3. From Foundry: Copy from out/YourContract.sol/YourContract.json
 * 4. From Etherscan: Copy from the "Contract" tab if verified
 * 
 * Paste the complete ABI array here, including all functions, events, and errors
 */
export const CONTRACT_ABI =
      [
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "name_",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "symbol_",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "admin_",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "initialSupply_",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cap_",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "adminUnlimitedMinter",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "AccessControlBadConfirmation",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "neededRole",
              "type": "bytes32"
            }
          ],
          "name": "AccessControlUnauthorizedAccount",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "AccessExpired",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "AllowanceExceeded",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CapExceeded",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "allowance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "needed",
              "type": "uint256"
            }
          ],
          "name": "ERC20InsufficientAllowance",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "balance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "needed",
              "type": "uint256"
            }
          ],
          "name": "ERC20InsufficientBalance",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "approver",
              "type": "address"
            }
          ],
          "name": "ERC20InvalidApprover",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "receiver",
              "type": "address"
            }
          ],
          "name": "ERC20InvalidReceiver",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            }
          ],
          "name": "ERC20InvalidSender",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            }
          ],
          "name": "ERC20InvalidSpender",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "InvalidAdmin",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "nextAvailable",
              "type": "uint256"
            }
          ],
          "name": "TrialCooldownActive",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "TrialGlobalCapReached",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "TrialsDisabled",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            }
          ],
          "name": "BurnerExpiryUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "allowance",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            }
          ],
          "name": "MinterAccessGranted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "previousAdminRole",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "newAdminRole",
              "type": "bytes32"
            }
          ],
          "name": "RoleAdminChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            }
          ],
          "name": "RoleGranted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address"
            }
          ],
          "name": "RoleRevoked",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            }
          ],
          "name": "TrialBurnerClaimed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "allowance",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            }
          ],
          "name": "TrialClaimed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "allowance",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "duration",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "globalCap",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "cooldown",
              "type": "uint256"
            }
          ],
          "name": "TrialConfigUpdated",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "BURNER_ROLE",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "DEFAULT_ADMIN_ROLE",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "MINTER_ROLE",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            }
          ],
          "name": "allowance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "approve",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "burn",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "burnFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "cap",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [
            {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            }
          ],
          "name": "getRoleAdmin",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "globalTrialCap",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "globalTrialGranted",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "grantRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "hasRole",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "lastTrialAt",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "lastTrialBurnerAt",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "mint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "callerConfirmation",
              "type": "address"
            }
          ],
          "name": "renounceRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "requestTrialBurner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "requestTrialMinter",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "revokeRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "duration_",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cooldown_",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "enabled_",
              "type": "bool"
            }
          ],
          "name": "setTrialBurnerConfig",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "allowance_",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "duration_",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "enabled_",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "globalCap_",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cooldown_",
              "type": "uint256"
            }
          ],
          "name": "setTrialMinterConfig",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "transfer",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "transferFrom",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "trialBurnerCooldown",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "trialBurnerDuration",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "trialBurnerEnabled",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "trialMinterAllowance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "trialMinterCooldown",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "trialMinterDuration",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "trialMinterEnabled",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ];

// =============================================================================
// CLIENT HELPERS
// =============================================================================

/**
 * Get a configured public client for reading from the blockchain
 * Use this for view functions, reading events, etc.
 */
export function getSepoliaPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http()
  });
}

/**
 * Get a configured wallet client for writing to the blockchain
 * Use this for transactions that require signing
 */
export async function getSepoliaWalletClient() {
  const account = getAccount(config);
  
  if (!account.address) {
    throw new Error('No wallet connected');
  }

  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum!),
    account: account.address
  });
}

/**
 * Get the wagmi public client (recommended approach)
 * This uses the same client instance as wagmi hooks
 */
export function getWagmiPublicClient() {
  return getPublicClient(config, { chainId: sepolia.id });
}

/**
 * Get the wagmi wallet client (recommended approach)
 * This uses the same client instance as wagmi hooks
 */
export async function getWagmiWalletClient() {
  return await getWalletClient(config, { chainId: sepolia.id });
}

// =============================================================================
// CONTRACT INSTANCE HELPERS
// =============================================================================

/**
 * Get a contract instance for reading (view functions)
 * Uses the public client - no wallet connection required
 */
export function getTokenContract() {
  const publicClient = getSepoliaPublicClient();
  
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: publicClient
  });
}

/**
 * Get a contract instance for writing (transactions)
 * Uses the wallet client - requires connected wallet
 */
export async function getTokenContractWithWallet() {
  const publicClient = getSepoliaPublicClient();
  const walletClient = await getSepoliaWalletClient();
  
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: {
      public: publicClient,
      wallet: walletClient
    }
  });
}

/**
 * Get a contract instance using wagmi clients (recommended)
 * This approach integrates better with wagmi hooks and state management
 */
export async function getWagmiTokenContract() {
  const publicClient = getWagmiPublicClient();
  const walletClient = await getWagmiWalletClient();
  
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: {
      public: publicClient!,
      wallet: walletClient!
    }
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if the given address is the configured admin
 */
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}

/**
 * Check if the contract address is properly configured
 */
export function isContractConfigured(): boolean {
  return CONTRACT_ADDRESS !== PLACEHOLDER_ADDRESS;
}

/**
 * Validate the contract configuration
 */
export function validateContractConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isContractConfigured()) {
    errors.push("Contract address not configured (still using placeholder)");
  }
  
  if (CONTRACT_ABI.length === 0) {
    errors.push("Contract ABI is empty");
  }
  
  if (CONTRACT_ADDRESS && !CONTRACT_ADDRESS.startsWith('0x')) {
    errors.push("Contract address should start with '0x'");
  }
  
  if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.length !== 42) {
    errors.push("Contract address should be 42 characters long (including 0x)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Type for the contract instance (read-only)
 */
export type TokenContract = ReturnType<typeof getTokenContract>;

/**
 * Type for the contract instance (read-write)
 */
export type TokenContractWithWallet = Awaited<ReturnType<typeof getTokenContractWithWallet>>;

/**
 * Common ERC20 token info interface
 * Extend this if your ControlledTokenExtended has additional properties
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  address: string;
}

/**
 * Token balance and allowance info for a specific address
 */
export interface UserTokenInfo {
  address: string;
  balance: bigint;
  formattedBalance: string;
  allowances: Record<string, bigint>; // spender address -> allowance amount
}
