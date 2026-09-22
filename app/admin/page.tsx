import { redirect } from "next/navigation";
import { wedding } from "@/config/wedding";
import { getCurrentAdminSession } from "@/lib/admin-session";
import { findRsvps, findSongRequests, getWeddingSummary } from "@/lib/wedding-data";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatter = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  dateStyle: "short",
  timeStyle: "short",
});

type AdminSearchParams = Promise<{ attending?: string; rsvpSearch?: string; songSearch?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const session = await getCurrentAdminSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const attending = params.attending === "yes" || params.attending === "no" ? params.attending : undefined;
  const rsvpSearch = params.rsvpSearch ?? "";
  const songSearch = params.songSearch ?? "";
  const summary = getWeddingSummary();
  const responses = findRsvps(attending, rsvpSearch);
  const songs = findSongRequests(songSearch);

  return <main className="admin-page">
    <header className="admin-header">
      <div><p className="admin-kicker">{wedding.couple.displayName.toUpperCase()}</p><h1>Panel de administración</h1><p>{wedding.date.display}</p></div>
      <div className="admin-header-actions"><a className="admin-report" href="/api/admin/report.pdf">DESCARGAR REPORTE PDF</a><LogoutButton /></div>
    </header>

    <section className="admin-summary" aria-label="Resumen">
      {[['ASISTEN', summary.yes], ['NO ASISTEN', summary.no], ['PERSONAS', summary.guests], ['TEMAS', summary.songs]].map(([label, value]) => <article key={String(label)}><small>{label}</small><strong>{value}</strong></article>)}
    </section>

    <section className="admin-panel">
      <div className="admin-panel-title"><div><p className="admin-kicker">CONFIRMACIONES</p><h2>Lista de invitados</h2></div><form className="admin-search"><input name="rsvpSearch" defaultValue={rsvpSearch} placeholder="Buscar por nombre" /><input type="hidden" name="attending" value={attending ?? ""} /><button>BUSCAR</button></form></div>
      <nav className="admin-filters"><a className={!attending ? "active" : ""} href="/admin">Todos</a><a className={attending === "yes" ? "active" : ""} href="/admin?attending=yes">Asisten</a><a className={attending === "no" ? "active" : ""} href="/admin?attending=no">No asisten</a></nav>
      <div className="admin-table-wrap"><table><thead><tr><th>Nombre</th><th>Estado</th><th>Personas</th><th>Restricciones</th><th>Mensaje</th><th>Fecha</th></tr></thead><tbody>{responses.length ? responses.map((item) => <tr key={item.id}><td><b>{item.fullName}</b></td><td><span className={`admin-status ${item.attending}`}>{item.attending === "yes" ? "Asiste" : "No asiste"}</span></td><td>{item.guestCount}</td><td>{item.dietary || "-"}</td><td>{item.message || "-"}</td><td>{formatter.format(item.createdAt)}</td></tr>) : <tr><td colSpan={6}>No hay confirmaciones para este filtro.</td></tr>}</tbody></table></div>
    </section>

    <section className="admin-panel">
      <div className="admin-panel-title"><div><p className="admin-kicker">MÚSICA</p><h2>Temas para el DJ</h2></div><form className="admin-search"><input name="songSearch" defaultValue={songSearch} placeholder="Buscar invitado, tema o artista" /><button>BUSCAR</button></form></div>
      <div className="admin-table-wrap"><table><thead><tr><th>Invitado</th><th>Tema</th><th>Artista</th><th>Link</th><th>Fecha</th></tr></thead><tbody>{songs.length ? songs.map((item) => <tr key={item.id}><td><b>{item.guestName}</b></td><td>{item.title}</td><td>{item.artist}</td><td>{item.link ? <a href={item.link} target="_blank" rel="noreferrer">Abrir</a> : "-"}</td><td>{formatter.format(item.createdAt)}</td></tr>) : <tr><td colSpan={5}>Todavía no hay canciones solicitadas.</td></tr>}</tbody></table></div>
    </section>

    <footer className="admin-footer">{wedding.brand.name}</footer>
  </main>;
}
