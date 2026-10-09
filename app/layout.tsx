import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard PSO PSUKPP',
  description: 'Pelan Strategik Organisasi Pejabat Setiausaha Kerajaan Negeri Pulau Pinang',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
