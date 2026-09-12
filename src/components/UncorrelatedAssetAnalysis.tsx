import React, { useState } from "react";
import {
  Shield,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  Zap,
  PieChart as PieChartIcon,
  Globe,
  Coins,
  Building,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IstBestand, Answers } from "../types";
import { formatEuro } from "../constants/rules";

interface UncorrelatedAssetAnalysisProps {
  istBestand: IstBestand;
  answers: Answers;
  onOpenGlossary?: (termKey: string) => void;
}

// Inter-Asset Correlation Matrix (Historische Korrelationskoeffizienten 2000-2025)
const CORRELATION_MATRIX = [
  {
    name: "Welt-Aktien",
    short: "Aktien",
    correlations: {
      aktien: 1.0,
      tagesgeld: 0.01,
      gold: 0.08,
      anleihen: 0.22,
      immo: 0.32,
      krypto: 0.52,
    },
  },
  {
    name: "Tagesgeld & Geldmarkt",
    short: "Geldmarkt",
    correlations: {
      aktien: 0.01,
      tagesgeld: 1.0,
      gold: -0.04,
      anleihen: 0.18,
      immo: 0.05,
      krypto: -0.02,
    },
  },
  {
    name: "Gold & Rohstoffe",
    short: "Gold",
    correlations: {
      aktien: 0.08,
      tagesgeld: -0.04,
      gold: 1.0,
      anleihen: 0.12,
      immo: 0.16,
      krypto: 0.15,
    },
  },
  {
    name: "Staatsanleihen (Global)",
    short: "Anleihen",
    correlations: {
      aktien: 0.22,
      tagesgeld: 0.18,
      gold: 0.12,
      anleihen: 1.0,
      immo: 0.28,
      krypto: 0.08,
    },
  },
  {
    name: "Immobilien & Sachwerte",
    short: "Immobilien",
    correlations: {
      aktien: 0.32,
      tagesgeld: 0.05,
      gold: 0.16,
      anleihen: 0.28,
      immo: 1.0,
      krypto: 0.14,
    },
  },
  {
    name: "Krypto & Satelliten",
    short: "Krypto",
    correlations: {
      aktien: 0.52,
      tagesgeld: -0.02,
      gold: 0.15,
      anleihen: 0.08,
      immo: 0.14,
      krypto: 1.0,
    },
  },
];

export function UncorrelatedAssetAnalysis({
  istBestand,
  answers,
  onOpenGlossary,
}: UncorrelatedAssetAnalysisProps) {
  const [activeTab, setActiveTab] = useState<"inter" | "intra" | "score">("inter");
  const [showMatrixDetails, setShowMatrixDetails] = useState(false);

  const det = istBestand.details;
  const total = istBestand.sicherheit + istBestand.wachstum + istBestand.spielgeld;

  // 1. Check existing assets distribution
  const hasCash = (det?.tagesgeldGiro || 0) + (det?.festgeldBauspar || 0) > 0 || istBestand.sicherheit > 0;
  const hasStocks = (det?.weltEtf || 0) + (det?.einzelaktien || 0) > 0 || istBestand.wachstum > 0;
  const hasGold = (det?.goldRohstoffe || 0) > 0;
  const hasCrypto = (det?.kryptoTrends || 0) > 0 || istBestand.spielgeld > 0;
  const hasImmo = (det?.immobilieEigenkapital || 0) > 0 || (istBestand.immobilien || 0) > 0;
  const hasVorsorge = (det?.riesterKlassisch || 0) > 0 || 
    ((istBestand.vorsorge?.riesterGuthaben || 0) + 
     (istBestand.vorsorge?.ruerupGuthaben || 0) + 
     (istBestand.vorsorge?.privateRenteGuthaben || 0) + 
     (istBestand.vorsorge?.lebensversicherung || 0)) > 0;

  // 2. Calculate Uncorrelated Resilience Score (0 - 100)
  let resilienceScore = 40; // Base
  if (hasCash && hasStocks) resilienceScore += 25; // Basic 2-pillar foundation
  if (hasGold) resilienceScore += 15; // Uncorrelated crisis buffer
  if (hasImmo) resilienceScore += 10; // Tangible real asset
  if (hasVorsorge) resilienceScore += 5; // Long-term pension layer
  if ((det?.einzelaktien || 0) > (det?.weltEtf || 1) * 0.5 && (det?.einzelaktien || 0) > 0) {
    resilienceScore -= 15; // Single stock concentration penalty
  }
  if (istBestand.spielgeld > total * 0.25 && total > 0) {
    resilienceScore -= 10; // Too much speculative risk
  }
  resilienceScore = Math.min(100, Math.max(25, resilienceScore));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#2E7D32] bg-[#E8F5E9] border-[#2E7D32]/30";
    if (score >= 60) return "text-[#B8873B] bg-[#F7F4F0] border-[#B8873B]/30";
    return "text-[#C62828] bg-[#FFEBEE] border-[#C62828]/30";
  };

  const getCorrelationColor = (val: number) => {
    if (val === 1.0) return "bg-[#3E2340]/15 text-[#3E2340] font-bold";
    if (val <= 0.15) return "bg-[#E8F5E9] text-[#2E7D32] font-semibold"; // Highly uncorrelated (ideal!)
    if (val <= 0.35) return "bg-[#FFF8E1] text-[#B8873B] font-medium"; // Low/moderate correlation
    return "bg-[#FFEBEE] text-[#C62828] font-medium"; // Correlated
  };

  return (
    <div
      id="uncorrelated-asset-analysis"
      className="p-4 md:p-5 rounded-2xl bg-white border border-[#E5DFD7] space-y-4 shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD7] pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B8873B]/15 text-[#8A5E1E] text-[11px] font-bold tracking-wide">
            <Zap className="w-3.5 h-3.5 text-[#B8873B]" />
            <span>Wissenschaftliche Portfoliotheorie</span>
          </div>
          <h3 className="font-serif text-lg md:text-xl font-bold text-[#3E2340] mt-1">
            Unkorrelierte Asset-Analyse & Resilienz
          </h3>
          <p className="text-xs text-[#3E2340]/75">
            Wie deine Anlagen zusammenwirken, um Marktschocks abzufedern und Rendite zu sichern.
          </p>
        </div>

        {/* Resilienz-Score Badge */}
        <div className={`p-2.5 rounded-xl border text-center shrink-0 ${getScoreColor(resilienceScore)}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider block">
            Unkorreliertheits-Score
          </span>
          <span className="font-serif text-2xl font-bold block">
            {resilienceScore} / 100
          </span>
          <span className="text-[10px] font-medium block">
            {resilienceScore >= 80
              ? "Exzellent diversifiziert"
              : resilienceScore >= 60
              ? "Gute Basis mit Ausbau"
              : "Klumpenrisiko vorhanden"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 p-1 bg-[#EFECE6] rounded-xl border border-[#E5DFD7] text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("inter")}
          className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "inter"
              ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
              : "text-[#3E2340]/70 hover:text-[#3E2340]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="truncate">Zwischen Assetklassen</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("intra")}
          className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "intra"
              ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
              : "text-[#3E2340]/70 hover:text-[#3E2340]"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="truncate">Innerhalb der Klassen</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("score")}
          className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "score"
              ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
              : "text-[#3E2340]/70 hover:text-[#3E2340]"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="truncate">Optimierungs-Plan</span>
        </button>
      </div>

      {/* ======================= TAB 1: ZWISCHEN DEN ASSETKLASSEN ======================= */}
      {activeTab === "inter" && (
        <div className="space-y-4 pt-1">
          {/* Kernprinzip nach Markowitz & Dalio */}
          <div className="p-3.5 rounded-xl bg-[#F7F4F0] border border-[#B8873B]/30 text-xs text-[#3E2340] space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-[#3E2340]">
              <Info className="w-4 h-4 text-[#B8873B] shrink-0" />
              <span>Das Gesetz unkorrelierter Renditequellen (Harry Markowitz)</span>
            </div>
            <p>
              Zwei Anlagen sind <strong>unkorreliert (Korrelation nahe 0)</strong>, wenn sich ihre Kurse unabhängig voneinander bewegen. Wenn Aktien weltweit einbrechen, bleibt dein Tagesgeld unberührt und Gold steigt oft als Fluchtwährung. Dadurch sinkt das Gesamtrisiko deines Portfolios dramatisch – ohne Einbußen bei deiner Renditechance.
            </p>
          </div>

          {/* Analyse deines aktuellen Bestands */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#3E2340] uppercase tracking-wider">
              Analyse deiner erfassten Bausteine:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${hasStocks && hasCash ? "bg-[#E8F5E9]/50 border-[#2E7D32]/30" : "bg-[#F7F4F0] border-[#E5DFD7]"}`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${hasStocks && hasCash ? "text-[#2E7D32]" : "text-[#3E2340]/40"}`} />
                <div>
                  <strong className="block font-semibold text-[#3E2340]">
                    1. Fundament: Aktien & Liquidität
                  </strong>
                  <span className="text-[#3E2340]/75 text-[11px] leading-tight block">
                    Korrelation = 0.01 (Perfekt unkorreliert). Der Notgroschen federt den Lebensunterhalt ab, während ETFs langfristig wachsen.
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${hasGold ? "bg-[#E8F5E9]/50 border-[#2E7D32]/30" : "bg-[#FFF8E1]/60 border-[#B8873B]/30"}`}>
                <Coins className={`w-4 h-4 shrink-0 mt-0.5 ${hasGold ? "text-[#2E7D32]" : "text-[#B8873B]"}`} />
                <div>
                  <strong className="block font-semibold text-[#3E2340]">
                    2. Stoßdämpfer: Gold & Sachwerte
                  </strong>
                  <span className="text-[#3E2340]/75 text-[11px] leading-tight block">
                    {hasGold 
                      ? "Vorhanden! Gold (Korrelation zu Aktien ~0.08) stabilisiert dein Portfolio in Krisen und Inflationsphasen."
                      : "Noch nicht im Portfolio. Eine Beimischung von 5–10 % Gold wirkt wie ein Airbag bei Börsencrashs."}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${hasImmo ? "bg-[#E8F5E9]/50 border-[#2E7D32]/30" : "bg-[#F7F4F0] border-[#E5DFD7]"}`}>
                <Building className={`w-4 h-4 shrink-0 mt-0.5 ${hasImmo ? "text-[#2E7D32]" : "text-[#3E2340]/40"}`} />
                <div>
                  <strong className="block font-semibold text-[#3E2340]">
                    3. Sachwert: Immobilien / Reale Werte
                  </strong>
                  <span className="text-[#3E2340]/75 text-[11px] leading-tight block">
                    {hasImmo
                      ? "Erfasst! Reale Sachwerte haben eine geringe Korrelation zu täglichen Börsenschwankungen."
                      : "Optional: Reale Sachwerte oder REITs bringen Mieterträge unabhängig von Tech-Marktzyklen."}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${hasCrypto ? "bg-[#FFF8E1]/60 border-[#B8873B]/30" : "bg-[#F7F4F0] border-[#E5DFD7]"}`}>
                <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${hasCrypto ? "text-[#B8873B]" : "text-[#3E2340]/40"}`} />
                <div>
                  <strong className="block font-semibold text-[#3E2340]">
                    4. Satelliten: Krypto & Trends (Topf 3)
                  </strong>
                  <span className="text-[#3E2340]/75 text-[11px] leading-tight block">
                    {hasCrypto
                      ? "Vorhanden! Krypto hat bei Liquiditätsschocks eine Korrelation von ~0.52 zu Aktien. Strikt in Topf 3 halten!"
                      : "Nicht zwingend nötig. Reine Trendchancen ohne Gefährdung der Altersvorsorge."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interaktive Korrelationsmatrix */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD7] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3E2340] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#B8873B]" />
                <span>Wissenschaftliche Korrelationsmatrix (Historisch 25 Jahre)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowMatrixDetails(!showMatrixDetails)}
                className="text-[11px] font-semibold text-[#B8873B] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showMatrixDetails ? "Tabelle einklappen" : "Matrix einblenden"}</span>
                {showMatrixDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showMatrixDetails && (
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-[10px] text-center border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5DFD7] text-[#3E2340]/70 font-semibold">
                      <th className="text-left p-1.5">Assetklasse</th>
                      <th className="p-1.5">Aktien</th>
                      <th className="p-1.5">Geldmarkt</th>
                      <th className="p-1.5">Gold</th>
                      <th className="p-1.5">Anleihen</th>
                      <th className="p-1.5">Immo</th>
                      <th className="p-1.5">Krypto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CORRELATION_MATRIX.map((row) => (
                      <tr key={row.short} className="border-b border-[#E5DFD7]/50">
                        <td className="text-left font-semibold p-1.5 text-[#3E2340] whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className={`p-1.5 ${getCorrelationColor(row.correlations.aktien)}`}>
                          {row.correlations.aktien.toFixed(2)}
                        </td>
                        <td className={`p-1.5 ${getCorrelationColor(row.correlations.tagesgeld)}`}>
                          {row.correlations.tagesgeld.toFixed(2)}
                        </td>
                        <td className={`p-1.5 ${getCorrelationColor(row.correlations.gold)}`}>
                          {row.correlations.gold.toFixed(2)}
                        </td>
                        <td className={`p-1.5 ${getCorrelationColor(row.correlations.anleihen)}`}>
                          {row.correlations.anleihen.toFixed(2)}
                        </td>
                        <td className={`p-1.5 ${getCorrelationColor(row.correlations.immo)}`}>
                          {row.correlations.immo.toFixed(2)}
                        </td>
                        <td className={`p-1.5 ${getCorrelationColor(row.correlations.krypto)}`}>
                          {row.correlations.krypto.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between text-[10px] text-[#3E2340]/60 pt-2 px-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#E8F5E9] border border-[#2E7D32]/30" />
                    <span>0.00 bis 0.15: Ideal unkorreliert</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#FFF8E1] border border-[#B8873B]/30" />
                    <span>0.16 bis 0.35: Gering korreliert</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#FFEBEE] border border-[#C62828]/30" />
                    <span>&gt; 0.50: Korreliert</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: INNERHALB DER ASSETKLASSEN ======================= */}
      {activeTab === "intra" && (
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-[#F7F4F0] border border-[#B8873B]/30 text-xs text-[#3E2340] space-y-1 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-[#3E2340]">
              <Globe className="w-4 h-4 text-[#B8873B] shrink-0" />
              <span>Intra-Asset-Diversifikation (Innerhalb der Töpfe)</span>
            </div>
            <p>
              Selbst innerhalb einer einzigen Anlageklasse (z. B. Aktien) lauern oft massive <strong>versteckte Klumpenrisiken</strong>. Eine optimale Anlagestruktur eliminiert diese Klumpen gezielt.
            </p>
          </div>

          {/* 1. Klumpenrisiko-Check Topf 2 (Aktien) */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#3E2340] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#3E2340]" />
                <span>1. Der MSCI World Klumpen-Effekt (Topf 2)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#8A5E1E] text-[10px] font-bold">
                71 % USA-Anteil
              </span>
            </div>
            <p className="text-xs text-[#3E2340]/80 leading-relaxed">
              Ein klassischer <strong>MSCI World ETF</strong> gilt als Welt-Portfolio, investiert aber zu über <strong>71 % in US-Unternehmen</strong> und zu über <strong>25 % in die 7 großen US-Tech-Riesen</strong> (Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta, Tesla). Schwellenländer wie Indien, Taiwan oder Brasilien fehlen komplett!
            </p>

            <div className="p-3 rounded-xl bg-[#F7F4F0] space-y-2 text-xs">
              <span className="font-bold text-[#3E2340] block">
                Die 3 unkorrelierten Ergänzungen für Topf 2:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-[#E5DFD7] space-y-1">
                  <strong className="text-[#3E2340] block">Emerging Markets</strong>
                  <span className="text-[#3E2340]/70 block">
                    Korrelation zu US-Tech nur ~0.70. Bringt Asien, Indien und Rohstoffländer ins Depot.
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#E5DFD7] space-y-1">
                  <strong className="text-[#3E2340] block">Europa (Stoxx 600)</strong>
                  <span className="text-[#3E2340]/70 block">
                    Hoher Substanz- & Industrieanteil (Value), dämpft Tech-Korrekturen spürbar ab.
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#E5DFD7] space-y-1">
                  <strong className="text-[#3E2340] block">Global Small Caps</strong>
                  <span className="text-[#3E2340]/70 block">
                    Weltweite Nebenwerte wachsen oft in anderen Konjunkturphasen als Großkonzerne.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Einlagenrisiko-Check Topf 1 (Sicherheit) */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#3E2340] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#2E7D32]" />
                <span>2. Das Einlagenrisiko im Sicherheits-Topf (Topf 1)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold">
                100.000 € Grenze
              </span>
            </div>
            <p className="text-xs text-[#3E2340]/80 leading-relaxed">
              Die gesetzliche Einlagensicherung schützt Bankguthaben nur bis <strong>100.000 € je Kunde und Bank</strong>. Größere Sicherheitsrücklagen gehören daher nicht auf ein einziges Bankkonto, sondern in <strong>Geldmarkt-ETFs (z. B. auf Bundesanleihen)</strong>, die als rechtlich geschütztes Sondervermögen insolvenzsicher sind.
            </p>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: OPTIMIERUNGS-PLAN ======================= */}
      {activeTab === "score" && (
        <div className="space-y-3.5 pt-1">
          <div className="p-3.5 rounded-xl bg-[#F7F4F0] border border-[#B8873B]/30 space-y-1 text-xs leading-relaxed">
            <span className="font-bold text-[#3E2340] block">
              Dein konkreter 3-Schritte-Fahrplan zur maximalen Unkorreliertheit:
            </span>
            <p className="text-[#3E2340]/80">
              Folge diesen Schritten, um dein Vermögen optimal krisenfest aufzustellen:
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {/* Schritt 1 */}
            <div className="p-3 rounded-xl bg-white border border-[#E5DFD7] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#3E2340] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-0.5">
                <strong className="text-[#3E2340] block">
                  Topf 1 absichern: Notgroschen trennen & Zins mitnehmen
                </strong>
                <p className="text-[#3E2340]/75 leading-relaxed">
                  3 Nettogehälter auf ein verzinstes Tagesgeldkonto legen. Überschüssige Liquidität in Festgeldleiter oder Geldmarkt-ETFs anlegen.
                </p>
              </div>
            </div>

            {/* Schritt 2 */}
            <div className="p-3 rounded-xl bg-white border border-[#E5DFD7] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#B8873B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-0.5">
                <strong className="text-[#3E2340] block">
                  Topf 2 diversifizieren: Über den MSCI World hinausblicken
                </strong>
                <p className="text-[#3E2340]/75 leading-relaxed">
                  Entweder einen <strong>All-World / ACWI ETF</strong> wählen (enthält Schwellenländer automatisch) oder gezielt 10–15 % Emerging Markets und 10 % Europa beimischen, um das US-Klumpenrisiko zu reduzieren.
                </p>
              </div>
            </div>

            {/* Schritt 3 */}
            <div className="p-3 rounded-xl bg-white border border-[#E5DFD7] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8A5E1E] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-0.5">
                <strong className="text-[#3E2340] block">
                  Unkorrelierten Stoßdämpfer prüfen: Gold / Rohstoffe (5–10 %)
                </strong>
                <p className="text-[#3E2340]/75 leading-relaxed">
                  Eine kleine Gold-Quote (z. B. via Xetra-Gold oder Euwax Gold II) schützt bei geopolitischen Verwerfungen und Geldentwertung, da Gold nahezu 0 % Korrelation zu Aktien aufweist.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
