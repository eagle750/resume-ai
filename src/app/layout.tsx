import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

const geistSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resumeai.in";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ResumeAI — AI Resume Tailor | ATS Optimization in 30 Seconds",
    template: "%s | ResumeAI",
  },
  description:
    "Paste a job description and get an ATS-optimized tailored resume in 30 seconds. Free AI resume tailor trusted by 10,000+ job seekers in India.",
  keywords: [
    "AI resume tailor",
    "ATS resume optimizer",
    "tailor resume to job description",
    "resume keyword optimizer",
    "ATS score checker",
    "AI resume builder India",
    "resume tailor free",
    "job description resume matcher",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "ResumeAI",
    title: "ResumeAI — AI Resume Tailor | ATS Optimization in 30 Seconds",
    description: "Paste a job description, get a perfectly tailored resume. Free.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ResumeAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeAI — Tailor Your Resume with AI",
    description: "Paste a job description, get a perfectly tailored resume. Free.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <WebsiteJsonLd />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
