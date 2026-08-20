import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PortalAuthProvider } from "@/hooks/use-portal-auth";

const geistSans = localFont({
  src: "../../public/fonts/Geist-Regular.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Portal del Registro Mercantil de Cuba | Ministerio de Justicia",
  description:
    "Portal oficial del Registro Mercantil de Cuba. Consultas públicas, trámites en línea, normativas, estadísticas y servicios de solicitud de Primera Inscripción de un Sujeto.",
  keywords: [
    "Registro Mercantil",
    "Cuba",
    "Ministerio de Justicia",
    "solicitud de Primera Inscripción de un Sujeto",
    "consultas públicas",
    "tramites",
    "certificaciones",
  ],
  authors: [{ name: "Registro Mercantil de Cuba" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Portal del Registro Mercantil de Cuba",
    description:
      "Portal oficial del Registro Mercantil de la República de Cuba. Acceda a consultas, trámites y servicios en línea.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <PortalAuthProvider>
          {children}
        </PortalAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
