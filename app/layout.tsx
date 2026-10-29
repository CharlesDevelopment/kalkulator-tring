import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tring! Cuan Analyzer | Kalkulator Cuan Emas Tring! by Pegadaian",
  description:
    "Kalkulator audit harga beli, potongan voucher, biaya admin multi-VA (BCA & Bank Lain), dan buyback emas Tring! by Pegadaian.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
