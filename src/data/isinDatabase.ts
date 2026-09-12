/**
 * ISIN & Wertpapier-Referenzdatenbank mit aktuellen Richtkursen (September 2026).
 * Dient der bequemen Schnell-Erfassung von ETF- & Aktien-Positionen im Ist-Bestand.
 */

export interface SecurityQuote {
  isin: string;
  wkn?: string;
  ticker: string;
  name: string;
  category: "welt_etf" | "einzelaktie" | "gold_rohstoff" | "krypto";
  priceEuro: number;
  lastUpdated: string;
  suggestedBucket: "sicherheit" | "wachstum" | "spielgeld";
  description: string;
}

export const POPULAR_SECURITIES: SecurityQuote[] = [
  // Welt-ETFs (Topf 2: Fundament)
  {
    isin: "IE00B4L5Y983",
    wkn: "A0RPWH",
    ticker: "EUNL",
    name: "iShares Core MSCI World UCITS ETF (Acc)",
    category: "welt_etf",
    priceEuro: 104.85,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Weltweites Basis-Investment (> 1.400 Unternehmen aus 23 Industrieländern)",
  },
  {
    isin: "IE00BK5BQT80",
    wkn: "A2PKXG",
    ticker: "VWCE",
    name: "Vanguard FTSE All-World UCITS ETF (Acc)",
    category: "welt_etf",
    priceEuro: 132.40,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Weltweiter All-in-One ETF inklusive Schwellenländer (> 3.600 Unternehmen)",
  },
  {
    isin: "IE00B3RBWM25",
    wkn: "A1JX52",
    ticker: "VGWL",
    name: "Vanguard FTSE All-World UCITS ETF (Dist)",
    category: "welt_etf",
    priceEuro: 125.60,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Ausschüttende Variante des weltweiten Vanguard-Klassikers",
  },
  {
    isin: "IE00BYX2JD69",
    wkn: "A2N6CW",
    ticker: "SUSW",
    name: "iShares MSCI World SRI UCITS ETF (Acc)",
    category: "welt_etf",
    priceEuro: 12.80,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Nachhaltiger Welt-ETF mit strengen ESG- und SRI-Ausschlusskriterien",
  },
  {
    isin: "LU1681045370",
    wkn: "A2H59Q",
    ticker: "AMUNDI-W",
    name: "Amundi MSCI World UCITS ETF",
    category: "welt_etf",
    priceEuro: 540.20,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Europäischer Welt-ETF mit extrem geringer Gesamtkostenquote (TER)",
  },
  {
    isin: "IE00BKM4GZ66",
    wkn: "A111X9",
    ticker: "IS3N",
    name: "iShares Core MSCI EM IMI UCITS ETF",
    category: "welt_etf",
    priceEuro: 34.50,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Schwellenländer-Beimischung zur klassischen 70/30-Strategie",
  },

  // Gold & Rohstoffe (Topf 2: Krisendiversifikation nach Dalio)
  {
    isin: "DE000A0S9GB0",
    wkn: "A0S9GB",
    ticker: "4GLD",
    name: "Xetra-Gold Inhaberschuldverschreibung",
    category: "gold_rohstoff",
    priceEuro: 81.30,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "1 Gramm Feingold physisch hinterlegt (nach 12 Monaten steuerfrei)",
  },
  {
    isin: "DE000EWG2LD7",
    wkn: "EWG2LD",
    ticker: "EWG2",
    name: "Euwax Gold II",
    category: "gold_rohstoff",
    priceEuro: 80.95,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Physisch hinterlegtes Gold mit kostenloser Auslieferungsoption",
  },

  // Einzelaktien (für Klumpenrisiko-Check)
  {
    isin: "DE0007164600",
    wkn: "716460",
    ticker: "SAP",
    name: "SAP SE",
    category: "einzelaktie",
    priceEuro: 198.50,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Europäischer Software-Konzern (DAX)",
  },
  {
    isin: "DE0008404005",
    wkn: "840400",
    ticker: "ALV",
    name: "Allianz SE",
    category: "einzelaktie",
    priceEuro: 285.40,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Versicherungskonzern mit hoher Dividendenhistorie",
  },
  {
    isin: "US0378331005",
    wkn: "865985",
    ticker: "AAPL",
    name: "Apple Inc.",
    category: "einzelaktie",
    priceEuro: 215.20,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "US-Technologiekonzern (Hardware, Software, Services)",
  },
  {
    isin: "US5949181045",
    wkn: "870747",
    ticker: "MSFT",
    name: "Microsoft Corp.",
    category: "einzelaktie",
    priceEuro: 395.00,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "US-Tech-Konzern (Cloud, KI, Office, Windows)",
  },
  {
    isin: "DE0007236101",
    wkn: "723610",
    ticker: "SIE",
    name: "Siemens AG",
    category: "einzelaktie",
    priceEuro: 178.60,
    lastUpdated: "12.09.2026",
    suggestedBucket: "wachstum",
    description: "Industrie- & Medizintechnikkonzern",
  },

  // Krypto / Spaßgeld (Topf 3)
  {
    isin: "DE000A27Z304",
    wkn: "A27Z30",
    ticker: "BTCE",
    name: "ETC Group Physical Bitcoin",
    category: "krypto",
    priceEuro: 58.20,
    lastUpdated: "12.09.2026",
    suggestedBucket: "spielgeld",
    description: "100 % physisch besicherter Krypto-ETN auf Bitcoin",
  },
  {
    isin: "DE000A3GPSP7",
    wkn: "A3GPSP",
    ticker: "ETHE",
    name: "ETC Group Physical Ethereum",
    category: "krypto",
    priceEuro: 26.40,
    lastUpdated: "12.09.2026",
    suggestedBucket: "spielgeld",
    description: "Physisch hinterlegter Krypto-ETN auf Ethereum",
  },
];

/**
 * Durchsucht die Wertpapierdatenbank nach ISIN, WKN, Ticker oder Namen
 */
export function searchSecurities(query: string): SecurityQuote[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toUpperCase();

  return POPULAR_SECURITIES.filter((item) => {
    return (
      item.isin.toUpperCase().includes(q) ||
      (item.wkn && item.wkn.toUpperCase().includes(q)) ||
      item.ticker.toUpperCase().includes(q) ||
      item.name.toUpperCase().includes(q)
    );
  });
}
