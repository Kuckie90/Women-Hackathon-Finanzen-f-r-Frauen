import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Body parsing with support for large screenshots and PDFs (up to 25MB)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// API endpoint for extracting financial positions from screenshots, PDFs, or text
app.post("/api/extract-statement", async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName, textContent } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback hint for client to run purely local extraction
      return res.status(200).json({
        success: false,
        fallbackToLocal: true,
        message: "Server-side AI key not configured. Falling back to browser-local parsing.",
      });
    }

    const parts: any[] = [];

    const promptText = `Du bist ein präziser, hochqualifizierter Finanzdaten-Analysator für private Depotauszüge, Depot-Screenshots von Banking-Apps (z. B. Trade Republic, Scalable Capital, ING, Comdirect, DKB, Smartbroker, Consorsbank, Bitpanda, Coinbase, Sparkasse) und Vermögensaufstellungen.

AUFGABE:
Analysiere die übermittelten Daten (Screenshot, PDF oder Text) und extrahiere alle sichtbaren Vermögenspositionen mit ihrem aktuellen Kurswert bzw. Gesamtwert in Euro.

REGELN FÜR DIE KATEGORISIERUNG (Die 3 Töpfe von "Angelegt"):
1. "sicherheit":
   - Girokonto, Tagesgeld, Verrechnungskonto, Cash-Guthaben
   - Festgeld, Bausparguthaben
   - Geldmarktfonds (z. B. DBX0AN, Lyxor Smart Overnight)
   - Kurzläufer-Staatsanleihen / Bundesanleihen
   - Klassische Rentenversicherungen, Bausparer, Riester, Rürup

2. "wachstum":
   - Welt-Aktien-ETFs (MSCI World, FTSE All-World, ACWI, S&P 500, Stoxx Europe 600, Emerging Markets)
   - Einzelaktien (z. B. Apple, Microsoft, Allianz, SAP, ASML, Nvidia)
   - Offene Immobilienfonds (z. B. HausInvest) und REITs
   - Physisches Gold, Xetra-Gold, Euwax Gold, Edelmetalle

3. "spielgeld":
   - Kryptowährungen (Bitcoin, Ethereum, Solana, Altcoins, Krypto-ETPs)
   - Hebelprodukte, Derivate, Knock-Outs, Optionsscheine, Faktor-Zertifikate
   - P2P-Kredite, Crowdinvesting, Meme-Stocks

4. "immobilien":
   - Eigene Immobilie (getilgter Wert / Marktwert)

WICHTIGE ANWEISUNGEN:
- Erkenne den Namen des Brokers/der Bank (z. B. Trade Republic, Scalable, ING, Comdirect), falls ersichtlich.
- Beträge müssen als reine Dezimalzahl in Euro formatiert sein (z. B. 1250.50, keine Währungszeichen).
- Falls nur Stückzahlen und Kurse zu sehen sind, berechne den Gesamtwert (Stückzahl * Kurs).
- Filtere reine Gewinne/Verluste (z. B. "+15,20 %" oder "+230 €") heraus, wenn der Gesamtwert der Position erkennbar ist. Nimm stets den aktuellen Gesamtwert/Kurswert der Position.
- Vermeide doppeltes Erfassen eines übergeordneten "Gesamtdepotwerts", wenn die einzelnen Positionen schon aufgelistet sind.

GIB DAS ERGEBNIS ALS VALIDES JSON ZURÜCK:
{
  "detectedBroker": "Trade Republic",
  "positions": [
    {
      "name": "iShares Core MSCI World UCITS ETF",
      "amount": 4250.80,
      "category": "wachstum",
      "notes": "ISIN: IE00B4L5Y983"
    },
    {
      "name": "Cash / Verrechnungskonto",
      "amount": 520.00,
      "category": "sicherheit",
      "notes": "Verzinstes Verrechnungskonto"
    }
  ]
}`;

    parts.push({ text: promptText });

    if (fileBase64) {
      // Remove data URL scheme if present
      const cleanBase64 = fileBase64.includes(";base64,")
        ? fileBase64.split(";base64,")[1]
        : fileBase64;

      const effectiveMime = mimeType || "image/png";

      parts.push({
        inlineData: {
          mimeType: effectiveMime,
          data: cleanBase64,
        },
      });
    } else if (textContent) {
      parts.push({
        text: `Hier ist der Textinhalt des Dokuments zur Analyse:\n\n${textContent.slice(0, 50000)}`,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Kein Dokument, Screenshot oder Text übermittelt.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsedJson: any = null;

    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      // Try extracting json block if model added formatting
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0]);
      }
    }

    if (!parsedJson || !Array.isArray(parsedJson.positions)) {
      return res.status(200).json({
        success: false,
        fallbackToLocal: true,
        message: "Konnte keine strukturierten Positionen aus dem Dokument extrahieren.",
      });
    }

    const formattedPositions = parsedJson.positions
      .map((p: any, idx: number) => {
        const rawAmount = typeof p.amount === "number" ? p.amount : parseFloat(String(p.amount || 0));
        const amount = isNaN(rawAmount) ? 0 : Math.round(rawAmount * 100) / 100;
        let category = p.category;
        if (!["sicherheit", "wachstum", "spielgeld", "immobilien"].includes(category)) {
          category = "wachstum";
        }
        return {
          id: `ai-pos-${idx + 1}-${Date.now().toString(36)}`,
          name: p.name || `Position ${idx + 1}`,
          amount,
          category,
          notes: p.notes || "",
        };
      })
      .filter((p: any) => p.amount > 0);

    let sicherheit = 0;
    let wachstum = 0;
    let spielgeld = 0;
    let immobilien = 0;

    formattedPositions.forEach((p: any) => {
      if (p.category === "sicherheit") sicherheit += p.amount;
      else if (p.category === "wachstum") wachstum += p.amount;
      else if (p.category === "spielgeld") spielgeld += p.amount;
      else if (p.category === "immobilien") immobilien += p.amount;
    });

    const report = {
      fileName: fileName || "Screenshot / Auszug",
      fileSize: fileBase64 ? Math.round((fileBase64.length * 3) / 4) : 0,
      parsedAt: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      detectedBroker: parsedJson.detectedBroker || "Erkanntes Depot",
      positions: formattedPositions,
      totals: {
        sicherheit,
        wachstum,
        spielgeld,
        immobilien,
        gesamt: sicherheit + wachstum + spielgeld + immobilien,
      },
    };

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Fehler bei /api/extract-statement:", error);
    return res.status(200).json({
      success: false,
      fallbackToLocal: true,
      error: error?.message || "Fehler beim Analysieren des Dokuments.",
    });
  }
});

// Vite middleware & Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Angelegt Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
