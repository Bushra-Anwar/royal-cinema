import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Royal Cinema ERP — Cloud Services & Multi-Station POS',
  description: 'Next-Generation Multi-Tenant Theatrical Cinema ERP, Box Office POS & Concessions Cloud Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f8f4f4] text-[#1a1616] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
