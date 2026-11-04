import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerCleaner } from "@/components/layout/ServiceWorkerCleaner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0c0807",
};

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ServiceWorkerCleaner />
        {children}
      </body>
    </html>
  );
}
