import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quizio",
  description: "A trivia and learning app with multiple game modes, geography maps, and AI-generated questions.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Quizio",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundColor: "#0f0f1a",
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(99,102,241,0.13) 0%, transparent 100%), radial-gradient(ellipse 60% 50% at 85% 100%, rgba(139,92,246,0.09) 0%, transparent 100%)",
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
