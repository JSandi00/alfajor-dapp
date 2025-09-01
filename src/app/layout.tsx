import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web3 Sepolia App',
  description: 'Next.js Web3 application with RainbowKit and wagmi on Sepolia testnet',
  keywords: ['web3', 'ethereum', 'sepolia', 'nextjs', 'wagmi', 'rainbowkit'],
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
        </Providers>
      </body>
    </html>
  );
}
