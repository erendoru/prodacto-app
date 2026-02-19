import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prodacto — AI-Powered Product Management Assistant",
  description:
    "Write PRDs with voice commands, score your backlog, analyze markets. The AI copilot for PMs.",
  keywords: [
    "product management",
    "AI",
    "PRD",
    "backlog",
    "user story",
    "voice commands",
    "product manager",
  ],
  openGraph: {
    title: "Prodacto — Manage Products by Talking",
    description:
      "Write PRDs with voice commands, score your backlog, analyze markets. The AI copilot for PMs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
