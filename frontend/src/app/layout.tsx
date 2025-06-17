// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { UserProvider } from "../context/sessionContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FocusFlow App",
  description: "Verwalten Sie Ihre Aufgaben und Teams effizient",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="font-sans antialiased bg-zinc-50 text-zinc-900">
        <UserProvider>
            {children}
        </UserProvider>
      </body>
    </html>
  );
}