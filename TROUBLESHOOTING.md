# Troubleshooting Guide

## Common Issues and Solutions

### 1. Webpack Caching Error (ENOENT)

**Error:** `ENOENT: no such file or directory, rename '...0.pack.gz_' -> '...0.pack.gz'`

**Solutions:**

#### Option 1: Quick Fix (Recommended)
```bash
# Clear cache and restart
npm run dev:clean
```

#### Option 2: Manual Cleanup
```bash
# Stop the development server (Ctrl+C)
# Then run:
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

#### Option 3: Complete Reset
```bash
# Stop the development server
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### 2. WalletConnect Issues

**Error:** RainbowKit connection fails

**Solution:**
1. Make sure you've replaced `YOUR_PROJECT_ID` in `src/lib/config.ts`
2. Get a free Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
3. Restart the development server after updating the config

### 3. MetaMask Connection Issues

**Solutions:**
1. Make sure MetaMask is installed
2. Switch to Sepolia testnet in MetaMask
3. Clear MetaMask cache: Settings > Advanced > Reset Account
4. Refresh the browser page

### 4. Network Configuration

If Sepolia testnet is not available in MetaMask, add it manually:

**Sepolia Testnet Details:**
- Network Name: `Sepolia`
- RPC URL: `https://rpc.sepolia.org`
- Chain ID: `11155111`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia.etherscan.io`

### 5. TypeScript Errors

**Error:** Various TypeScript compilation errors

**Solutions:**
```bash
# Clear TypeScript cache
rm -rf .next
npx tsc --build --clean
npm run dev
```

### 6. Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### 7. Module Resolution Errors

**Error:** Can't resolve wagmi/viem modules

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Quick Commands Reference

```bash
# Clear all caches and restart
npm run dev:clean

# Just clear caches
npm run clean

# Build with clean cache
npm run build:clean

# Check for common issues
npm run lint

# Install missing dependencies
npm install
```

## Still Having Issues?

### 8. Console Errors from Coinbase/RainbowKit

**Errors:** 
- `https://cca-lite.coinbase.com/amp net::ERR_BLOCKED_BY_CLIENT`
- `https://cca-lite.coinbase.com/metrics net::ERR_ABORTED 401 (Unauthorized)`

**Cause:** AdBlock extensions or network policies blocking Coinbase analytics

**Solutions:**
```typescript
// Update src/lib/config.ts to disable analytics
export const config = getDefaultConfig({
  appName: 'Web3 Sepolia App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia],
  ssr: true,
  appInfo: {
    appName: 'Web3 Sepolia App',
    learnMoreUrl: undefined,
    disclaimer: undefined,
  },
});
```

**Note:** These errors don't affect wallet functionality - they're just analytics that get blocked.

## Still Having Issues?

1. **Check Node.js version:** Make sure you're using Node.js 18+ 
   ```bash
   node --version
   ```

2. **Check npm version:**
   ```bash
   npm --version
   ```

3. **Clear browser cache:** Hard refresh (Cmd/Ctrl + Shift + R)

4. **Check browser console:** Look for any JavaScript errors

5. **Verify file permissions:** Make sure you have write permissions to the project directory

## Performance Tips

1. **Use clean commands** when switching between branches
2. **Keep node_modules updated** with `npm update`
3. **Clear browser cache** regularly during development
4. **Use incognito mode** to test without extensions
5. **Check disk space** - insufficient space can cause caching issues

## Environment Setup

Make sure your development environment has:
- Node.js 18 or higher
- npm 9 or higher
- Modern browser (Chrome, Firefox, Safari, Edge)
- MetaMask browser extension
- Sufficient disk space (at least 1GB free)
