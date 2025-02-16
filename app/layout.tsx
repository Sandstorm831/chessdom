import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { playfair_display } from "./ui/fonts";
import Navbar from "./ui/navbar";
import StoreProvider from "./storeProvider";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chessdom",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <SessionProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${playfair_display.className} antialiased h-screen w-screen flex flex-col`}
          >
            <Script src="/lib/stockfish.js" strategy="afterInteractive" />
            <Navbar />
            <div className="grow">{children}</div>
          </body>
        </html>
      </SessionProvider>
    </StoreProvider>
  );
}
