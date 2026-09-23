import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import { ClientThemeProvider } from "@/components/ClientThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntentFlow | Admin Dashboard",
  description: "Advanced Intent Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ClientThemeProvider>
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
