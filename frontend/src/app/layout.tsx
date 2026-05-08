import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SpeakUp - Master English Speaking",
  description:
    "Practice English speaking with AI-powered conversations, pronunciation feedback, and personalized lessons. Join thousands improving their English fluency.",
  keywords: [
    "English speaking",
    "language learning",
    "AI conversation",
    "pronunciation",
    "ESL",
    "CEFR",
  ],
  openGraph: {
    title: "SpeakUp - Master English Speaking",
    description:
      "Practice English speaking with AI-powered conversations and pronunciation feedback.",
    type: "website",
    url: "https://speakup.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
