import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auren',
  description: 'A premium CBSE Class 10 study command centre.'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
