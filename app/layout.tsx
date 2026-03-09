import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MotoRent Pro',
  description: 'Operational command center for your motorcycle rental business.',
};

function MissingApiKeyError() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#fef2f2',
      color: '#b91c1c',
      fontFamily: 'sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Configuration Error</h1>
      <p style={{ marginBottom: '0.5rem' }}>Your Firebase API Key is missing or invalid.</p>
      <p style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
        Please copy the configuration values from your Firebase project settings into the <strong>.env</strong> file in the root of this project and then restart the server.
      </p>
      <pre style={{
        backgroundColor: '#fee2e2',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #fecaca',
        color: '#991b1b',
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        width: '100%',
        maxWidth: '600px'
      }}>
        <code>
          {`# Open the .env file in your project
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN_HERE"
...etc`}
        </code>
      </pre>
    </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    // This special component will be rendered if the API key is missing.
    // It provides clear instructions to the user on how to fix it.
    return (
      <html lang="id">
        <body>
          <MissingApiKeyError />
        </body>
      </html>
    );
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn('font-body antialiased', inter.variable)}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
