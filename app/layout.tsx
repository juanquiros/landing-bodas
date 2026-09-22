import type { Metadata } from "next";
import { wedding } from "@/config/wedding";
import "./globals.css";

const title = wedding.copy.metadataTitle;
const description = wedding.copy.metadataDescription;

export const metadata: Metadata = {
  metadataBase: new URL(wedding.metadata.siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: wedding.metadata.siteName,
    title,
    description,
    images: [{
      url: wedding.metadata.ogImage,
      width: 1200,
      height: 630,
      alt: wedding.metadata.ogAlt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [wedding.metadata.ogImage],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
