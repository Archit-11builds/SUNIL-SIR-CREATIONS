import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CBSE Study Hub',
  description: 'A premium Class 10 CBSE study dashboard'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}