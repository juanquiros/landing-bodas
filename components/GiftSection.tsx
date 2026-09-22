"use client";

/* Optional client-provided QR images do not have fixed source dimensions. */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { SectionBlend } from "@/components/SectionBlend";
import { wedding } from "@/config/wedding";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return <button type="button" className="copy" onClick={copy} aria-label={`Copiar ${label}`}>{copied ? "✓ COPIADO" : "COPIAR"}</button>;
}

export function GiftSection() {
  const gift = wedding.gift;
  if (!gift.enabled) return null;
  const hasDetails = Boolean(gift.alias || gift.cbu);

  return <section id="regalo" className="gift">
    <SectionBlend tone="softFade" />
    <div data-reveal>
      <p className="eyebrow">UN GESTO ESPECIAL</p>
      <h2>UN REGALO<br /><em>PARA NOSOTROS</em></h2>
      <p className="gift-lead">“Tu presencia es nuestro mejor regalo.”</p>
      <p>Pero si además querés acompañarnos con algo más, podés hacerlo por transferencia.</p>
      {hasDetails ? <div className="gift-details">
        {gift.alias && <article><small>ALIAS</small><strong>{gift.alias}</strong><CopyButton value={gift.alias} label="alias" /></article>}
        {gift.accountHolder && <p><span>Titular</span>{gift.accountHolder}</p>}
        {gift.bankName && <p><span>Banco</span>{gift.bankName}</p>}
        {gift.accountType && <p><span>Tipo de cuenta</span>{gift.accountType}</p>}
        {gift.cbu && <article><small>CBU</small><strong>{gift.cbu}</strong><CopyButton value={gift.cbu} label="CBU" /></article>}
        {gift.qrImage && <img src={gift.qrImage} alt="Código QR para transferencia" />}
      </div> : <p className="gift-pending">Muy pronto vamos a compartir nuestros datos.</p>}
      <p className="gift-thanks">Gracias por ser parte de nuestra historia.</p>
    </div>
  </section>;
}
