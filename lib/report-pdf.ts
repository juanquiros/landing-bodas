import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";
import type { RsvpRow, SongRequestRow } from "@/db/schema";

export type WeddingReportData = {
  generatedAt: Date;
  summary: { yes: number; no: number; guests: number; songs: number };
  rsvps: RsvpRow[];
  songs: SongRequestRow[];
};

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 38;
const ESPRESSO = rgb(0.13, 0.11, 0.09);
const CHAMPAGNE = rgb(0.72, 0.58, 0.36);
const IVORY = rgb(0.97, 0.95, 0.91);
const MUTED = rgb(0.43, 0.40, 0.36);
const LINE = rgb(0.83, 0.80, 0.75);

function safeText(value: unknown) {
  return String(value ?? "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/→/g, "->")
    .replace(/\u00a0/g, " ")
    // The built-in Helvetica font uses WinAnsi. Preserve Spanish characters
    // while replacing emoji/control glyphs that would otherwise abort a PDF.
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u20AC]/g, "?");
}

function wrapText(value: unknown, font: PDFFont, size: number, width: number) {
  const words = safeText(value).split(/\s+/).filter(Boolean).flatMap((word) => {
    if (font.widthOfTextAtSize(word, size) <= width) return [word];
    const pieces: string[] = [];
    let piece = "";
    for (const character of word) {
      const candidate = piece + character;
      if (piece && font.widthOfTextAtSize(candidate, size) > width) {
        pieces.push(piece);
        piece = character;
      } else {
        piece = candidate;
      }
    }
    if (piece) pieces.push(piece);
    return pieces;
  });
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["-"];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export async function generateWeddingReport(data: WeddingReportData) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    return page;
  };

  const drawTitle = (title: string) => {
    if (y < 90) addPage();
    page.drawText(title, { x: MARGIN, y, size: 15, font: bold, color: ESPRESSO });
    y -= 9;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: CHAMPAGNE });
    y -= 20;
  };

  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 114, width: PAGE_WIDTH, height: 114, color: ESPRESSO });
  page.drawText("KARINA & MARCELO", { x: MARGIN, y: PAGE_HEIGHT - 55, size: 27, font: bold, color: IVORY });
  page.drawText("21 - 11 - 2026", { x: MARGIN, y: PAGE_HEIGHT - 80, size: 11, font: regular, color: CHAMPAGNE });
  page.drawText("REPORTE DE INVITACION", { x: PAGE_WIDTH - 236, y: PAGE_HEIGHT - 55, size: 13, font: bold, color: IVORY });
  page.drawText(`Generado: ${formatDate(data.generatedAt)}`, { x: PAGE_WIDTH - 236, y: PAGE_HEIGHT - 78, size: 8, font: regular, color: IVORY });
  y = PAGE_HEIGHT - 148;

  const metrics = [
    ["ASISTEN", data.summary.yes],
    ["NO ASISTEN", data.summary.no],
    ["PERSONAS", data.summary.guests],
    ["TEMAS", data.summary.songs],
  ] as const;
  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - 30) / 4;
  metrics.forEach(([label, value], index) => {
    const x = MARGIN + index * (cardWidth + 10);
    page.drawRectangle({ x, y: y - 58, width: cardWidth, height: 58, color: IVORY, borderColor: LINE, borderWidth: .7 });
    page.drawText(label, { x: x + 12, y: y - 20, size: 8, font: bold, color: MUTED });
    page.drawText(String(value), { x: x + 12, y: y - 47, size: 22, font: bold, color: ESPRESSO });
  });
  y -= 88;

  const drawTable = (title: string, headers: string[], widths: number[], rows: string[][]) => {
    drawTitle(title);
    const fontSize = 7.2;
    const lineHeight = 9;

    const drawHeader = () => {
      let x = MARGIN;
      page.drawRectangle({ x: MARGIN, y: y - 19, width: widths.reduce((a, b) => a + b, 0), height: 19, color: ESPRESSO });
      headers.forEach((header, index) => {
        page.drawText(header, { x: x + 4, y: y - 13, size: 7, font: bold, color: IVORY });
        x += widths[index];
      });
      y -= 19;
    };

    drawHeader();
    if (!rows.length) rows = [["Sin registros", ...headers.slice(1).map(() => "-")]];

    for (const row of rows) {
      const wrapped = row.map((cell, index) => wrapText(cell, regular, fontSize, widths[index] - 8));
      const rowHeight = Math.max(22, Math.max(...wrapped.map((lines) => lines.length)) * lineHeight + 8);
      if (y - rowHeight < MARGIN + 20) {
        addPage();
        page.drawText(title, { x: MARGIN, y, size: 12, font: bold, color: ESPRESSO });
        y -= 20;
        drawHeader();
      }
      let x = MARGIN;
      page.drawRectangle({ x: MARGIN, y: y - rowHeight, width: widths.reduce((a, b) => a + b, 0), height: rowHeight, borderColor: LINE, borderWidth: .45 });
      wrapped.forEach((lines, column) => {
        lines.forEach((line, lineIndex) => page.drawText(line, { x: x + 4, y: y - 12 - lineIndex * lineHeight, size: fontSize, font: regular, color: ESPRESSO }));
        x += widths[column];
      });
      y -= rowHeight;
    }
    y -= 25;
  };

  drawTable("CONFIRMACIONES", ["Nombre", "Asiste", "Personas", "Restricciones", "Mensaje", "Fecha"], [130, 48, 50, 145, 210, 95], data.rsvps.map((item) => [
    item.fullName,
    item.attending === "yes" ? "Si" : "No",
    String(item.guestCount),
    item.dietary || "-",
    item.message || "-",
    formatDate(item.createdAt),
  ]));

  drawTable("TEMAS PARA EL DJ", ["Invitado", "Tema", "Artista", "Link"], [170, 190, 160, 158], data.songs.map((item) => [
    item.guestName,
    item.title,
    item.artist,
    item.link || "-",
  ]));

  const pages = document.getPages();
  pages.forEach((currentPage, index) => {
    currentPage.drawText(`Karina & Marcelo - Pagina ${index + 1} de ${pages.length}`, {
      x: MARGIN,
      y: 18,
      size: 7,
      font: regular,
      color: MUTED,
    });
  });

  document.setTitle("Karina & Marcelo - Reporte de invitacion");
  document.setAuthor("Impulso Digital Misiones");
  return document.save();
}
