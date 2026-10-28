import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ModelDeck | Multi-Provider BYOK AI Testing Playground",
  description:
    "Test frontier AI models (OpenAI, Claude 3.7, Gemini 2.5, DeepSeek R1, Groq, OpenRouter) with your own API keys. Features live SSE streaming, thinking traces, and multi-device key synchronization.",
  keywords: [
    "AI playground",
    "BYOK",
    "OpenAI",
    "Claude 3.7",
    "Google Gemini",
    "DeepSeek R1",
    "Groq",
    "OpenRouter",
    "Together AI",
    "LLM testing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#09090b] text-zinc-100 min-h-screen selection:bg-blue-600/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
