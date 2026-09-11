export function SectionBlend({ tone = "dark" }: { tone?: "dark" | "light" | "image" }) { return <div aria-hidden="true" className={`section-blend ${tone}`} />; }
