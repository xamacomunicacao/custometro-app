import type { Metadata } from "next";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Custômetro Cynthia Blink",
  description: "Monitoramento Transparente de Gastos Parlamentares - Amazonas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --font-montserrat: 'Montserrat', sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
