import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const svgIconHref = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect width='32' height='32' fill='white'/><path stroke='black' stroke-width='2' fill='none' d='M16 5 L8 10 L8 20 L16 25 L24 20 L24 10 L16 5 M8 10 L16 15 L24 10 M16 15 L16 25'/></svg>";

export const metadata: Metadata = {
  title: 'CodeComplexer - Intelligent Code Analyzer',
  description: 'An intelligent code editor with real-time analysis and AI-powered suggestions.',
  icons: {
    icon: svgIconHref,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
