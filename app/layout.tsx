import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketplace Deployment Dashboard",
  description:
    "Executive dashboard for marketplace listings, deployment health, and product adoption across AWS, Azure, GCP, Databricks, and Anthropic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen w-screen overflow-hidden bg-background">
        <div className="flex h-full w-full">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="app-chrome flex h-[60px] shrink-0 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
              <p className="type-subtitle">
                Marketplace Deployment Dashboard
              </p>
            </header>
            <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
