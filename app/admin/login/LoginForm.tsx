"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const result = await response.json() as { ok: boolean; message?: string };
      if (!response.ok) throw new Error(result.message || "No pudimos iniciar sesión.");
      window.location.assign("/admin");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos iniciar sesión.");
      setSubmitting(false);
    }
  }

  return <form className="admin-login-form" onSubmit={submit}>
    <label>Usuario<input name="username" autoComplete="username" required /></label>
    <label>Contraseña<input name="password" type="password" autoComplete="current-password" required /></label>
    <button disabled={submitting}>{submitting ? "INGRESANDO..." : "INGRESAR"}</button>
    {message && <p role="alert">{message}</p>}
  </form>;
}
