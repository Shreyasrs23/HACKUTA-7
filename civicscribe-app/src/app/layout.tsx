// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TutorialProvider } from "@/components/Tutorial/TutorialProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CivicScribe - Government Forms Made Simple",
  description: "Complete government forms through conversation. AI-powered form assistant that finds, fills, and submits official forms for you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TutorialProvider>
          {children}
        </TutorialProvider>
      </body>
    </html>
  );
}