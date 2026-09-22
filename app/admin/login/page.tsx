import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/lib/admin-session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getCurrentAdminSession()) redirect("/admin");
  return <main className="admin-login-page">
    <section className="admin-login-card">
      <p className="admin-kicker">KARINA &amp; MARCELO</p>
      <h1>Panel de administración</h1>
      <p>Ingresá con las credenciales privadas del evento.</p>
      <LoginForm />
      <small>Impulso Digital Misiones</small>
    </section>
  </main>;
}
