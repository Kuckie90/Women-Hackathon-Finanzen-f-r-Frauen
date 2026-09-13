import { ParsedPosition, UploadedReport } from "../types";
import { extractTextFromPdf } from "./pdfExtractor";

/**
 * Robustes Parsen von Währungsbeträgen.
 * Unterstützt deutsches Format (z. B. "1.250,50" oder "1250,50")
 * und internationales Format (z. B. "1,250.50" oder "1250.50").
 */
export function parseFinancialNumber(rawStr: string): number | null {
  if (!rawStr) return null;
  // Entferne Währungssymbole, Leerzeichen
  const cleaned = rawStr.trim().replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");

  if (hasDot && hasComma) {
    const lastDotIndex = cleaned.lastIndexOf(".");
    const lastCommaIndex = cleaned.lastIndexOf(",");

    if (lastCommaIndex > lastDotIndex) {
      // Deutsches Format: 1.250,50 oder 1.250.000,50
      // Punkt ist Tausendertrennzeichen, Komma ist Dezimaltrenner
      const normalized = cleaned.replace(/\./g, "").replace(",", ".");
      const num = parseFloat(normalized);
      return isNaN(num) ? null : num;
    } else {
      // Internationales Format: 1,250.50 oder 1,250,000.50
      // Komma ist Tausendertrennzeichen, Punkt ist Dezimaltrenner
      const normalized = cleaned.replace(/,/g, "");
      const num = parseFloat(normalized);
      return isNaN(num) ? null : num;
    }
  }

  if (hasComma && !hasDot) {
    // Nur Kommas vorhanden:
    const commaParts = cleaned.split(",");
    if (commaParts.length === 2) {
      // Dezimalkomma: z. B. "1250,50" oder "45,00"
      const num = parseFloat(cleaned.replace(",", "."));
      return isNaN(num) ? null : num;
    }
    // Mehrere Kommas (z. B. "1,250,000"): Tausendertrennzeichen
    const num = parseFloat(cleaned.replace(/,/g, ""));
    return isNaN(num) ? null : num;
  }

  if (hasDot && !hasComma) {
    // Nur Punkte vorhanden:
    const dotParts = cleaned.split(".");
    if (dotParts.length === 2) {
      const decimals = dotParts[1];
      // 2 Nachkommastellen: z. B. "1250.50" -> internationales Dezimalformat
      if (decimals.length === 2) {
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
      }
      // Genau 3 Ziffern nach Punkt: z. B. "1.250" -> deutsches Tausendertrennzeichen
      if (decimals.length === 3 && dotParts[0].length >= 1 && dotParts[0].length <= 3) {
        const num = parseFloat(cleaned.replace(/\./g, ""));
        return isNaN(num) ? null : num;
      }
      // Andere Längen: normaler Float
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    } else if (dotParts.length > 2) {
      // Mehrere Punkte: z. B. "1.250.000" -> Tausendertrennzeichen
      const num = parseFloat(cleaned.replace(/\./g, ""));
      return isNaN(num) ? null : num;
    }
  }

  // Reine Ganzzahl
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * 100 % lokales Parsing von Finanzdaten (CSV, TXT, JSON).
 * Keine Serverübertragung, keine Speicherung, absolut privat im Browser.
 */
export async function parseStatementFile(file: File): Promise<UploadedReport> {
  const fileNameLower = file.name.toLowerCase();
  let text = "";

  // 1. PDF clientseitig lokal mit PDF.js auslesen
  if (fileNameLower.endsWith(".pdf") || file.type === "application/pdf") {
    try {
      text = await extractTextFromPdf(file);
      if (!text || text.trim().length === 0) {
        return {
          fileName: file.name,
          fileSize: file.size,
          parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
          positions: [],
          totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
          error: "Aus dem PDF konnte kein maschinenlesbarer Text extrahiert werden (z. B. bei reinen Bild-Scans). Du kannst die Beträge direkt in der Prüfstation oder manuell eintragen.",
        };
      }
    } catch (pdfErr) {
      console.error("PDF Parsing Fehler:", pdfErr);
      return {
        fileName: file.name,
        fileSize: file.size,
        parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
        positions: [],
        totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
        error: "Die PDF-Datei konnte im Browser nicht entschlüsselt werden. Bitte nutze einen CSV-Export oder trage die Beträge manuell ein.",
      };
    }
  } else {
    text = await file.text();
  }

  // 2. Leere Datei prüfen
  if (!text || text.trim().length === 0) {
    return {
      fileName: file.name,
      fileSize: file.size,
      parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      positions: [],
      totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
      error: "Die Datei ist leer oder enthält keinen Text. Bitte wähle eine Datei mit Finanzdaten oder trage deine Werte manuell ein.",
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

  // 3. JSON-Format versuchen
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
      // Bei ungültigem JSON mit Text-Parsing fortfahren
    }
  }

  // 4. CSV- oder TXT-Format zeilenweise analysieren
  if (positions.length === 0) {
    const lines = text.split(/\r?\n/);

    lines.forEach((originalLine, idx) => {
      const trimmed = originalLine.trim();
      // Leere Zeilen, Kommentare oder reine Trennlinien überspringen
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("---") || trimmed.startsWith("===")) {
        return;
      }

      // Zeile vorfiltern: Daten, Stückzahlen, Transaktions-IDs neutralisieren, damit sie nicht als Euro-Betrag fehlinterpretiert werden
      let sanitizedLine = originalLine;

      // a) Datumswerte entfernen (z. B. 15.03.2024, 2024-03-15, 01.01.26)
      sanitizedLine = sanitizedLine.replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, " ");
      sanitizedLine = sanitizedLine.replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ");

      // b) Uhrzeiten entfernen (z. B. 14:30, 09:15:00)
      sanitizedLine = sanitizedLine.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, " ");

      // c) Stückzahlen / Anteile entfernen (z. B. "12 Stk", "5,50 Stück", "100 Anteile", "15 shares")
      sanitizedLine = sanitizedLine.replace(/\b\d+(?:[.,]\d+)?\s*(?:stk|stück|stueck|anteile|shares|qty|st\.)\b/gi, " ");

      // d) Wertpapierkennnummern (ISINs z. B. DE0001234567 oder WKNs) neutralisieren
      sanitizedLine = sanitizedLine.replace(/\b[A-Z]{2}[A-Z0-9]{10}\b/g, " ");
      sanitizedLine = sanitizedLine.replace(/\bWKN\s*:\s*[A-Z0-9]{6}\b/gi, " ");

      // e) Standalone 4-stellige Jahreszahlen (1900–2099) OHNE Währungssymbol und OHNE Dezimaltrenner entfernen
      sanitizedLine = sanitizedLine.replace(/\b(19\d\d|20\d\d)\b(?!\s*(?:€|eur|euro))/gi, " ");

      // Jetzt nach eindeutigen Währungsbeträgen suchen:
      // - Zahlen mit 2 Dezimalstellen (deutsch 1.250,50 oder internat. 1250.50 / 1,250.50)
      // - Oder Zahlen mit explizitem Währungszeichen (€ / EUR)
      const euroRegex = /(?:€|EUR)?\s*([+-]?(?:\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{2}|\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2}))\s*(?:€|EUR)?|([+-]?\d+(?:[.,]\d+)?)\s*(?:€|EUR)/gi;
      const matches = Array.from(sanitizedLine.matchAll(euroRegex));

      if (matches.length > 0) {
        // Nimm den wahrscheinlichsten Saldo-/Wertbetrag (meist der letzte oder der mit expliziter Währung)
        const match = matches[matches.length - 1];
        const rawValue = match[1] || match[2];
        const amount = parseFinancialNumber(rawValue);

        // Konservative Plausibilitätsprüfung: Betrag zwischen 1 € und 10 Mio. €
        if (amount !== null && !isNaN(amount) && amount >= 1 && amount < 10000000) {
          // Extrahiere die Zeilenbezeichnung ohne den Betrag
          let name = sanitizedLine
            .replace(match[0], "")
            .replace(/[;"',|]/g, " ")
            .trim();

          if (!name || name.length < 3) {
            name = `Position ${idx + 1}`;
          }

          // Kürzen und aufräumen
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

  // 5. WICHTIG: Keine erfundenen Fallback-Positionen mehr!
  // Wenn keine Positionen erkannt werden, leere Liste und Fehlermeldung zurückgeben.
  if (positions.length === 0) {
    return {
      fileName: file.name,
      fileSize: file.size,
      parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      detectedBroker,
      positions: [],
      totals: { sicherheit: 0, wachstum: 0, spielgeld: 0, gesamt: 0 },
      error: "Aus dieser Datei konnten keine eindeutigen Beträge oder Depotwerte erkannt werden. Bitte trage deine Werte einfach im Tab 'Töpfe direkt' oder 'Anlageformen' manuell ein.",
    };
  }

  // Summen berechnen
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
 * basierend auf dem 2026-Bucket-Assignment-Regelwerk.
 */
function classifyAsset(name: string, context: string): "sicherheit" | "wachstum" | "spielgeld" {
  const text = (name + " " + context).toLowerCase();

  // 1. Spaßgeld / Träume Keywords (Krypto, Hebelprodukte, P2P, Crowdinvesting)
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

  // 2. Sicherheit Keywords (Einlagen, Geldmarkt, kurzlaufende Staatsanleihen IG <= 5 Jahre, Renten/Versicherungen)
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
    // High-Yield Anleihen oder Schwellenländeranleihen gehören trotz "Anleihe" ins Wachstum
    if (text.includes("high yield") || text.includes("emerging") || text.includes("schwellenland")) {
      return "wachstum";
    }
    return "sicherheit";
  }

  // 3. Wachstum Keywords (Aktien, Welt-ETFs, Themen-ETFs, Gold, offene Immobilienfonds, Zertifikate)
  return "wachstum";
}
