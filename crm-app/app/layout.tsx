import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM - Inštalačná firma",
  description: "CRM systém pre inštalačnú firmu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
