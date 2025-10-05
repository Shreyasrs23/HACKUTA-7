// src/lib/pdf.ts
// Utilities for generating and downloading PDFs (summary and filled-original)

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { FormAnalysis, UserAnswers, FormSearchResult } from "@/types/formTypes";

export async function downloadSummaryPdf(
  title: string,
  analysis: FormAnalysis,
  answers: UserAnswers
) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let y = height - 50;
  const lineHeight = 14;

  const drawLine = (text: string, fontSize = 10) => {
    if (y < 60) {
      doc.addPage([595.28, 841.89]);
      y = height - 50;
    }
    page.drawText(text, { x: 40, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  };

  drawLine(title || "Application", 14);
  drawLine("");
  for (const section of analysis.sections) {
    drawLine(`== ${section.title} ==`, 12);
    for (const field of section.fields) {
      const label = field.mapping.formField;
      const value = (answers as any)[field.id] ?? "";
      drawLine(`${label}: ${String(value)}`);
    }
    drawLine("");
  }

  const bytes = await doc.save();
  triggerDownload(bytes, `${sanitizeFileName(title || "application")}.pdf`);
}

export async function downloadFilledOriginal(
  form: FormSearchResult,
  analysis: FormAnalysis,
  answers: UserAnswers
) {
  try {
    if (!form.downloadUrl) throw new Error("No source URL");
    const res = await fetch(`/api/proxy-pdf?url=${encodeURIComponent(form.downloadUrl)}`);
    if (!res.ok) throw new Error("Failed to fetch original PDF");
    const array = await res.arrayBuffer();

    const pdfDoc = await PDFDocument.load(array, { updateMetadata: false });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const page = pages[0] || pdfDoc.addPage();
    let { height } = page.getSize();

    // Draw a small banner marking it filled by app
    page.drawText("Filled by CivicScribe", {
      x: 40,
      y: height - 40,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Simple overlay of label: value (without absolute coordinates)
    let y = height - 60;
    const lineHeight = 12;
    for (const section of analysis.sections) {
      page.drawText(section.title, { x: 40, y, size: 11, font, color: rgb(0, 0, 0.5) });
      y -= lineHeight;
      for (const field of section.fields) {
        const label = field.mapping.formField;
        const value = (answers as any)[field.id] ?? "";
        page.drawText(`${label}: ${String(value)}`, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
        if (y < 60) {
          const newPage = pdfDoc.addPage();
          y = newPage.getSize().height - 50;
        }
      }
      y -= 4;
    }

    const outBytes = await pdfDoc.save();
    triggerDownload(outBytes, `${sanitizeFileName(form.title || "filled_form")}_filled.pdf`);
  } catch (err) {
    console.error("Filling original PDF failed, falling back to summary", err);
    await downloadSummaryPdf(form.title, analysis, answers);
  }
}

function triggerDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9_\-]+/gi, "_");
}
