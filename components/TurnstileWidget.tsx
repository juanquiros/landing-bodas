"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void; theme: string; size: string }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ onToken, resetKey }: { onToken: (token: string) => void; resetKey: number }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const callback = useRef(onToken);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);

  const render = useCallback(() => {
    if (!siteKey || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      callback: (token) => callback.current(token),
      "expired-callback": () => callback.current(""),
      "error-callback": () => callback.current(""),
      theme: "auto",
      size: "flexible",
    });
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) {
      callback.current("");
      return;
    }
    if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
    widgetId.current = undefined;
    callback.current("");
    let retry: number | undefined;
    let attempts = 0;
    const renderWhenReady = () => {
      render();
      attempts += 1;
      if (!widgetId.current && attempts < 300) retry = window.setTimeout(renderWhenReady, 100);
    };
    renderWhenReady();
    return () => {
      if (retry) window.clearTimeout(retry);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [render, resetKey, siteKey]);

  if (!siteKey) return process.env.NODE_ENV === "production"
    ? <p className="captcha-warning">La verificación de seguridad no está configurada.</p>
    : <p className="captcha-dev">Turnstile omitido en desarrollo.</p>;

  return <div className="turnstile-wrap"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" /><div ref={container} /></div>;
}
