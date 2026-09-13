import { ParsedPosition, UploadedReport } from "../types";
import { extractTextFromPdf, renderPdfFirstPageThumbnail } from "./pdfExtractor";

/**
 * Robustes Parsen von Währungsbeträgen.
 * Unterstützt deutsches Format (z. B. "1.250,50" oder "1250,50")
 * und internationales Format (z. B. "1,250.50" oder "1250.50").
 */
export function parseFinancialNumber(rawStr: string): number | null {
  if (!rawStr) return null;
  const cleaned = rawStr.trim().replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");

  if (hasDot && hasComma) {
    const lastDotIndex = cleaned.lastIndexOf(".");
    const lastCommaIndex = cleaned.lastIndexOf(",");

    if (lastCommaIndex > lastDotIndex) {
      // Deutsches Format: 1.250,50
      const normalized = cleaned.replace(/\./g, "").replace(",", ".");
      const num = parseFloat(normalized);
      return isNaN(num) ? null : num;
    } else {
      // Internationales Format: 1,250.50
      const normalized = cleaned.replace(/,/g, "");
      const num = parseFloat(normalized);
      return isNaN(num) ? null : num;
    }
  }

  if (hasComma && !hasDot) {
    const commaParts = cleaned.split(",");
    if (commaParts.length === 2) {
      const num = parseFloat(cleaned.replace(",", "."));
      return isNaN(num) ? null : num;
    }
    const num = parseFloat(cleaned.replace(/,/g, ""));
    return isNaN(num) ? null : num;
  }

  if (hasDot && !hasComma) {
    const dotParts = cleaned.split(".");
    if (dotParts.length === 2) {
      const decimals = dotParts[1];
      if (decimals.length === 2) {
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
      }
      if (decimals.length === 3 && dotParts[0].length >= 1 && dotParts[0].length <= 3) {
        const num = parseFloat(cleaned.replace(/\./g, ""));
        return isNaN(num) ? null : num;
      }
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    } else if (dotParts.length > 2) {
      const num = parseFloat(cleaned.replace(/\./g, ""));
      return isNaN(num) ? null : num;
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Konvertiert eine Datei in einen base64 Data-URL String
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Screenshot direkt über die Browser DisplayMedia-API aufnehmen
 */
export async function captureDisplayMediaScreenshot(): Promise<File | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new Error("Screen-Capture wird von deinem Browser nicht unterstützt.");
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });

  const track = stream.getVideoTracks()[0];
  if (!track) {
    stream.getTracks().forEach((t) => t.stop());
    return null;
  }

  const video = document.createElement("video");
  video.srcObject = stream;
  video.playsInline = true;
  await video.play();

  // Kurz warten, bis der Frame gezeichnet werden kann
  await new Promise((r) => setTimeout(r, 400));

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  // Stream stoppen
  stream.getTracks().forEach((t) => t.stop());

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `depot-screenshot-${Date.now()}.png`, {
          type: "image/png",
        });
        resolve(file);
      } else {
        resolve(null);
      }
    }, "image/png");
  });
}

/**
 * Screenshot oder Bild direkt aus der Zwischenablage lesen
 */
export async function getImageFromClipboard(): Promise<File | null> {
  if (!navigator.clipboard || !navigator.clipboard.read) {
    return null;
  }
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          const blob = await item.getType(type);
          return new File([blob], `zwischenablage-screenshot-${Date.now()}.png`, { type });
        }
      }
    }
  } catch (err) {
    console.warn("Zwischenablage konnte nicht gelesen werden:", err);
  }
  return null;
}

/**
 * Hauptfunktion zum Auslesen von Dokumenten:
 * Unterstützt:
 * 1. Screenshots & Bilder (.png, .jpg, .jpeg, .webp)
 * 2. PDF-Dateien (.pdf) – sowohl digitale als auch gescannte
 * 3. CSV, TXT und JSON
 *
 * Versucht zuerst die KI-gestützte Vision-Erkennung (präzise Erkennung aller Broker-Layouts)
 * und fällt bei Bedarf nahtlos auf die lokale Texterkennung zurück.
 */
export async function parseStatementFile(file: File): Promise<UploadedReport> {
  const fileNameLower = file.name.toLowerCase();
  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(fileNameLower);
  const isPdf = fileNameLower.endsWith(".pdf") || file.type === "application/pdf";

  let previewImageUrl: string | undefined = undefined;

  // 1. Vorschau-Thumbnail generieren
  if (isImage) {
    try {
      previewImageUrl = await fileToBase64(file);
    } catch {
      // Ignorieren falls Lesefehler
    }
  } else if (isPdf) {
    try {
      const thumb = await renderPdfFirstPageThumbnail(file);
      if (thumb) previewImageUrl = thumb;
    } catch {
      // Ignorieren
    }
  }

  // 2. Erster Versuch: Server-seitige KI-Vision-Erkennung (Gemini 3.8 Flash)
  try {
    const base64Data = await fileToBase64(file);
    const resp = await fetch("/api/extract-statement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileBase64: base64Data,
        mimeType: file.type || (isPdf ? "application/pdf" : isImage ? "image/png" : "text/plain"),
        fileName: file.name,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.success && data.report && Array.isArray(data.report.positions) && data.report.positions.length > 0) {
        return {
          ...data.report,
          previewImageUrl: previewImageUrl || data.report.previewImageUrl,
          extractionMethod: "ai",
        };
      }
    }
  } catch (apiErr) {
    console.warn("AI extraction call not reachable, using local fallback:", apiErr);
  }

  // 3. Fallback: Lokale Textextraktion (PDF.js oder Textleser)
  let text = "";

  if (isPdf) {
    try {
      text = await extractTextFromPdf(file);
    } catch (pdfErr) {
      console.error("PDF Parsing Fehler:", pdfErr);
      return {
        fileName: file.name,
        fileSize: file.size,
        parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
        previewImageUrl,
        positions: [],
        totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
        error:
          "Die PDF-Datei konnte nicht entschlüsselt werden. Du kannst deine Werte manuell eintragen oder einen Screenshot der Übersicht hochladen.",
      };
    }
  } else if (!isImage) {
    try {
      text = await file.text();
    } catch {
      text = "";
    }
  }

  // Falls es ein Screenshot war und die KI-Erkennung nicht greifen konnte
  if (isImage && (!text || text.trim().length === 0)) {
    return {
      fileName: file.name,
      fileSize: file.size,
      parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      previewImageUrl,
      positions: [],
      totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
      error:
        "Der Screenshot wurde geladen, aber es konnten keine Beträge automatisch erkannt werden. Bitte stelle sicher, dass die Beträge und Bezeichnungen gut lesbar sind, oder trage deine Werte direkt in den Feldern ein.",
    };
  }

  // Leere Datei prüfen
  if (!text || text.trim().length === 0) {
    return {
      fileName: file.name,
      fileSize: file.size,
      parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      previewImageUrl,
      positions: [],
      totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
      error:
        "Aus dieser Datei konnte kein Text ausgelesen werden. Bitte wähle eine lesbare PDF-, CSV- oder Bild-Datei oder trage deine Werte manuell ein.",
    };
  }

  const positions: ParsedPosition[] = [];
  let detectedBroker = "Allgemeines Format";

  if (text.includes("Trade Republic") || text.includes("Lang & Schwarz")) {
    detectedBroker = "Trade Republic";
  } else if (text.includes("Scalable Capital") || text.includes("Baader Bank")) {
    detectedBroker = "Scalable Capital";
  } else if (text.includes("ING-DiBa") || text.includes("Direkt-Depot")) {
    detectedBroker = "ING Depot";
  } else if (text.includes("comdirect") || text.includes("Commerzbank")) {
    detectedBroker = "Comdirect";
  } else if (text.includes("DKB")) {
    detectedBroker = "DKB Broker";
  } else if (text.includes("Sparkasse") || text.includes("Deka")) {
    detectedBroker = "Sparkasse / Deka";
  }

  // JSON-Format versuchen
  if (fileNameLower.endsWith(".json")) {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach((item, idx) => {
          const name = item.name || item.titel || item.bezeichnung || `Position ${idx + 1}`;
          const rawAmount = item.amount ?? item.wert ?? item.betrag ?? item.saldo ?? 0;
          const parsedAmount = typeof rawAmount === "number" ? rawAmount : parseFinancialNumber(String(rawAmount));
          const category = classifyAsset(name, item.typ || item.kategorie || "");
          if (parsedAmount && parsedAmount > 0) {
            positions.push({
              id: `pos-${idx}`,
              name,
              amount: parsedAmount,
              category,
              notes: item.isin || item.typ,
            });
          }
        });
      }
    } catch {
      // Weiter mit Text-Parsing
    }
  }

  // Zeilenweises Text-Parsing
  if (positions.length === 0) {
    const lines = text.split(/\r?\n/);

    lines.forEach((originalLine, idx) => {
      const trimmed = originalLine.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("---") || trimmed.startsWith("===")) {
        return;
      }

      let sanitizedLine = originalLine;
      sanitizedLine = sanitizedLine.replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, " ");
      sanitizedLine = sanitizedLine.replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ");
      sanitizedLine = sanitizedLine.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, " ");
      sanitizedLine = sanitizedLine.replace(/\b\d+(?:[.,]\d+)?\s*(?:stk|stück|stueck|anteile|shares|qty|st\.)\b/gi, " ");
      sanitizedLine = sanitizedLine.replace(/\b[A-Z]{2}[A-Z0-9]{10}\b/g, " ");
      sanitizedLine = sanitizedLine.replace(/\bWKN\s*:\s*[A-Z0-9]{6}\b/gi, " ");
      sanitizedLine = sanitizedLine.replace(/\b(19\d\d|20\d\d)\b(?!\s*(?:€|eur|euro))/gi, " ");

      const euroRegex =
        /(?:€|EUR)?\s*([+-]?(?:\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{2}|\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2}))\s*(?:€|EUR)?|([+-]?\d+(?:[.,]\d+)?)\s*(?:€|EUR)/gi;
      const matches = Array.from(sanitizedLine.matchAll(euroRegex));

      if (matches.length > 0) {
        const match = matches[matches.length - 1];
        const rawValue = match[1] || match[2];
        const amount = parseFinancialNumber(rawValue);

        if (amount !== null && !isNaN(amount) && amount >= 1 && amount < 10000000) {
          let name = sanitizedLine
            .replace(match[0], "")
            .replace(/[;"',|]/g, " ")
            .trim();

          if (!name || name.length < 3) {
            name = `Position ${idx + 1}`;
          }

          name = name.slice(0, 50).trim();
          const category = classifyAsset(name, sanitizedLine);

          positions.push({
            id: `pos-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            name,
            amount,
            category,
          });
        }
      }
    });
  }

  if (positions.length === 0) {
    return {
      fileName: file.name,
      fileSize: file.size,
      parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      detectedBroker,
      previewImageUrl,
      positions: [],
      totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
      error:
        "Aus dieser Datei konnten keine eindeutigen Euro-Beträge erkannt werden. Bitte trage deine Werte einfach in den Feldern unter 'Anlagen eintragen' ein.",
    };
  }

  let sicherheit = 0;
  let wachstum = 0;
  let spielgeld = 0;

  positions.forEach((pos) => {
    if (pos.category === "sicherheit") sicherheit += pos.amount;
    else if (pos.category === "wachstum") wachstum += pos.amount;
    else if (pos.category === "spielgeld") spielgeld += pos.amount;
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    detectedBroker,
    previewImageUrl,
    extractionMethod: "local",
    positions,
    totals: {
      sicherheit,
      wachstum,
      spielgeld,
      gesamt: sicherheit + wachstum + spielgeld,
    },
  };
}

/**
 * Heuristische Zuordnung einer Wertpapier- oder Kontoposition zu einem der Töpfe
 */
function classifyAsset(name: string, context: string): "sicherheit" | "wachstum" | "spielgeld" {
  const text = (name + " " + context).toLowerCase();

  // 1. Spaßgeld / Träume
  if (
    text.includes("crypto") ||
    text.includes("krypto") ||
    text.includes("bitcoin") ||
    text.includes("btc") ||
    text.includes("ethereum") ||
    text.includes("eth") ||
    text.includes("solana") ||
    text.includes("derivat") ||
    text.includes("knockout") ||
    text.includes("knock-out") ||
    text.includes("optionsschein") ||
    text.includes("warrant") ||
    text.includes("hebel") ||
    text.includes("leveraged") ||
    text.includes("gamestop") ||
    text.includes("meme") ||
    text.includes("doge") ||
    text.includes("p2p") ||
    text.includes("peer-to-peer") ||
    text.includes("crowdinvesting") ||
    text.includes("geschlossener fonds")
  ) {
    return "spielgeld";
  }

  // 2. Sicherheit
  if (
    text.includes("tagesgeld") ||
    text.includes("festgeld") ||
    text.includes("giro") ||
    text.includes("verrechnung") ||
    text.includes("cash") ||
    text.includes("geldmarkt") ||
    text.includes("money market") ||
    text.includes("overnight") ||
    text.includes("eonia") ||
    text.includes("estr") ||
    text.includes("staatsanleihe") ||
    text.includes("bundesanleihe") ||
    text.includes("bundesschatz") ||
    text.includes("sparplan konto") ||
    text.includes("guthaben") ||
    text.includes("instandhaltung") ||
    text.includes("bauspar") ||
    text.includes("deckungsstock") ||
    text.includes("lebensversicherung") ||
    text.includes("rentenversicherung") ||
    text.includes("riester") ||
    text.includes("ruerup") ||
    text.includes("rürup")
  ) {
    if (text.includes("high yield") || text.includes("emerging") || text.includes("schwellenland")) {
      return "wachstum";
    }
    return "sicherheit";
  }

  // 3. Wachstum
  return "wachstum";
}
