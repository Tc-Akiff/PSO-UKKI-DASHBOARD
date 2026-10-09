import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Pelan Strategik Organisasi PSUKPP',
  description: 'Sistem Pemantauan Prestasi PSO PSUKPP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body className="bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
