// Console error filter for development
// Add this to your layout.tsx or a separate utility file

export const suppressKnownErrors = () => {
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    const originalWarn = console.warn;

    // Filter out known RainbowKit/Coinbase analytics errors
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Skip known analytics errors
      if (
        message.includes('cca-lite.coinbase.com') ||
        message.includes('ERR_BLOCKED_BY_CLIENT') ||
        message.includes('ERR_ABORTED 401') ||
        message.includes('Unauthorized')
      ) {
        return;
      }
      
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Skip known analytics warnings
      if (message.includes('coinbase') || message.includes('analytics')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
  }
};

// Call this in your _app.tsx or layout.tsx
// suppressKnownErrors();
