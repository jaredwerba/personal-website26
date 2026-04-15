import type { Metadata, Viewport } from "next";
import "./globals.css";
import NervProviders from "@/components/NervProviders";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "JWERBA // Personal Terminal",
  description: "Jared Werba — projects, reads, photos, and more.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Fira+Code:wght@400;500&family=Barlow+Condensed:wght@300;400;500;600&family=Noto+Serif+JP:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-nerv-black text-nerv-white">
        <NervProviders>
          <Sidebar>{children}</Sidebar>
        </NervProviders>
      </body>
    </html>
  );
}
