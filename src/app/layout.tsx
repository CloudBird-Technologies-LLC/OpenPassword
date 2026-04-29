import type { Metadata } from 'next';
import './globals.css';
import GlobalModals from '../components/GlobalModals';

export const metadata: Metadata = {
  title: 'OpenPassword',
  description: 'Open source password manager',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="app-container">
          {children}
          <GlobalModals />
        </div>
      </body>
    </html>
  );
}
