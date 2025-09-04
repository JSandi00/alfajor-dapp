# Alfajor Token DApp - Web3 Sepolia Application

A modern, responsive Next.js 14 Web3 application for interacting with the Alfajor Token contract on Sepolia testnet. Built with TypeScript, Tailwind CSS, wagmi, and RainbowKit for an optimal user experience.

## ✨ Features

### 🎨 Modern UI/UX Design
- **Responsive 2-column layout** on desktop, single column on mobile
- **Glass morphism cards** for each functionality panel
- **Interactive tooltips** explaining roles, allowances, expiry, and cooldown periods
- **Real-time status updates** with smooth animations
- **Toast notifications** for transaction feedback
- **Professional header** with contract info and Etherscan integration

### 🔐 Core Functionality
- **Wallet Integration**: Seamless connection with RainbowKit
- **Token Status**: Real-time balance and wallet information display
- **Trial System**: Request temporary minter/burner access for testing
- **Token Operations**: Mint, burn, and transfer tokens with role-based access
- **Allowance Management**: Two-step approve and burnFrom workflow
- **Admin Panel**: Configure trial parameters (admin-only access)

### 🛠 Technical Features
- Next.js 14 with App Router and TypeScript
- wagmi v2 for Ethereum interactions with React hooks
- viem for low-level Ethereum utilities
- RainbowKit for wallet connection UI
- TailwindCSS for responsive styling
- Real-time contract data with automatic refetching
- Comprehensive error handling and user feedback

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for transactions

### 1. Install Dependencies
```bash
npm install

# If you encounter autoprefixer errors:
npm install --save-dev autoprefixer@^10.4.16
```

### 2. Configure WalletConnect
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project and copy your Project ID
3. Open `src/lib/config.ts`
4. Replace `YOUR_PROJECT_ID` with your actual Project ID:
```typescript
projectId: 'your-actual-project-id-here'
```

### 3. Configure Your Contract
This is the **most important step** for the app to work properly.

#### Option A: Quick Setup (Using Existing Contract)
The app comes pre-configured with a working Alfajor contract on Sepolia. If you want to use it as-is, you can skip to step 4.

#### Option B: Use Your Own Contract
1. Open `src/lib/contract.ts`
2. Update the contract configuration:

```typescript
// Replace with your contract address
export const CONTRACT_ADDRESS: `0x${string}` = "0xYourContractAddressHere";

// Replace with your admin wallet address
export const ADMIN_ADDRESS: `0x${string}` = "0xYourAdminWalletHere";

// Replace with your contract's ABI
export const CONTRACT_ABI = [
  // Paste your full contract ABI here
  // Get this from Remix, Hardhat, Foundry, or Etherscan
];
```

**Finding Your Contract ABI:**
- **Remix**: Copy from "Compilation Details" after compiling
- **Hardhat**: Found in `artifacts/contracts/YourContract.sol/YourContract.json`
- **Foundry**: Found in `out/YourContract.sol/YourContract.json`
- **Etherscan**: Copy from "Contract" tab if contract is verified

### 4. Run the Application
```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

### 5. Setup MetaMask for Sepolia
If you don't have Sepolia configured:

**Add Sepolia Network to MetaMask:**
- Network Name: `Sepolia`
- RPC URL: `https://rpc.sepolia.org`
- Chain ID: `11155111`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia.etherscan.io`

**Get Test ETH:**
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

---

## 📱 How to Use the DApp

### 1. Connect Your Wallet
- Click "Connect Wallet" and choose your preferred wallet
- Approve the connection in your wallet
- Ensure you're on Sepolia testnet

### 2. Check Your Status
- **Status Card**: View your wallet address and token balance
- **Trial Access Card**: See your current minter/burner role status

### 3. Request Trial Access (For Testing)
- **Minter Trial**: Allows you to create new tokens temporarily
- **Burner Trial**: Allows you to destroy tokens temporarily
- Trials have duration limits and cooldown periods

### 4. Token Operations
- **Mint Tokens**: Create new tokens (requires minter access)
- **Burn Tokens**: Destroy tokens from your balance (requires burner access)
- **Allowance & BurnFrom**: Two-step process to burn tokens from other accounts

### 5. Admin Functions (Admin Only)
- **Configure Trial Parameters**: Set allowances, durations, and cooldowns
- **Enable/Disable Trials**: Control the trial system
- Only the configured admin address sees this panel

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── cards/              # Feature cards
│   │   ├── StatusCard.tsx      # Wallet status display
│   │   ├── TrialsCard.tsx      # Trial access management
│   │   ├── MintCard.tsx        # Token minting interface
│   │   ├── BurnCard.tsx        # Token burning interface
│   │   ├── AllowanceCard.tsx   # Allowance management
│   │   └── AdminPanel.tsx      # Admin configuration
│   ├── dashboard/
│   │   └── ContractDashboard.tsx # Main dashboard layout
│   ├── ui/
│   │   ├── ContractHeader.tsx    # Contract information header
│   │   └── Tooltip.tsx          # Interactive tooltips
│   ├── token/              # Token interaction components
│   └── providers.tsx       # Web3 providers setup
├── lib/
│   ├── config.ts           # wagmi configuration
│   ├── contract.ts         # 🔧 CONTRACT CONFIG (EDIT THIS)
│   ├── token-hooks.ts      # React hooks for token interactions
│   └── networks.ts         # Network utilities
└── ...
```

### Key Configuration Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/lib/contract.ts` | **Contract address, ABI, admin wallet** | ✅ **Always edit for your contract** |
| `src/lib/config.ts` | WalletConnect Project ID | ✅ **Edit for your WalletConnect project** |
| `src/app/layout.tsx` | App metadata and layout | Rarely needed |
| `tailwind.config.ts` | Styling configuration | Only for design changes |

---

## 🧪 Testing on Sepolia

### Contract Interaction Flow
1. **Connect Wallet** → Verify you're on Sepolia testnet
2. **Check Status** → See your token balance and role permissions
3. **Request Trial** → Get temporary minter/burner access for testing
4. **Test Minting** → Create tokens to test the mint functionality
5. **Test Burning** → Destroy tokens to test the burn functionality
6. **Test Allowances** → Test approve/burnFrom workflow
7. **Admin Testing** → Configure trial parameters (if you're the admin)

### Common Testing Scenarios
- **New User Flow**: Connect → Request Trials → Mint Tokens → Burn Tokens
- **Allowance Flow**: Approve yourself → BurnFrom your own tokens
- **Admin Flow**: Update trial configurations → Test new parameters
- **Error Handling**: Try operations without permissions to test error messages

---

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:clean        # Clear cache and start development

# Production
npm run build            # Build for production
npm run start            # Start production server

# Maintenance
npm run lint             # Run ESLint
npm run clean            # Clear Next.js cache
```

---

## 🔍 Troubleshooting

### Common Issues

**"Contract not found" or errors:**
- ✅ Verify `CONTRACT_ADDRESS` in `src/lib/contract.ts` is correct
- ✅ Ensure `CONTRACT_ABI` is complete and properly formatted
- ✅ Check you're connected to Sepolia testnet
- ✅ Verify the contract is deployed at that address

**"Wallet connection issues":**
- ✅ Make sure MetaMask is installed and unlocked
- ✅ Verify you have the correct `PROJECT_ID` in `src/lib/config.ts`
- ✅ Try refreshing the page or restarting the dev server

**"No admin access" when expected:**
- ✅ Verify `ADMIN_ADDRESS` in `src/lib/contract.ts` matches your wallet
- ✅ Address comparison is case-sensitive
- ✅ Make sure you're connected with the correct wallet

**Transaction failures:**
- ✅ Ensure you have sufficient Sepolia ETH for gas
- ✅ Check you have the required role (minter/burner) for the operation
- ✅ Verify trial access hasn't expired

### Getting Help

1. **Check the Browser Console** for detailed error messages
2. **Use the Contract Diagnostics** feature in the app for step-by-step verification
3. **Verify on Etherscan** that your contract is deployed and matches your ABI
4. **Test with Small Amounts** first to avoid losing test tokens

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts to link your project
```

### Netlify
```bash
# Build the project
npm run build

# Deploy the 'out' folder to Netlify
```

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Heroku
- Railway
- Render

---

## 🔐 Security Considerations

### For Development
- ✅ Only use Sepolia testnet for testing
- ✅ Never commit private keys or sensitive data
- ✅ Keep your WalletConnect Project ID secure
- ✅ Use environment variables for sensitive configuration

### For Production
- ✅ Audit your smart contract thoroughly
- ✅ Use mainnet with caution and small amounts initially
- ✅ Implement proper access controls
- ✅ Consider rate limiting and additional security measures

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📞 Support

- **Documentation**: This README and in-app tooltips
- **Contract Setup**: See `CONTRACT_SETUP.md` for detailed instructions
- **Issues**: Use the GitHub Issues tab for bug reports
- **Community**: Join the discussion in GitHub Discussions

---

**Happy Building! 🚀**

The Alfajor Token DApp provides a comprehensive, user-friendly interface for interacting with your ERC20 token contract. With its modern design, helpful tooltips, and robust error handling, it's perfect for both development and production use.
