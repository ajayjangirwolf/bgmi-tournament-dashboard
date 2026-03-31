import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BGMI Tournament Dashboard",
  description: "Professional BGMI esports tournament management system",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}

