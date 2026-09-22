import { redirect } from "next/navigation";
import { wedding } from "@/config/wedding";
import { getCurrentAdminSession } from "@/lib/admin-session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getCurrentAdminSession()) redirect("/admin");
  return <main className="admin-login-page">
    <section className="admin-login-card">
      <p className="admin-kicker">{wedding.couple.displayName.toUpperCase()}</p>
      <h1>Panel de administración</h1>
      <p>Ingresá con las credenciales privadas del evento.</p>
      <LoginForm />
      <small>{wedding.brand.name}</small>
    </section>
  </main>;
}
