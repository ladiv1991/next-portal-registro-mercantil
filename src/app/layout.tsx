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
    "inscripción mercantil",
    "sociedades mercantiles",
    "NIRE",
    "constitución de sociedades",
    "gestión mercantil",
    "registro de comercio",
    "cuba gobierno",
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
    siteName: "Registro Mercantil de Cuba",
    locale: "es_CU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal del Registro Mercantil de Cuba",
    description:
      "Portal oficial del Registro Mercantil de Cuba. Consultas, trámites y servicios en línea.",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#005A9C" />
        <meta name="msapplication-TileColor" content="#005A9C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/favicon.png" sizes="180x180" />
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "GovernmentOrganization",
          "name": "Registro Mercantil de Cuba",
          "alternateName": "Oficina del Registro Mercantil",
          "description": "Organismo dependiente del Ministerio de Justicia de la República de Cuba, encargado del registro, inscripción y certificación de actos y documentos mercantiles.",
          "url": "https://registro-mercantil.xetid.cu",
          "logo": "https://registro-mercantil.xetid.cu/favicon.png",
          "parentOrganization": {
            "@type": "GovernmentOrganization",
            "name": "Ministerio de Justicia de la República de Cuba",
            "url": "https://www.minjus.gob.cu"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Calle Obispo No. 154, La Habana Vieja",
            "addressLocality": "La Habana",
            "addressCountry": "CU"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+53-7-862-3456",
            "contactType": "customer service",
            "availableLanguage": ["Spanish"],
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "08:30",
              "closes": "16:30"
            }
          },
          "sameAs": [],
          "areaServed": {
            "@type": "Country",
            "name": "Cuba"
          }
        })}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="skip-link">Ir al contenido principal</a>
        <PortalAuthProvider>
          {children}
        </PortalAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
