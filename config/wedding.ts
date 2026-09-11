export const wedding = {
  couple: { bride: "Karina", groom: "Marcelo", initials: "K & M" }, date: "2026-11-21", time: "21:00",
  venue: { name: "LUGAR DEL EVENTO", address: "Muy pronto te contamos dónde nos encontramos.", mapUrl: "https://maps.google.com" },
  schedule: [["21:00", "Llegada"], ["21:30", "Ceremonia"], ["22:00", "Brindis"], ["23:00", "Cena"], ["23:30", "Fiesta"], ["05:00", "Volvemos... o eso intentaremos."]],
  assets: { heroVideo: "/video/hero-wedding.mp4", heroFallback: "/images/hero-fallback.webp", audio: "/audio/wedding-theme.mp3" },
} as const;
