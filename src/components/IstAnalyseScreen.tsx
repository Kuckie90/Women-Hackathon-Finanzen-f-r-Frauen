import { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Building,
  ChevronDown,
  ChevronUp,
  Scale,
  PieChart,
  BarChart3,
  Activity,
  Coins,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Wallet,
  FileSearch,
  Target,
  Zap,
  BookOpen,
  Eye,
  Check,
  Landmark,
  PiggyBank,
  Percent,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { Answers, IstBestand, PotAllocation, ProfileType } from "../types";
import {
  ZIELALLOKATION,
  ZIELALLOKATION_SPANNEN,
  calculateProfile,
  formatEuro,
} from "../constants/rules";

interface IstAnalyseScreenProps {
  answers: Answers;
  istBestand: IstBestand;
  onContinueToSparrate: () => void;
  onOpenGlossary?: (termKey: string) => void;
}

// 25-Jahres-Korrelationskoeffizienten nach Markowitz & Praxis-Standards (2000-2025)
const ASSET_CORRELATIONS = [
  {
    name: "Welt-Aktien",
    short: "Aktien",
    correlations: {
      aktien: 1.0,
      tagesgeld: 0.01,
      gold: 0.08,
      anleihen: 0.22,
      immo: 0.32,
      immoFonds: 0.48,
      krypto: 0.52,
    },
  },
  {
    name: "Tagesgeld & Notgroschen",
    short: "Geldmarkt",
    correlations: {
      aktien: 0.01,
      tagesgeld: 1.0,
      gold: -0.04,
      anleihen: 0.18,
      immo: 0.04,
      immoFonds: 0.06,
      krypto: -0.02,
    },
  },
  {
    name: "Gold & Edelmetalle",
    short: "Gold",
    correlations: {
      aktien: 0.08,
      tagesgeld: -0.04,
      gold: 1.0,
      anleihen: 0.12,
      immo: 0.14,
      immoFonds: 0.16,
      krypto: 0.15,
    },
  },
  {
    name: "Eigene Immobilie (Sachwert)",
    short: "Immobilie",
    correlations: {
      aktien: 0.32,
      tagesgeld: 0.04,
      gold: 0.14,
      anleihen: 0.28,
      immo: 1.0,
      immoFonds: 0.68, // Hohe Sektor-Gleichlaufkorrelation!
      krypto: 0.12,
    },
  },
  {
    name: "Immobilienfonds & REITs",
    short: "ImmoFonds",
    correlations: {
      aktien: 0.48,
      tagesgeld: 0.06,
      gold: 0.16,
      anleihen: 0.35,
      immo: 0.68, // Hohe Gleichlaufkorrelation zu Eigenheimen!
      immoFonds: 1.0,
      krypto: 0.22,
    },
  },
  {
    name: "Krypto & Spekulation",
    short: "Krypto",
    correlations: {
      aktien: 0.52,
      tagesgeld: -0.02,
      gold: 0.15,
      anleihen: 0.08,
      immo: 0.12,
      immoFonds: 0.22,
      krypto: 1.0,
    },
  },
];

export function IstAnalyseScreen({
  answers,
  istBestand,
  onContinueToSparrate,
  onOpenGlossary,
}: IstAnalyseScreenProps) {
  // Navigation Tabs: 1 = Übersicht (Ist vs. Soll), 2 = Persönliche Assets, 3 = Handlungen & Entscheidungen
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "actions">("overview");

  // Wissenschaftlicher Hintergrund (rein auf Klick aufklappbar!)
  const [showTheoryDetails, setShowTheoryDetails] = useState<boolean>(false);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  // Filter für persönliche Assets Tab
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<
    "all" | "sicherheit" | "wachstum" | "spielgeld" | "immobilien"
  >("all");

  const breakdown = calculateProfile(answers);
  const profile: ProfileType = breakdown.finalProfile;
  const activeAllocation: PotAllocation =
    answers.customAllocation || ZIELALLOKATION[profile];
  const sollSpannen = ZIELALLOKATION_SPANNEN[profile];

  const totalIst = istBestand.sicherheit + istBestand.wachstum + istBestand.spielgeld;
  const immoEigenkapital = istBestand.immobilien || istBestand.details?.immobilieEigenkapital || 0;
  const totalNetWorth = totalIst + immoEigenkapital;

  // Prozentuale Verteilung der liquiden Töpfe
  const istProzent = {
    sicherheit: totalIst > 0 ? Math.round((istBestand.sicherheit / totalIst) * 100) : 0,
    wachstum: totalIst > 0 ? Math.round((istBestand.wachstum / totalIst) * 100) : 0,
    spielgeld: totalIst > 0 ? Math.round((istBestand.spielgeld / totalIst) * 100) : 0,
  };

  // Differenz zur Zielallokation (in Prozentpunkten)
  const diffProzent = {
    sicherheit: istProzent.sicherheit - activeAllocation.sicherheit,
    wachstum: istProzent.wachstum - activeAllocation.wachstum,
    spielgeld: istProzent.spielgeld - activeAllocation.spielgeld,
  };

  // Euro-Sollwerte bezogen auf das aktuelle liquide Vermögen
  const sollEuro = {
    sicherheit: Math.round(totalIst * (activeAllocation.sicherheit / 100)),
    wachstum: Math.round(totalIst * (activeAllocation.wachstum / 100)),
    spielgeld: Math.round(totalIst * (activeAllocation.spielgeld / 100)),
  };

  // Detailwerte aus den erfassten Anlagen
  const details = istBestand.details;
  const vorsorge = istBestand.vorsorge;

  // Topf 1 Details
  const tagesgeldGiro = details?.tagesgeldGiro || (istBestand.sicherheit > 0 && !details ? istBestand.sicherheit : 0);
  const festgeld = details?.festgeldBauspar || 0;
  const anleihen = details?.anleihen || 0;
  const riesterKlassisch = vorsorge?.riesterGuthaben || details?.riesterKlassisch || 0;
  const ruerupGuthaben = vorsorge?.ruerupGuthaben || 0;
  const lebensversicherung = vorsorge?.lebensversicherung || 0;
  const klassischeVorsorge = riesterKlassisch + ruerupGuthaben + lebensversicherung;

  // Topf 2 Details
  const weltEtf = details?.weltEtf || (istBestand.wachstum > 0 && !details ? istBestand.wachstum : 0);
  const einzelaktien = details?.einzelaktien || 0;
  const gold = details?.goldRohstoffe || 0;
  const immobilienfonds = details?.immobilienfonds || 0;
  const fondsVorsorge = vorsorge?.privateRenteGuthaben || 0;

  // Topf 3 Details
  const krypto = details?.kryptoTrends || (istBestand.spielgeld > 0 && !details ? istBestand.spielgeld : 0);
  const sonstigesTräume = istBestand.spielgeld > krypto ? istBestand.spielgeld - krypto : 0;

  // Custom Positions
  const customPositions = details?.customPositions || [];

  // =========================================================================
  // PERSÖNLICHE ASSETS DETAIL-LISTE AUFBEREITEN
  // =========================================================================
  interface AssetItem {
    id: string;
    name: string;
    potName: "Topf 1: Sicherheit" | "Topf 2: Wachstum" | "Topf 3: Träume" | "Sachwert: Immobilie";
    category: "sicherheit" | "wachstum" | "spielgeld" | "immobilien";
    amount: number;
    shareOfLiquid: number;
    shareOfTotal: number;
    badge: string;
    badgeColor: string;
    description: string;
  }

  const personalAssets: AssetItem[] = [];

  // Topf 1 Assets
  if (tagesgeldGiro > 0) {
    personalAssets.push({
      id: "tagesgeld",
      name: "Girokonto & Tagesgeld",
      potName: "Topf 1: Sicherheit",
      category: "sicherheit",
      amount: tagesgeldGiro,
      shareOfLiquid: totalIst > 0 ? Math.round((tagesgeldGiro / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((tagesgeldGiro / totalNetWorth) * 100) : 0,
      badge: "Sofort liquide",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: "Täglich verfügbarer Notgroschen & laufende Liquidität.",
    });
  }

  if (festgeld > 0) {
    personalAssets.push({
      id: "festgeld",
      name: "Festgeld & Bausparvertrag",
      potName: "Topf 1: Sicherheit",
      category: "sicherheit",
      amount: festgeld,
      shareOfLiquid: totalIst > 0 ? Math.round((festgeld / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((festgeld / totalNetWorth) * 100) : 0,
      badge: "Fristgebunden",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: "Garantierter Zinssatz mit fester Laufzeit für planbare Vorhaben.",
    });
  }

  if (anleihen > 0) {
    personalAssets.push({
      id: "anleihen",
      name: "Sichere Staatsanleihen / Geldmarktfonds",
      potName: "Topf 1: Sicherheit",
      category: "sicherheit",
      amount: anleihen,
      shareOfLiquid: totalIst > 0 ? Math.round((anleihen / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((anleihen / totalNetWorth) * 100) : 0,
      badge: "Zinsbaustein",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: "Hohe Bonität (z. B. Bundesanleihen), kaum Ausfallrisiko.",
    });
  }

  if (riesterKlassisch > 0) {
    personalAssets.push({
      id: "riester",
      name: "Klassische Riester-Rente",
      potName: "Topf 1: Sicherheit",
      category: "sicherheit",
      amount: riesterKlassisch,
      shareOfLiquid: totalIst > 0 ? Math.round((riesterKlassisch / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((riesterKlassisch / totalNetWorth) * 100) : 0,
      badge: "Gebundene Vorsorge",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
      description: "Garantierte Altersvorsorge mit staatlicher Zulage.",
    });
  }

  if (ruerupGuthaben > 0) {
    personalAssets.push({
      id: "ruerup",
      name: "Rürup-Rente (Basisrente)",
      potName: "Topf 1: Sicherheit",
      category: "sicherheit",
      amount: ruerupGuthaben,
      shareOfLiquid: totalIst > 0 ? Math.round((ruerupGuthaben / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((ruerupGuthaben / totalNetWorth) * 100) : 0,
      badge: "Steuerlich gefördert",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
      description: "Unkündbare Basisabsicherung mit hohem Sonderausgabenabzug.",
    });
  }

  if (lebensversicherung > 0) {
    personalAssets.push({
      id: "lv",
      name: "Kapitallebensversicherung (Rückkaufswert)",
      potName: "Topf 1: Sicherheit",
      category: "sicherheit",
      amount: lebensversicherung,
      shareOfLiquid: totalIst > 0 ? Math.round((lebensversicherung / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((lebensversicherung / totalNetWorth) * 100) : 0,
      badge: "Klassischer Altvertrag",
      badgeColor: "bg-slate-50 text-slate-800 border-slate-200",
      description: "Klassische Kapitalanlage mit Garantiezins.",
    });
  }

  // Topf 2 Assets
  if (weltEtf > 0) {
    personalAssets.push({
      id: "weltEtf",
      name: "Welt-Aktien-ETFs (MSCI World / All-World)",
      potName: "Topf 2: Wachstum",
      category: "wachstum",
      amount: weltEtf,
      shareOfLiquid: totalIst > 0 ? Math.round((weltEtf / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((weltEtf / totalNetWorth) * 100) : 0,
      badge: "Breit gestreut",
      badgeColor: "bg-purple-50 text-purple-900 border-purple-200",
      description: "Globales Produktivkapital über >1.500 Unternehmen weltweit.",
    });
  }

  if (einzelaktien > 0) {
    personalAssets.push({
      id: "einzelaktien",
      name: "Einzelaktien (Direktanlagen)",
      potName: "Topf 2: Wachstum",
      category: "wachstum",
      amount: einzelaktien,
      shareOfLiquid: totalIst > 0 ? Math.round((einzelaktien / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((einzelaktien / totalNetWorth) * 100) : 0,
      badge: "Einzeltitelrisiko",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-300",
      description: "Unternehmensspezifische Beteiligungen ohne Streuung.",
    });
  }

  if (immobilienfonds > 0) {
    personalAssets.push({
      id: "immobilienfonds",
      name: "Immobilienfonds & REITs",
      potName: "Topf 2: Wachstum",
      category: "wachstum",
      amount: immobilienfonds,
      shareOfLiquid: totalIst > 0 ? Math.round((immobilienfonds / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((immobilienfonds / totalNetWorth) * 100) : 0,
      badge: "Sektorkonzentration",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-300",
      description: "Gewerbe- und Wohnimmobilien; hohe Zinsabhängigkeit.",
    });
  }

  if (gold > 0) {
    personalAssets.push({
      id: "gold",
      name: "Gold & Edelmetalle / Rohstoffe",
      potName: "Topf 2: Wachstum",
      category: "wachstum",
      amount: gold,
      shareOfLiquid: totalIst > 0 ? Math.round((gold / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((gold / totalNetWorth) * 100) : 0,
      badge: "Dalio-Krisenpuffer",
      badgeColor: "bg-[#B8873B]/10 text-[#8A5E1E] border-[#B8873B]/30",
      description: "Historisch unkorrelierter Sachwert zur Krisenabsicherung.",
    });
  }

  if (fondsVorsorge > 0) {
    personalAssets.push({
      id: "fondsVorsorge",
      name: "Fondsgebundene Rentenversicherung",
      potName: "Topf 2: Wachstum",
      category: "wachstum",
      amount: fondsVorsorge,
      shareOfLiquid: totalIst > 0 ? Math.round((fondsVorsorge / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((fondsVorsorge / totalNetWorth) * 100) : 0,
      badge: "Fonds-Altersvorsorge",
      badgeColor: "bg-purple-50 text-purple-900 border-purple-200",
      description: "Wertpapiergebundener Vorsorgevertrag mit Steuervorteil.",
    });
  }

  // Topf 3 Assets
  if (krypto > 0) {
    personalAssets.push({
      id: "krypto",
      name: "Kryptowährungen (Bitcoin, ETH etc.)",
      potName: "Topf 3: Träume",
      category: "spielgeld",
      amount: krypto,
      shareOfLiquid: totalIst > 0 ? Math.round((krypto / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((krypto / totalNetWorth) * 100) : 0,
      badge: "High-Beta / Volatil",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
      description: "Spekulatives Zukunftskapital mit hohen Kursschwankungen.",
    });
  }

  if (sonstigesTräume > 0) {
    personalAssets.push({
      id: "traeume",
      name: "Freie Chancen & Wünsche",
      potName: "Topf 3: Träume",
      category: "spielgeld",
      amount: sonstigesTräume,
      shareOfLiquid: totalIst > 0 ? Math.round((sonstigesTräume / totalIst) * 100) : 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((sonstigesTräume / totalNetWorth) * 100) : 0,
      badge: "Ohne Renditedruck",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
      description: "Freies Spielgeld für persönliche Herzensprojekte & Experimente.",
    });
  }

  // Sachwert: Eigene Immobilie
  if (immoEigenkapital > 0) {
    personalAssets.push({
      id: "immobilie",
      name: "Eigene Immobilie (getilgtes Eigenkapital)",
      potName: "Sachwert: Immobilie",
      category: "immobilien",
      amount: immoEigenkapital,
      shareOfLiquid: 0,
      shareOfTotal: totalNetWorth > 0 ? Math.round((immoEigenkapital / totalNetWorth) * 100) : 0,
      badge: "Illiquider Sachwert",
      badgeColor: "bg-stone-100 text-stone-800 border-stone-300",
      description: "Selbstgenutztes oder vermietetes Immobilieneigentum (Substanzwert).",
    });
  }

  // Custom User Positions
  customPositions.forEach((cp, idx) => {
    if (cp.amount > 0) {
      personalAssets.push({
        id: `custom-${idx}`,
        name: cp.name || "Zusatzposition",
        potName:
          cp.category === "sicherheit"
            ? "Topf 1: Sicherheit"
            : cp.category === "spielgeld"
            ? "Topf 3: Träume"
            : cp.category === "immobilien"
            ? "Sachwert: Immobilie"
            : "Topf 2: Wachstum",
        category: (cp.category as any) || "wachstum",
        amount: cp.amount,
        shareOfLiquid: totalIst > 0 ? Math.round((cp.amount / totalIst) * 100) : 0,
        shareOfTotal: totalNetWorth > 0 ? Math.round((cp.amount / totalNetWorth) * 100) : 0,
        badge: "Benutzerdefiniert",
        badgeColor: "bg-[#F7F4F0] text-[#3E2340] border-[#E5DFD7]",
        description: "Manuell hinzugefügte Vermögensposition.",
      });
    }
  });

  // Gefilterte Assets
  const filteredAssets =
    assetCategoryFilter === "all"
      ? personalAssets
      : personalAssets.filter((a) => a.category === assetCategoryFilter);

  // =========================================================================
  // ANALYTISCHE BEFUNDE & RISIKO-KENNZAHLEN
  // =========================================================================

  // 1. Immobilien-Klumpen & Sektor-Gleichlauf
  const totalImmoVermögen = immoEigenkapital + immobilienfonds;
  const immoAnteilAmGesamtvermögen =
    totalNetWorth > 0 ? Math.round((totalImmoVermögen / totalNetWorth) * 100) : 0;
  const hasImmoDoppelung = immoEigenkapital > 0 && immobilienfonds > 0;
  const hasHighImmoKlumpen = totalImmoVermögen > 0 && immoAnteilAmGesamtvermögen > 40;

  // 2. Einzelaktien vs. Marktbreite (Markowitz Einzeltitelrisiko)
  const totalAktien = weltEtf + einzelaktien;
  const einzelaktienAnteil =
    totalAktien > 0 ? Math.round((einzelaktien / totalAktien) * 100) : 0;
  const hasEinzelaktienKlumpen = einzelaktien > 0 && einzelaktienAnteil > 15;

  // 3. Dalio-Allwetter-Krisenpuffer (Gold / Edelmetalle)
  const hasGoldPuffer = gold > 0;

  // 4. Liquiditätsüberhang vs. Notgroschenlücke
  const hasLiquiditaetsUeberhang = diffProzent.sicherheit > 12 && tagesgeldGiro > 15000;
  const hasSicherheitsLuecke = diffProzent.sicherheit < -8;

  // 5. Krypto & High-Beta-Volatilität
  const kryptoAnteil = totalIst > 0 ? Math.round((krypto / totalIst) * 100) : 0;
  const hasHighKrypto = kryptoAnteil > 10;

  // 6. Altverträge / Kostenprüfungsbedarf
  const hasAltvertraege = klassischeVorsorge > 0 || fondsVorsorge > 0;

  // Zählung der Risiken und Handlungsfelder
  let riskItemsCount = 0;
  if (hasEinzelaktienKlumpen) riskItemsCount++;
  if (hasImmoDoppelung || hasHighImmoKlumpen) riskItemsCount++;
  if (hasHighKrypto) riskItemsCount++;
  if (hasSicherheitsLuecke) riskItemsCount++;
  if (hasLiquiditaetsUeberhang) riskItemsCount++;

  let auditItemsCount = 0;
  if (hasAltvertraege) auditItemsCount++;
  if (tagesgeldGiro > 10000) auditItemsCount++;
  if (immobilienfonds > 0) auditItemsCount++;
  if (festgeld > 0) auditItemsCount++;
  auditItemsCount += 2; // Immer: TER-Check & Freistellungsauftrag

  let potentialItemsCount = 0;
  if (diffProzent.wachstum < -5) potentialItemsCount++;
  if (hasLiquiditaetsUeberhang) potentialItemsCount++;
  if (!hasGoldPuffer) potentialItemsCount++;
  potentialItemsCount += 2; // Immer: Zinseszins & steuerfreies Rebalancing über Sparrate

  return (
    <div id="ist-analyse-screen" className="flex flex-col flex-1 px-4 pt-3 pb-8 space-y-4">
      {/* Header Banner */}
      <div className="space-y-1 text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E2340]/10 text-[#3E2340] text-[11px] font-semibold tracking-wide">
          <Layers className="w-3.5 h-3.5 text-[#B8873B]" />
          <span>Assetanalyse • Ergebnis & Handlungsplan</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3E2340]">
          Ergebnis deiner Assetanalyse
        </h1>
        <p className="text-xs text-[#3E2340]/75 max-w-[460px] mx-auto leading-relaxed">
          Strukturiert in <strong>Überblick</strong>, <strong>persönliche Assets</strong> und konkrete <strong>Handlungsableitungen</strong> für deine nächsten Entscheidungen.
        </p>
      </div>

      {totalNetWorth > 0 ? (
        <>
          {/* ========================================================================= */}
          {/* 3 HAUPT-TABS (ÜBERSICHTLICH & SCANNBAR)                                     */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#EFECE6] border border-[#E5DFD7]">
            {/* Tab 1: Ist vs. Soll */}
            <button
              type="button"
              id="tab-ist-soll-overview"
              onClick={() => setActiveTab("overview")}
              className={`min-h-[44px] py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === "overview"
                  ? "bg-white text-[#3E2340] shadow-xs"
                  : "text-[#3E2340]/65 hover:text-[#3E2340]"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-[#B8873B] shrink-0" />
              <span className="leading-tight">1. Ist/Soll Überblick</span>
            </button>

            {/* Tab 2: Persönliche Assets */}
            <button
              type="button"
              id="tab-personal-assets"
              onClick={() => setActiveTab("assets")}
              className={`min-h-[44px] py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === "assets"
                  ? "bg-white text-[#3E2340] shadow-xs"
                  : "text-[#3E2340]/65 hover:text-[#3E2340]"
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#B8873B] shrink-0" />
              <span className="leading-tight">2. Deine Assets</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#3E2340]/10 text-[#3E2340]">
                {personalAssets.length}
              </span>
            </button>

            {/* Tab 3: Handlungsableitungen */}
            <button
              type="button"
              id="tab-action-recommendations"
              onClick={() => setActiveTab("actions")}
              className={`min-h-[44px] py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === "actions"
                  ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                  : "text-[#3E2340]/65 hover:text-[#3E2340]"
              }`}
            >
              <Target className="w-3.5 h-3.5 text-[#B8873B] shrink-0" />
              <span className="leading-tight">3. Handlungen</span>
              {riskItemsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950">
                  {riskItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: IST VS. SOLL IM ÜBERBLICK                                          */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Gesamtvermögen & Kennzahlen-Karte */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5DFD7]/70 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
                      Erfasstes Gesamtvermögen
                    </span>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#3E2340]">
                      {formatEuro(totalNetWorth)}
                    </span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-[11px] text-[#3E2340]/70 block">
                      Liquides Anlagevermögen:
                    </span>
                    <span className="font-bold text-[#3E2340]">
                      {formatEuro(totalIst)}
                    </span>
                    {immoEigenkapital > 0 && (
                      <span className="text-[10px] text-[#B8873B] font-semibold block pt-0.5">
                        + {formatEuro(immoEigenkapital)} Immobilie
                      </span>
                    )}
                  </div>
                </div>

                {/* Visueller Doppelbalken: Ist vs. Soll */}
                <div className="space-y-2.5">
                  {/* Balken 1: Dein Ist-Stand */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#3E2340] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#3E2340]" />
                        <span>Deine Ist-Aufteilung (liquide):</span>
                      </span>
                      <span className="font-mono font-bold">
                        {istProzent.sicherheit}% / {istProzent.wachstum}% / {istProzent.spielgeld}%
                      </span>
                    </div>
                    <div className="h-4 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex shadow-inner">
                      <div
                        style={{ width: `${istProzent.sicherheit}%` }}
                        className="bg-[#2E7D32] h-full transition-all"
                        title={`Topf 1 (Sicherheit): ${istProzent.sicherheit}%`}
                      />
                      <div
                        style={{ width: `${istProzent.wachstum}%` }}
                        className="bg-[#3E2340] h-full transition-all"
                        title={`Topf 2 (Wachstum): ${istProzent.wachstum}%`}
                      />
                      <div
                        style={{ width: `${istProzent.spielgeld}%` }}
                        className="bg-[#B8873B] h-full transition-all"
                        title={`Topf 3 (Träume): ${istProzent.spielgeld}%`}
                      />
                    </div>
                  </div>

                  {/* Balken 2: Dein Soll-Ziel */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#3E2340]/80 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#B8873B]" />
                        <span>Deine wissenschaftliche Ziel-Allokation:</span>
                      </span>
                      <span className="font-mono font-bold text-[#3E2340]">
                        {activeAllocation.sicherheit}% / {activeAllocation.wachstum}% / {activeAllocation.spielgeld}%
                      </span>
                    </div>
                    <div className="h-4 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex shadow-inner">
                      <div
                        style={{ width: `${activeAllocation.sicherheit}%` }}
                        className="bg-[#2E7D32]/60 h-full transition-all"
                        title={`Soll Sicherheit: ${activeAllocation.sicherheit}%`}
                      />
                      <div
                        style={{ width: `${activeAllocation.wachstum}%` }}
                        className="bg-[#3E2340]/60 h-full transition-all"
                        title={`Soll Wachstum: ${activeAllocation.wachstum}%`}
                      />
                      <div
                        style={{ width: `${activeAllocation.spielgeld}%` }}
                        className="bg-[#B8873B]/60 h-full transition-all"
                        title={`Soll Träume: ${activeAllocation.spielgeld}%`}
                      />
                    </div>
                  </div>

                  {/* Legende */}
                  <div className="flex items-center justify-between text-[10px] text-[#3E2340]/70 pt-1 border-t border-[#E5DFD7]/50">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                      <span>1. Sicherheit ({istProzent.sicherheit}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3E2340]" />
                      <span>2. Wachstum ({istProzent.wachstum}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#B8873B]" />
                      <span>3. Träume ({istProzent.spielgeld}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Die 3 Töpfe im direkten Soll-Ist-Vergleich (Kompaktkarten) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Topf 1: Sicherheit */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#2E7D32]">
                      <BuddhaIcon className="w-3.5 h-3.5 text-[#2E7D32]" />
                      <span>Topf 1: Sicherheit</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        diffProzent.sicherheit > 8
                          ? "bg-amber-100 text-amber-900"
                          : diffProzent.sicherheit < -8
                          ? "bg-rose-100 text-rose-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {diffProzent.sicherheit > 0 ? `+${diffProzent.sicherheit} %` : `${diffProzent.sicherheit} %`}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#3E2340]/60 block">Ist-Betrag (Quote)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif font-bold text-base text-[#3E2340]">
                        {formatEuro(istBestand.sicherheit)}
                      </span>
                      <span className="text-xs font-bold text-[#2E7D32]">
                        {istProzent.sicherheit} %
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5DFD7]/60 text-[11px] flex justify-between text-[#3E2340]/70">
                    <span>Soll-Ziel:</span>
                    <span className="font-semibold text-[#3E2340]">
                      {activeAllocation.sicherheit} % (~{formatEuro(sollEuro.sicherheit)})
                    </span>
                  </div>

                  <p className="text-[10px] text-[#3E2340]/60 leading-tight">
                    {diffProzent.sicherheit > 10
                      ? "Hoher Sicherheitsüberhang. Notgroschen voll; Geld verliert real Kaufkraft."
                      : diffProzent.sicherheit < -8
                      ? "Puffer unter Vorgabe. Vor neuen Aktien zuerst den Notgroschen auffüllen."
                      : "Ausgewogen im Zielkorridor."}
                  </p>
                </div>

                {/* Topf 2: Wachstum */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#3E2340]">
                      <TrendingUp className="w-3.5 h-3.5 text-[#3E2340]" />
                      <span>Topf 2: Wachstum</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        diffProzent.wachstum < -8
                          ? "bg-purple-100 text-purple-900"
                          : diffProzent.wachstum > 8
                          ? "bg-blue-100 text-blue-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {diffProzent.wachstum > 0 ? `+${diffProzent.wachstum} %` : `${diffProzent.wachstum} %`}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#3E2340]/60 block">Ist-Betrag (Quote)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif font-bold text-base text-[#3E2340]">
                        {formatEuro(istBestand.wachstum)}
                      </span>
                      <span className="text-xs font-bold text-[#3E2340]">
                        {istProzent.wachstum} %
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5DFD7]/60 text-[11px] flex justify-between text-[#3E2340]/70">
                    <span>Soll-Ziel:</span>
                    <span className="font-semibold text-[#3E2340]">
                      {activeAllocation.wachstum} % (~{formatEuro(sollEuro.wachstum)})
                    </span>
                  </div>

                  <p className="text-[10px] text-[#3E2340]/60 leading-tight">
                    {diffProzent.wachstum < -8
                      ? "Wachstums-Potenzial ungenutzt. Sparrate gezielt in Welt-ETFs lenken."
                      : diffProzent.wachstum > 8
                      ? "Starker Rendite-Motor. Bei hoher Börsenvolatilität Schwankungen aushalten."
                      : "Perfekt auf dein Risikoprofil abgestimmt."}
                  </p>
                </div>

                {/* Topf 3: Träume */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#8A5E1E]">
                      <Sparkles className="w-3.5 h-3.5 text-[#B8873B]" />
                      <span>Topf 3: Träume</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        diffProzent.spielgeld > 5
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {diffProzent.spielgeld > 0 ? `+${diffProzent.spielgeld} %` : `${diffProzent.spielgeld} %`}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#3E2340]/60 block">Ist-Betrag (Quote)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif font-bold text-base text-[#8A5E1E]">
                        {formatEuro(istBestand.spielgeld)}
                      </span>
                      <span className="text-xs font-bold text-[#8A5E1E]">
                        {istProzent.spielgeld} %
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5DFD7]/60 text-[11px] flex justify-between text-[#3E2340]/70">
                    <span>Soll-Ziel:</span>
                    <span className="font-semibold text-[#3E2340]">
                      {activeAllocation.spielgeld} % (~{formatEuro(sollEuro.spielgeld)})
                    </span>
                  </div>

                  <p className="text-[10px] text-[#3E2340]/60 leading-tight">
                    {krypto > 0
                      ? `Enthält ${formatEuro(krypto)} Krypto. Bei max. 5–10 % des Gesamtvermögens halten.`
                      : "Freies Budget für Herzenswünsche und Trends ohne Renditedruck."}
                  </p>
                </div>
              </div>

              {/* Sachwert Immobilie (falls vorhanden) */}
              {immoEigenkapital > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F7F4F0] border border-[#B8873B]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#3E2340] block">
                        Sachwert-Fundament: Eigene Immobilie
                      </span>
                      <span className="text-[10px] text-[#3E2340]/65">
                        {immoAnteilAmGesamtvermögen} % des Gesamtvermögens • Illiquider Vermögensanker
                      </span>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-base text-[#3E2340]">
                    {formatEuro(immoEigenkapital)}
                  </span>
                </div>
              )}

              {/* Kompaktes Fazit & Schnell-Sprung zu den nächsten Schritten */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0 mt-0.5">
                    <FileSearch className="w-4 h-4 text-[#B8873B]" />
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-[#3E2340] block">
                      Analytisches Fazit zu deinem Ist-Soll-Vergleich:
                    </span>
                    <p className="text-[#3E2340]/80 leading-relaxed">
                      {diffProzent.sicherheit > 10
                        ? `Dein Portfolio weist einen Sicherheitsüberhang von +${diffProzent.sicherheit} % auf. Du verfügst über einen starken Notgroschen, verlierst aber langfristig Kaufkraft gegen die Inflation.`
                        : diffProzent.wachstum > 10
                        ? "Dein Portfolio ist stark renditeorientiert aufgestellt. Achte darauf, dass dein Notgroschen in Topf 1 jederzeit vor Marktschwankungen geschützt bleibt."
                        : "Deine Aufteilung liegt sehr nah an deiner wissenschaftlich errechneten Zielallokation. Der Schlüssel liegt in der fortlaufenden Steuerung der monatlichen Sparrate."}
                    </p>
                  </div>
                </div>

                {/* 2 Quick Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#E5DFD7]/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab("assets")}
                    className="py-2.5 px-3 rounded-xl bg-[#F7F4F0] hover:bg-[#EFECE6] text-[#3E2340] text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span>Alle {personalAssets.length} Assets detailliert ansehen</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B8873B]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("actions")}
                    className="py-2.5 px-3 rounded-xl bg-[#3E2340] hover:bg-[#3E2340]/90 text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Handlungen & Risiko-Check ansehen</span>
                    <Target className="w-3.5 h-3.5 text-[#B8873B]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PERSÖNLICHE ASSETS DETAILLIERT                                      */}
          {/* ========================================================================= */}
          {activeTab === "assets" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAssetCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    assetCategoryFilter === "all"
                      ? "bg-[#3E2340] text-white"
                      : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:text-[#3E2340]"
                  }`}
                >
                  Alle ({personalAssets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssetCategoryFilter("sicherheit")}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    assetCategoryFilter === "sicherheit"
                      ? "bg-[#2E7D32] text-white"
                      : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:text-[#3E2340]"
                  }`}
                >
                  Topf 1: Sicherheit
                </button>
                <button
                  type="button"
                  onClick={() => setAssetCategoryFilter("wachstum")}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    assetCategoryFilter === "wachstum"
                      ? "bg-[#3E2340] text-white"
                      : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:text-[#3E2340]"
                  }`}
                >
                  Topf 2: Wachstum
                </button>
                <button
                  type="button"
                  onClick={() => setAssetCategoryFilter("spielgeld")}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    assetCategoryFilter === "spielgeld"
                      ? "bg-[#B8873B] text-white"
                      : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:text-[#3E2340]"
                  }`}
                >
                  Topf 3: Träume
                </button>
                {immoEigenkapital > 0 && (
                  <button
                    type="button"
                    onClick={() => setAssetCategoryFilter("immobilien")}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      assetCategoryFilter === "immobilien"
                        ? "bg-stone-700 text-white"
                        : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:text-[#3E2340]"
                    }`}
                  >
                    Immobilie
                  </button>
                )}
              </div>

              {/* Detaillierte Liste der erfassten Bausteine */}
              <div className="space-y-2.5">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-2xs hover:border-[#B8873B]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#3E2340]">
                            {asset.name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${asset.badgeColor}`}
                          >
                            {asset.badge}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-[#3E2340]/60 block">
                          Zugeordnet zu: <strong>{asset.potName}</strong>
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-base text-[#3E2340] block">
                          {formatEuro(asset.amount)}
                        </span>
                        <span className="text-[10px] font-semibold text-[#B8873B]">
                          {asset.category === "immobilien"
                            ? `${asset.shareOfTotal} % vom Gesamtvermögen`
                            : `${asset.shareOfLiquid} % der liquiden Töpfe`}
                        </span>
                      </div>
                    </div>

                    {/* Visueller Anteil-Balken */}
                    <div className="h-1.5 w-full bg-[#E5DFD7]/60 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            asset.category === "immobilien" ? asset.shareOfTotal : asset.shareOfLiquid
                          )}%`,
                        }}
                        className={`h-full rounded-full ${
                          asset.category === "sicherheit"
                            ? "bg-[#2E7D32]"
                            : asset.category === "wachstum"
                            ? "bg-[#3E2340]"
                            : asset.category === "spielgeld"
                            ? "bg-[#B8873B]"
                            : "bg-stone-600"
                        }`}
                      />
                    </div>

                    <p className="text-[11px] text-[#3E2340]/75 leading-relaxed">
                      {asset.description}
                    </p>
                  </div>
                ))}

                {filteredAssets.length === 0 && (
                  <div className="p-6 rounded-2xl bg-white border border-[#E5DFD7] text-center text-xs text-[#3E2340]/60">
                    Keine Positionen in dieser Kategorie vorhanden.
                  </div>
                )}
              </div>

              {/* Button zum Wechseln zu den Handlungsableitungen */}
              <button
                type="button"
                onClick={() => setActiveTab("actions")}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#3E2340] hover:bg-[#3E2340]/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Zu den Handlungsableitungen & Entscheidungen</span>
                <ArrowRight className="w-4 h-4 text-[#B8873B]" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HANDLUNGSABLEITUNGEN & ENTSCHEIDUNGSLEITFADEN                       */}
          {/* ========================================================================= */}
          {activeTab === "actions" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* ===================================================================== */}
              {/* PILLAR 1: WO HABE ICH MEHR RISIKO?                                   */}
              {/* ===================================================================== */}
              <div className="p-4 rounded-2xl bg-white border border-rose-200/80 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-rose-950">
                        1. Wo habe ich mehr Risiko?
                      </h3>
                      <span className="text-[10px] text-rose-900/70">
                        Klumpenrisiken, Einzeltitel & Liquiditätslücken
                      </span>
                    </div>
                  </div>
                  {riskItemsCount > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      {riskItemsCount} Prüfpunkte
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Geringes Risiko
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* Risiko 1: Einzelaktien-Klumpen */}
                  {hasEinzelaktienKlumpen ? (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Einzeltitelrisiko: {einzelaktienAnteil} % in konkreten Einzelaktien</span>
                        </span>
                        <span className="text-[10px] font-mono">{formatEuro(einzelaktien)}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-950/90">
                        <strong>Das Risiko:</strong> Einzelunternehmen tragen ein unkompensiertes Idiosynkrasie-Risiko (Managementfehler, Branchenkrisen, Skandale). Der Kapitalmarkt belohnt dieses Zusatzrisiko im Durchschnitt nicht mit einer Mehrrendite gegenüber einem Welt-ETF.
                      </p>
                      <div className="p-2 rounded-lg bg-white/80 text-[11px] text-amber-900 font-semibold flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8873B] shrink-0 mt-0.5" />
                        <span>Deine Entscheidung: Künftige Sparraten in den Welt-ETF leiten; Einzelaktien als Satellit auf maximal 10–15 % deckeln.</span>
                      </div>
                    </div>
                  ) : einzelaktien > 0 ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Einzelaktien im gesunden Rahmen ({einzelaktienAnteil} % des Aktienanteils).</span>
                      </span>
                      <span className="font-bold">{formatEuro(einzelaktien)}</span>
                    </div>
                  ) : null}

                  {/* Risiko 2: Immobilien-Doppelung / Klumpen */}
                  {hasImmoDoppelung ? (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Sektor-Doppelung: Eigenheim ({formatEuro(immoEigenkapital)}) + Immobilienfonds ({formatEuro(immobilienfonds)})</span>
                        </span>
                        <span className="text-[10px] font-mono">Korrelation ~0.68</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-950/90">
                        <strong>Das Risiko:</strong> Beide Bausteine reagieren auf dieselben Zins- und Bauzyklen. Zusammen machen sie {immoAnteilAmGesamtvermögen} % deines Gesamtvermögens aus.
                      </p>
                      <div className="p-2 rounded-lg bg-white/80 text-[11px] text-amber-900 font-semibold flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8873B] shrink-0 mt-0.5" />
                        <span>Deine Entscheidung: Keine weiteren Immobilienfonds zukaufen. Sparrate gezielt in liquide Welt-ETFs lenken, um den Klumpen über Zeit zu glätten.</span>
                      </div>
                    </div>
                  ) : hasHighImmoKlumpen ? (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-amber-700" />
                          <span>Illiquiditätsrisiko im Eigenheim ({immoAnteilAmGesamtvermögen} % deines Vermögens)</span>
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-950/90">
                        <strong>Das Risiko:</strong> Hohe Bindung im Sachwert. Im Notfall kann man kein „halbes Zimmer verkaufen“, um liquide Rechnungen zu bezahlen.
                      </p>
                      <div className="p-2 rounded-lg bg-white/80 text-[11px] text-amber-900 font-semibold flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8873B] shrink-0 mt-0.5" />
                        <span>Deine Entscheidung: Konsequenter Aufbau eines liquiden Wertpapier-Puffers (Topf 2), um finanzielle Unabhängigkeit zu sichern.</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Risiko 3: Notgroschen-Lücke */}
                  {hasSicherheitsLuecke && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-950">
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                          <span>Sicherheits-Puffer unter Ziel: {diffProzent.sicherheit} % Differenz</span>
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-950/90">
                        <strong>Das Risiko:</strong> Wenn unerwartete Ausgaben eintreffen, musst du möglicherweise Aktien-ETFs mitten in einer Börsenflaute mit Verlust verkaufen.
                      </p>
                      <div className="p-2 rounded-lg bg-white/80 text-[11px] text-rose-900 font-semibold flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8873B] shrink-0 mt-0.5" />
                        <span>Deine Entscheidung: Erste Priorität in Schritt 3 ist das Auffüllen des Notgroschens auf 3–6 Monatsausgaben auf Tagesgeld.</span>
                      </div>
                    </div>
                  )}

                  {/* Risiko 4: Hoher Barliquiditäts-Überhang (Kaufkraftverlust) */}
                  {hasLiquiditaetsUeberhang && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                          <span>Kaufkraftverlust durch Barüberhang (+{diffProzent.sicherheit} % in Topf 1)</span>
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-950/90">
                        <strong>Das Risiko:</strong> {formatEuro(tagesgeldGiro)} auf Giro/Tagesgeld verliert durch die Inflation kontinuierlich an realer Kaufkraft (bei 2,5 % Inflation rund ~22 % in 10 Jahren).
                      </p>
                      <div className="p-2 rounded-lg bg-white/80 text-[11px] text-amber-900 font-semibold flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8873B] shrink-0 mt-0.5" />
                        <span>Deine Entscheidung: Notgroschen behalten, den Überschuss planvoll in 3–6 Tranchen in Topf 2 Welt-ETFs überführen.</span>
                      </div>
                    </div>
                  )}

                  {/* Risiko 5: Hoher Krypto-Anteil */}
                  {hasHighKrypto && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          <span>Hohe Volatilität: Krypto-Anteil liegt bei {kryptoAnteil} %</span>
                        </span>
                        <span className="text-[10px] font-mono">{formatEuro(krypto)}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-950/90">
                        <strong>Das Risiko:</strong> Drawdowns von -60 % bis -80 % sind historisch typisch. Hohe Gleichlauf-Gefahr mit Tech-Aktien bei Liquiditätsschocks.
                      </p>
                      <div className="p-2 rounded-lg bg-white/80 text-[11px] text-amber-900 font-semibold flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8873B] shrink-0 mt-0.5" />
                        <span>Deine Entscheidung: Krypto strikt in Topf 3 belassen und auf max. 5–10 % des Gesamtportfolios begrenzen.</span>
                      </div>
                    </div>
                  )}

                  {riskItemsCount === 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Hervorragende Risikobalance!</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-950/80">
                        Es wurden keine kritischen Klumpenrisiken, Einzeltitelübergewichte oder akute Liquiditätslücken in deinem Portfolio gefunden.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ===================================================================== */}
              {/* PILLAR 2: WO SOLL ICH REINGUCKEN? (PRÜFFELDER & VERTRÄGE)            */}
              {/* ===================================================================== */}
              <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center shrink-0">
                      <FileSearch className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#3E2340]">
                        2. Wo soll ich reingucken?
                      </h3>
                      <span className="text-[10px] text-[#3E2340]/65">
                        Konkrete Prüffelder bei deinen Verträgen & Konten
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B8873B]/10 text-[#8A5E1E]">
                    {auditItemsCount} Prüffelder
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-[#3E2340]">
                  {/* Prüffeld 1: Altverträge & Rentenversicherungen */}
                  {hasAltvertraege && (
                    <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[#3E2340]">
                        <span className="flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-[#B8873B]" />
                          <span>Renten- & Vorsorgeverträge auditieren ({formatEuro(klassischeVorsorge + fondsVorsorge)})</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
                        Hole die letzte jährliche <strong>Standmitteilung</strong> deines Versicherers hervor und prüfe:
                      </p>
                      <ul className="text-[11px] space-y-1 text-[#3E2340]/80 pl-4 list-disc">
                        <li><strong>Effektivkostenquote (TER):</strong> Liegen die jährlichen Verwaltungskosten über 1,5 % p.a.?</li>
                        <li><strong>Garantiezins vs. Inflation:</strong> Bringt der Vertrag nach Kosten und Inflation überhaupt einen realen Wertzuwachs?</li>
                        <li><strong>Reform 2026:</strong> Prüfe, ob eine Beitragsfreistellung oder ein Wechsel ins neue staatlich geförderte Altersvorsorgedepot (ab 2026) lukrativer ist.</li>
                      </ul>
                    </div>
                  )}

                  {/* Prüffeld 2: Depotgebühren & Fondskosten */}
                  <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-[#3E2340]">
                      <span className="flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-[#B8873B]" />
                        <span>Kostenquote (TER) im Wertpapierdepot prüfen</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
                      Werfen viele klassische Bank- und Dachfonds 1,5 % bis 2,5 % laufende Kosten p.a. ab? Ein Wechsel auf einen breit gestreuten Welt-ETF mit <strong>0,12 % bis 0,22 % TER</strong> spart auf 20 Jahre zehntausende Euro an Gebühren.
                    </p>
                  </div>

                  {/* Prüffeld 3: Zinsloses Girokonto */}
                  {tagesgeldGiro > 8000 && (
                    <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[#3E2340]">
                        <span className="flex items-center gap-1.5">
                          <PiggyBank className="w-3.5 h-3.5 text-[#B8873B]" />
                          <span>Zinsen auf Giro- vs. Tagesgeldkonto prüfen</span>
                        </span>
                        <span className="text-[10px] font-mono">{formatEuro(tagesgeldGiro)}</span>
                      </div>
                      <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
                        Auf dem laufenden Girokonto sollte nur der Puffer für die monatlichen Fixkosten verbleiben. Den Restbetrag auf ein verzinstes Tagesgeldkonto oder in einen Geldmarkt-ETF (z. B. DBX0AN) überweisen.
                      </p>
                    </div>
                  )}

                  {/* Prüffeld 4: Bausparvertrag */}
                  {festgeld > 0 && (
                    <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[#3E2340]">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#B8873B]" />
                          <span>Bausparvertrag & Guthabenzins prüfen</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
                        Prüfe, ob dein Bausparer zuteilungsreif ist und ob der Darlehenszins noch attraktiv ist. Liegt der Guthabenzins bei unter 0,5 %, lohnt sich das weitere Besparen meist nicht mehr.
                      </p>
                    </div>
                  )}

                  {/* Prüffeld 5: Freistellungsauftrag */}
                  <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-[#3E2340]">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#B8873B]" />
                        <span>Sparerpauschbetrag (1.000 € / 2.000 €) hinterlegt?</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
                      Stelle sicher, dass dein Freistellungsauftrag bei deinen Depot- und Tagesgeldbanken eingerichtet ist, damit Zinsen und Vorabpauschale steuerfrei gutgeschrieben werden.
                    </p>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* PILLAR 3: WO IST MEHR POTENTIAL? (WACHSTUMSCHANCEN)                  */}
              {/* ===================================================================== */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-emerald-950">
                        3. Wo ist mehr Potential?
                      </h3>
                      <span className="text-[10px] text-emerald-900/70">
                        Wachstumschancen, Zinseszins & Sparraten-Hebel
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {potentialItemsCount} Chancen
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-emerald-950">
                  {/* Chance 1: Der Zinseszins-Hebel in Topf 2 */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Zinseszins-Effekt im Welt-Aktien-ETF (Topf 2)</span>
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-200 px-1.5 py-0.5 rounded">
                        ~7 % p.a. historisch
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-950/90">
                      Weltweite Produktivbeteiligungen bringen historisch durchschnittlich ~7 % p.a. Vor allem bei langen Zeithorizonten entfaltet der Zinseszins exponentielle Kraft: 200 € monatlich über 25 Jahre wachsen bei 6 % Realrendite auf über 138.000 € an (bei nur 60.000 € eigener Einzahlung).
                    </p>
                  </div>

                  {/* Chance 2: Rebalancing über neue Sparrate (Steuerfrei) */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Steuerfreies Rebalancing über die monatliche Sparrate</span>
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-950/90">
                      Du musst bestehende Gewinne nicht verkaufen und versteuern! Richte in Schritt 3 deine monatliche Sparrate einfach so aus, dass sie bevorzugt in deine untergewichteten Töpfe fließt.
                    </p>
                  </div>

                  {/* Chance 3: Liquiditätsüberhang nutzen */}
                  {hasLiquiditaetsUeberhang && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Unproduktive Barreserve in Rendite umwandeln</span>
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-950/90">
                        Wenn du den Teil oberhalb deines Notgroschens (z. B. 10.000 € bis 20.000 €) schrittweise in Topf 2 investierst, arbeitest du aktiv gegen den Kaufkraftverlust an.
                      </p>
                    </div>
                  )}

                  {/* Chance 4: Dalio-Allwetter-Stabilität mit Gold */}
                  {!hasGoldPuffer && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#B8873B]" />
                          <span>Krisendiversifikation nach Ray Dalio (Gold-Beimischung)</span>
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-950/90">
                        Eine Beimischung von 5–10 % physischem Gold (z. B. Xetra-Gold) in Topf 2 weist eine Korrelation von nur ~0.08 zu Aktien auf und dämpft Portfoliovolalität in geopolitischen Krisen spürbar ab.
                      </p>
                    </div>
                  )}

                  {/* Chance 5: Altersvorsorgedepot Reform 2026 */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Altersvorsorgedepot (Reform 2026) vorbereiten</span>
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-950/90">
                      Die Reform der privaten Altersvorsorge bringt voraussichtlich ein steuerbegünstigtes ETF-Altersvorsorgedepot ohne teure Versicherungsmäntel. Bereite deine Strategie jetzt vor.
                    </p>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* SCHRITT-FÜR-SCHRITT HANDLUNGSLEITFADEN                              */}
              {/* ===================================================================== */}
              <div className="p-4 rounded-2xl bg-[#3E2340] text-[#F7F4F0] space-y-3 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8873B]">
                    Entscheidungs-Fahrplan
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Deine nächsten 3 Schritte:
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B8873B] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      <strong className="block text-white">Notgroschen absichern</strong>
                      <span className="text-white/75 text-[11px] leading-tight block">
                        3 bis 6 Monatsausgaben auf separatem Tagesgeld fest reservieren (Topf 1).
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B8873B] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      <strong className="block text-white">Monatliche Sparrate in Schritt 3 zuweisen</strong>
                      <span className="text-white/75 text-[11px] leading-tight block">
                        Untergewichtete Töpfe gezielt über den monatlichen Sparplan ausgleichen.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B8873B] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      <strong className="block text-white">Altverträge & Gebühren prüfen</strong>
                      <span className="text-white/75 text-[11px] leading-tight block">
                        Standmitteilungen prüfen, teure Gebühren (&gt;1,5 % TER) stoppen und Freistellungsauftrag optimieren.
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="goto-sparrate-btn-from-actions"
                  onClick={onContinueToSparrate}
                  className="w-full min-h-[46px] mt-2 px-4 py-2.5 rounded-xl bg-[#B8873B] hover:bg-[#A37530] active:scale-[0.99] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Weiter zur Sparraten-Allokation (Schritt 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* WISSENSCHAFTLICHER HINTERGRUND (NUR ZUM ANKLICKEN!)                         */}
          {/* ========================================================================= */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-2xs">
            <button
              type="button"
              id="toggle-scientific-theory-btn"
              onClick={() => setShowTheoryDetails(!showTheoryDetails)}
              className="w-full py-1 text-left flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#B8873B]/10 text-[#B8873B] group-hover:bg-[#B8873B] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#3E2340] group-hover:text-[#B8873B] transition-colors flex items-center gap-1.5">
                    <span>Wissenschaftlicher Hintergrund & Korrelationsmatrix</span>
                    <span className="text-[10px] text-[#3E2340]/50 font-normal">
                      (Markowitz, Dalio, Kommer)
                    </span>
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60 block">
                    Hier klicken für Formeln, Nobelpreis-Theorie & 25-Jahres-Tabelle
                  </span>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-[#F7F4F0] text-[#3E2340]/60 group-hover:text-[#3E2340]">
                {showTheoryDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showTheoryDetails && (
              <div className="pt-3 border-t border-[#E5DFD7] space-y-3.5 text-xs text-[#3E2340]/80 leading-relaxed animate-in fade-in duration-200">
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#F7F4F0] space-y-1 border border-[#E5DFD7]/70">
                    <strong className="text-[#3E2340] block">1. Harry Markowitz – Nobelpreis 1990 (Moderne Portfoliotheorie):</strong>
                    <p className="text-[11px]">
                      Das Gesamtrisiko eines Portfolios hängt nicht allein vom Risiko der Einzelteile ab, sondern vor allem davon, wie diese miteinander <em>korrelieren</em>. Kombiniert man Vermögenswerte mit niedriger oder gegenläufiger Korrelation (z. B. Aktien & Gold oder Cash), sinkt das Gesamtrisiko, ohne die Rendite proportional zu senken („The only free lunch in finance“).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4F0] space-y-1 border border-[#E5DFD7]/70">
                    <strong className="text-[#3E2340] block">2. Ray Dalio – All-Weather-Prinzip (Bridgewater):</strong>
                    <p className="text-[11px]">
                      Konstruktion krisenfester Portfolios über 4 makroökonomische Wetterlagen (Wachstum vs. Abschwung, Inflation vs. Deflation) durch Beimischung unkorrelierter Sachwerte wie Gold und Rohstoffe.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7F4F0] space-y-1 border border-[#E5DFD7]/70">
                    <strong className="text-[#3E2340] block">3. Dr. Gerd Kommer – Weltportfolio-Konzept:</strong>
                    <p className="text-[11px]">
                      Marktbreite schlägt Stock-Picking: Durch Investition in den gesamten Weltaktienmarkt über kostengünstige Indexfonds (ETFs) entfällt das Klumpenrisiko von Einzelwerten vollständig bei minimalen laufenden Kosten.
                    </p>
                  </div>
                </div>

                {/* 25-Jahres-Korrelationsmatrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3E2340] text-xs flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#B8873B]" />
                      <span>Empirische 25-Jahres-Korrelationsmatrix (2000–2025)</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-[#3E2340]/70 leading-relaxed">
                    Ein Wert von <strong>1.0</strong> bedeutet perfekten Gleichlauf. Werte nahe <strong>0.0</strong> oder negativ bedeuten, dass sich die Anlageklassen unabhängig voneinander bewegen und das Gesamtrisiko wirksam senken.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-[#E5DFD7]">
                    <table className="w-full text-[10px] border-collapse text-center">
                      <thead>
                        <tr className="bg-[#F7F4F0] border-b border-[#E5DFD7] text-[#3E2340]/70">
                          <th className="text-left py-1.5 px-2 font-bold">Anlageklasse</th>
                          <th className="py-1.5 px-1 font-semibold">Aktien</th>
                          <th className="py-1.5 px-1 font-semibold">Geldm.</th>
                          <th className="py-1.5 px-1 font-semibold">Gold</th>
                          <th className="py-1.5 px-1 font-semibold">Immo</th>
                          <th className="py-1.5 px-1 font-semibold">ImmoF.</th>
                          <th className="py-1.5 px-1 font-semibold">Krypto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ASSET_CORRELATIONS.map((row) => (
                          <tr key={row.name} className="border-b border-[#E5DFD7]/40 hover:bg-[#F7F4F0]/50">
                            <td className="text-left py-1.5 px-2 font-medium text-[#3E2340] whitespace-nowrap">
                              {row.short}
                            </td>
                            <td className="py-1 px-1 font-mono font-semibold bg-gray-50/50">
                              {row.correlations.aktien.toFixed(2)}
                            </td>
                            <td
                              className={`py-1 px-1 font-mono font-semibold ${
                                row.correlations.tagesgeld <= 0.05
                                  ? "bg-emerald-50 text-emerald-800"
                                  : ""
                              }`}
                            >
                              {row.correlations.tagesgeld.toFixed(2)}
                            </td>
                            <td
                              className={`py-1 px-1 font-mono font-semibold ${
                                row.correlations.gold <= 0.15
                                  ? "bg-emerald-50 text-emerald-800"
                                  : ""
                              }`}
                            >
                              {row.correlations.gold.toFixed(2)}
                            </td>
                            <td className="py-1 px-1 font-mono font-semibold">
                              {row.correlations.immo.toFixed(2)}
                            </td>
                            <td
                              className={`py-1 px-1 font-mono font-semibold ${
                                row.correlations.immoFonds >= 0.6
                                  ? "bg-amber-100 text-amber-950 font-bold"
                                  : ""
                              }`}
                            >
                              {row.correlations.immoFonds.toFixed(2)}
                            </td>
                            <td className="py-1 px-1 font-mono font-semibold">
                              {row.correlations.krypto.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-[#3E2340]/60 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Grün: Sehr geringe Korrelation (Diversifikations-Vorteil)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Gelb: Hoher Gleichlauf (Klumpengefahr)
                    </span>
                  </div>
                </div>

                {/* Rechtlicher Transparenz-Hinweis */}
                <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] text-[#3E2340]/60 leading-relaxed space-y-1">
                  <strong className="block text-[#3E2340]/80">Transparenzhinweis & Methodik:</strong>
                  <p>
                    Diese Auswertung basiert auf mathematischen und finanzwissenschaftlichen Prinzipien der Modernen Portfoliotheorie (Markowitz), des Allwetter-Prinzips (Ray Dalio) und der Weltportfolio-Strategie (Gerd Kommer). Sie dient der reinen Portfolioanalyse und finanziellen Orientierung und stellt keine Anlageberatung oder Kaufempfehlung nach dem Wertpapierhandelsgesetz (WpHG) dar.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Frischer Start / 0 € */
        <div className="p-6 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#3E2340]">
              Frischer Start: Keine Altlasten
            </h3>
            <p className="text-xs text-[#3E2340]/75 max-w-[360px] mx-auto leading-relaxed">
              Du startest ohne bestehende Verträge oder Depots. Das ist ein großer Vorteil: Dein Portfolio wird ab dem ersten Euro exakt nach deiner wissenschaftlichen Ziel-Allokation aufgebaut.
            </p>
          </div>
        </div>
      )}

      {/* Überleitung zu Schritt 3: Sparraten-Allokation */}
      <div className="p-4 rounded-2xl bg-[#3E2340] text-[#F7F4F0] space-y-3 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8873B]">
            Nächster Schritt
          </span>
          <h2 className="font-serif text-lg font-bold text-[#F7F4F0]">
            Deine monatliche Sparrate & Allokation
          </h2>
          <p className="text-xs text-[#F7F4F0]/80 leading-relaxed">
            Nun legen wir fest, wie deine monatliche Sparrate fließt. Die feste Regel lautet: <strong>Immer erst der Sicherheitsbucket voll, danach füllen sich prozentual auch die anderen Buckets.</strong>
          </p>
        </div>

        <button
          type="button"
          id="goto-sparrate-allokation-btn"
          onClick={onContinueToSparrate}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#B8873B] hover:bg-[#A37530] active:scale-[0.99] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Weiter zur Sparraten-Allokation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
