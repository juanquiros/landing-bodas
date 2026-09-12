import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://marcelo-y-karina.impulsodigitalmisiones.com.ar";
const title = "Karina & Marcelo | 21.11.2026";
const description = "Nos casamos. Te esperamos para compartir una noche inolvidable.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Karina & Marcelo",
    title,
    description,
    images: [{
      url: "/og/karina-marcelo-share.png",
      width: 1734,
      height: 900,
      alt: "Karina y Marcelo — 21 de noviembre de 2026",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og/karina-marcelo-share.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
