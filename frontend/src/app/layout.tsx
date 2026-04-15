import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { FloatingFlowers } from "@/components/ui/FloatingFlowers";
import { GlobalLoadingOverlay } from "@/components/ui/GlobalLoadingOverlay";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FloraMath 🌸",
  description: "A magical, personalized math quiz app — soft, encouraging, and beautiful.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} antialiased selection:bg-brand-light`} suppressHydrationWarning>
        <Providers>
          <GlobalLoadingOverlay />
          <FloatingFlowers />
          {children}
        </Providers>
      </body>
    </html>
  );
}
