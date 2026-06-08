import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import UsernameModal from "@/components/ui/UsernameModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  viewportFit: 'cover',
};

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

const themeScript = `(function(){try{var t=localStorage.getItem('quizio-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div aria-hidden="true" className="app-bg fixed inset-0 -z-10 pointer-events-none" />
        <ThemeProvider>
          <AuthProvider>
            <UsernameModal />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
