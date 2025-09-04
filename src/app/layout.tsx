import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Alfajor Sepolia App',
  description: 'Next.js Web3 application with RainbowKit and wagmi on Sepolia testnet',
  keywords: ['web3', 'ethereum', 'sepolia', 'nextjs', 'wagmi', 'rainbowkit'],
  icons: [
      { url: '/favicon.ico', sizes: 'any' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
              },
              success: {
                style: {
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: 'rgb(187, 247, 208)',
                },
              },
              error: {
                style: {
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'rgb(254, 202, 202)',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
