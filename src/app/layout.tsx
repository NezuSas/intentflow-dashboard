import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import { ClientThemeProvider } from "@/components/ClientThemeProvider";

// Rubik es la tipografía de NEZU en el kiosko y aquí: una sola familia, contraste por peso.
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IntentFlow · NEZU",
  description: "Panel administrativo del Nezu Intent Manager: intenciones, placas, comandos, clientes y suscripciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={rubik.variable}>
        <ClientThemeProvider>
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
