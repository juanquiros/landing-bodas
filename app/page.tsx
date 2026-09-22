"use client";

import { FormEvent, useEffect, useState } from "react";
import { AmbientGlow } from "@/components/AmbientGlow";
import { GiftSection } from "@/components/GiftSection";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ParallaxImage } from "@/components/ParallaxImage";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SectionBlend } from "@/components/SectionBlend";
import { WeddingNav } from "@/components/WeddingNav";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { wedding } from "@/config/wedding";
import { rsvps } from "@/services/rsvps";
import { songRequests, PublicSong } from "@/services/songRequests";

const photos = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85",
];

function useCountdown() {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, new Date("2026-11-22T00:00:00Z").getTime() - Date.now());
      setLeft({ d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return left;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div data-reveal className={`reveal ${className}`}>{children}</div>;
}

function useRevealMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );

    nodes.forEach((node) => observer.observe(node));
    document.documentElement.classList.add("motion-enabled");

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-enabled");
    };
  }, []);
}

export default function Home() {
  useRevealMotion();
  const time = useCountdown();
  const [songs, setSongs] = useState<PublicSong[]>([]);
  const [songNote, setSongNote] = useState("");
  const [rsvpNote, setRsvpNote] = useState("");
  const [songSubmitting, setSongSubmitting] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [songToken, setSongToken] = useState("");
  const [rsvpToken, setRsvpToken] = useState("");
  const [songCaptchaReset, setSongCaptchaReset] = useState(0);
  const [rsvpCaptchaReset, setRsvpCaptchaReset] = useState(0);

  useEffect(() => { void songRequests.all().then(setSongs); }, []);

  const sendSong = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (songSubmitting) return;
    const element = event.currentTarget;
    const form = new FormData(element);
    setSongSubmitting(true);
    setSongNote("");
    try {
      await songRequests.add({ guestName: String(form.get("guestName")), artist: String(form.get("artist")), title: String(form.get("title")), link: String(form.get("link")) || undefined, turnstileToken: songToken, honeypot: String(form.get("website") || "") });
      setSongs(await songRequests.all());
      setSongNote("✓ Listo. Ya tiene trabajo el DJ.");
      element.reset();
      setSongCaptchaReset((value) => value + 1);
    } catch (error) {
      setSongNote(error instanceof Error ? error.message : "No pudimos registrar tu canción. Intentá nuevamente.");
    } finally {
      setSongSubmitting(false);
    }
  };

  const sendRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rsvpSubmitting) return;
    const element = event.currentTarget;
    const form = new FormData(element);
    setRsvpSubmitting(true);
    setRsvpNote("");
    try {
      await rsvps.add({ fullName: String(form.get("name")), attending: String(form.get("attending")) as "yes" | "no", guestCount: Number(form.get("guests")), dietary: String(form.get("dietary")), message: String(form.get("message")), turnstileToken: rsvpToken, honeypot: String(form.get("website") || "") });
      setRsvpNote("Gracias por responder. ¡Nos hace muy felices!");
      element.reset();
      setRsvpCaptchaReset((value) => value + 1);
    } catch (error) {
      setRsvpNote(error instanceof Error ? error.message : "No pudimos registrar tu respuesta. Intentá nuevamente.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  return (
    <main>
      <ScrollProgress />
      <WeddingNav />

      <section id="inicio" className="hero" style={{ backgroundImage: `url(${photos[0]})` }}>
        <video autoPlay muted loop playsInline poster={wedding.assets.heroFallback} src={wedding.assets.heroVideo} />
        <div className="hero-copy">
          <p className="eyebrow">21 NOV 2026</p>
          <h1>KARINA <em>&amp;</em> MARCELO</h1>
          <p className="eyebrow">NOS CASAMOS</p>
          <blockquote>“Y queremos que formes parte de nuestra historia.”</blockquote>
        </div>
        <span className="scroll">SCROLL <b>↓</b></span>
      </section>

      <section className="intro"><div data-reveal className="intro-copy"><p>SI HAY BODA,</p><strong>HAY JODA.</strong></div></section>

      <section id="nosotros" className="couple">
        <SectionBlend tone="warmGlow" />
        <AmbientGlow className="glow-couple" />
        <p data-reveal className="transition-copy">Y QUEREMOS<br />QUE SEAS PARTE.</p>
        <ParallaxImage data-reveal="true" className="couple-main" src={photos[1]} alt="Pareja celebrando" />
        <ParallaxImage data-reveal="true" className="couple-small" src={photos[2]} alt="Detalles de una boda" />
        <Reveal className="couple-copy"><p className="eyebrow">UNA HISTORIA</p><h2>Karina<br /><em>&amp;</em> Marcelo</h2><p>“Una historia que sigue escribiéndose.”</p></Reveal>
      </section>

      <section className="story" style={{ backgroundImage: `url(${photos[3]})` }}>
        <div className="story-sticky">
          <p data-reveal>Nos encontramos.</p><p data-reveal>Nos elegimos.</p><p data-reveal>Nos acompañamos.</p><p data-reveal>Y ahora...</p><strong data-reveal>NOS CASAMOS.</strong>
        </div>
      </section>

      <section id="countdown" className="countdown">
        <SectionBlend tone="imageDissolve" /><AmbientGlow className="glow-countdown" />
        <p data-reveal className="eyebrow">FALTA MUY POQUITO...</p>
        <div data-reveal className="countdown-grid">
          {[[time.d, "DÍAS"], [time.h, "HORAS"], [time.m, "MIN"], [time.s, "SEG"]].map(([number, label]) => <div className="countdown-unit" key={String(label)}><span className="countdown-value">{String(number).padStart(2, "0")}</span><span className="countdown-label">{label}</span></div>)}
        </div>
      </section>

      <section id="evento" className="event">
        <img data-reveal src={photos[0]} alt="Atardecer de casamiento" />
        <div data-reveal><p className="eyebrow">EL GRAN DÍA</p><h2>SÁBADO<br /><b>21</b><br />NOVIEMBRE<br />2026</h2><p className="event-time">21:00 HS</p><h3>{wedding.venue.name}</h3><p>{wedding.venue.address}</p><a href={wedding.venue.mapUrl} target="_blank" rel="noreferrer">CÓMO LLEGAR →</a></div>
      </section>

      <section id="cronograma" className="timeline"><p data-reveal className="eyebrow">CRONOGRAMA</p><h2 data-reveal><span>UNA NOCHE</span><span>PARA RECORDAR</span></h2><ol>{wedding.schedule.map(([at, name]) => <Reveal key={at}><li><time>{at}</time><span>{name}</span></li></Reveal>)}</ol></section>

      <section id="dress-code" className="dress">
        <AmbientGlow className="glow-dress" />
        <div data-reveal><p className="eyebrow">DRESS</p><h2>DRESS<br /><em>CODE</em><br />FORMAL</h2><p>“Elegantes, cómodos y listos para bailar.”</p></div>
        <div data-reveal className="dress-imgs"><small>01 · ELLA</small><ParallaxImage src={photos[2]} alt="Look formal" /><small>02 · ÉL</small><ParallaxImage src={photos[1]} alt="Look formal masculino" /></div>
      </section>

      <section id="musica" className="songs">
        <AmbientGlow className="glow-songs" /><div data-reveal className="vinyl" aria-hidden="true" />
        <p data-reveal className="eyebrow">TU TEMA PARA LA FIESTA</p><h2 data-reveal>QUE SUENE<br /><em>TU TEMA</em></h2><p data-reveal>Una buena fiesta también la hacen los invitados.<br />Dejanos esa canción que no puede faltar.</p><div data-reveal className="wave">∿ ∿ ∿ ∿ ∿ ∿ ∿ ∿</div>
        <form data-reveal onSubmit={sendSong}><input required name="guestName" placeholder="Nombre" /><input required name="artist" placeholder="Artista" /><input required name="title" placeholder="Canción" /><input name="link" type="url" placeholder="Link Spotify / YouTube (opcional)" /><label className="honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label><TurnstileWidget onToken={setSongToken} resetKey={songCaptchaReset} /><button disabled={songSubmitting}>{songSubmitting ? "SUMANDO..." : "SUMAR A LA PLAYLIST →"}</button></form>
        {songNote && <p className="form-note">{songNote}</p>}
        {songs.length > 0 && <div className="requested"><p className="eyebrow">ALGUNOS TEMAS QUE YA PIDIERON</p>{songs.slice(0, 5).map((song, index) => <p key={`${song.title}-${song.artist}-${index}`}><b>{song.title}</b> — {song.artist}</p>)}</div>}
      </section>

      <GiftSection />

      <section id="galeria" className="gallery"><p data-reveal className="eyebrow">GALERÍA</p><h2 data-reveal>NUESTROS<br />MOMENTOS</h2><div className="masonry">{photos.concat(photos.slice(1, 3)).map((source, index) => <img data-reveal key={index} src={source} alt="Momento de Karina y Marcelo" />)}</div></section>

      <section id="rsvp" className="rsvp"><p data-reveal className="eyebrow">RSVP</p><h2 data-reveal>¿NOS<br /><em>ACOMPAÑÁS?</em></h2><form data-reveal onSubmit={sendRsvp}><input required name="name" placeholder="Nombre y apellido" /><fieldset><legend>¿Vas a asistir?</legend><label><input required type="radio" name="attending" value="yes" /> Sí, obvio</label><label><input required type="radio" name="attending" value="no" /> No voy a poder</label></fieldset><input required min="1" max="20" name="guests" type="number" placeholder="Cantidad de personas" /><input name="dietary" maxLength={500} placeholder="Restricciones alimentarias" /><textarea name="message" maxLength={1000} placeholder="Mensaje para los novios" /><label className="honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label><TurnstileWidget onToken={setRsvpToken} resetKey={rsvpCaptchaReset} /><button disabled={rsvpSubmitting}>{rsvpSubmitting ? "CONFIRMANDO..." : "CONFIRMAR ASISTENCIA →"}</button></form>{rsvpNote && <p className="form-note">{rsvpNote}</p>}</section>

      <section className="forever" style={{ backgroundImage: `url(${photos[0]})` }}><div><p data-reveal>Hay días especiales.</p><p data-reveal>Hay personas especiales.</p><p data-reveal>Y hay momentos</p><p data-reveal>que queremos guardar</p><h2 data-reveal>PARA<br />SIEMPRE.</h2></div></section>
      <footer style={{ backgroundImage: `linear-gradient(0deg,rgba(17,16,15,.82),rgba(17,16,15,.45)),url(${photos[3]})` }}><p data-reveal className="monogram">K &amp; M</p><p data-reveal>21 · 11 · 2026</p><p data-reveal>Nos vemos para celebrar.</p><h2 data-reveal>KARINA<br /><em>&amp;</em><br />MARCELO</h2></footer>
      <MusicPlayer />
    </main>
  );
}
