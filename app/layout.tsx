import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Karina & Marcelo | 21.11.2026", description: "Nos casamos. Te esperamos para compartir una noche inolvidable.", openGraph: { title: "Karina & Marcelo | 21.11.2026", description: "Nos casamos. Te esperamos para compartir una noche inolvidable.", images: ["/og/wedding-share.jpg"] }, icons: { icon: "/favicon.svg" } };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body>{children}</body></html>}
