"use client";

import { useState } from "react";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  return <button className="admin-logout" disabled={pending} onClick={async () => {
    setPending(true);
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }}>{pending ? "CERRANDO..." : "CERRAR SESIÓN"}</button>;
}
