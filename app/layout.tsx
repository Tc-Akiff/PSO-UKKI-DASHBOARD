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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
