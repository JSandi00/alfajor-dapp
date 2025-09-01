# Web3 Sepolia App

A modern Next.js 14 Web3 application with wagmi, viem, and RainbowKit configured for Sepolia testnet.

## Features

✅ Next.js 14 with App Router  
✅ TypeScript configuration  
✅ TailwindCSS styling  
✅ wagmi for Ethereum interactions  
✅ viem for low-level Ethereum utilities  
✅ RainbowKit for wallet connection UI  
✅ Sepolia testnet configuration  
✅ Real-time balance display  
✅ Network detection  
✅ Responsive design with animations  
✅ **ERC20 Token Contract Integration**  
✅ **Token Information Display**  
✅ **Token Transfer Functionality**  
✅ **Contract Diagnostics & Troubleshooting**  
✅ **Interactive Contract Verification**  
✅ **Real-time Status Monitoring**  

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

   If you get an autoprefixer error, run:
   ```bash
   npm install --save-dev autoprefixer@^10.4.16
   ```

2. **Configure WalletConnect Project ID:**
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID
   - Replace `YOUR_PROJECT_ID` in `src/lib/config.ts` with your actual Project ID

3. **Configure your ERC20 contract:**
   - Open `src/lib/contract.ts`
   - Replace `CONTRACT_ADDRESS` with your ControlledTokenExtended contract address
   - Replace `CONTRACT_ABI` with your contract's ABI JSON
   - See `CONTRACT_SETUP.md` for detailed instructions

4. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🚀 Contract Interaction Features

Once your wallet is connected:

### Core Features
- **Token Information Panel**: View contract details, total supply, and your balance
- **Token Transfer**: Send tokens to any Ethereum address with validation
- **Transaction Tracking**: Monitor transaction status with Etherscan links
- **Network Detection**: Automatic network validation and warnings

### Diagnostics & Troubleshooting  
- **Interactive Diagnostics**: Toggle-able contract verification panel
- **Step-by-Step Validation**: Comprehensive setup verification
  - Contract configuration check
  - Contract accessibility test
  - Network connection verification
  - Wallet connection status
  - Token balance validation
  - Transfer readiness assessment
- **Quick Actions**: Direct links to Etherscan and token holdings
- **Real-time Status**: Live updates on all system components
- **Error Handling**: Clear error messages and actionable solutions

## Setup MetaMask for Sepolia

If you don't have Sepolia configured in MetaMask:

**Network Details:**
- Network Name: Sepolia
- RPC URL: `https://rpc.sepolia.org`
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: `https://sepolia.etherscan.io`

## Get Test ETH

Get free Sepolia ETH from faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

## Testing

1. Open the app in your browser
2. Make sure MetaMask is installed and connected to Sepolia
3. Click "Connect Wallet"
4. Approve the connection in MetaMask
5. Your address and balance should appear on the page

## Project Structure

```
web3-sepolia-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Main page with wallet & contract UI
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── providers.tsx       # Web3 providers setup
│   │   └── token/              # Token contract components
│   │       ├── TokenInfo.tsx   # Token information display
│   │       ├── TokenTransfer.tsx # Token transfer functionality
│   │       └── index.ts        # Component exports
│   └── lib/
│       ├── config.ts           # wagmi configuration
│       ├── contract.ts         # 🔧 CONTRACT CONFIG (EDIT THIS)
│       ├── token-hooks.ts      # React hooks for token interactions
│       └── networks.ts         # Network utilities
├── CONTRACT_SETUP.md           # Contract setup instructions
├── TROUBLESHOOTING.md          # Troubleshooting guide
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript interface for Ethereum
- **RainbowKit** - Wallet connection UI
- **TanStack Query** - Data fetching and caching

## Environment Variables

Create a `.env.local` file in the root directory if you need custom environment variables:

```env
# Optional: Custom RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_custom_rpc_url
```

## Deployment

This app can be deployed to Vercel, Netlify, or any other platform that supports Next.js:

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
