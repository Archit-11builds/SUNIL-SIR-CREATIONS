import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auren — Study with intent.',
  description: 'A premium Class 10 CBSE study command centre built for focus, consistency and board confidence.'
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
