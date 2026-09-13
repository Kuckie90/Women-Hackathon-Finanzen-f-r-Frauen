import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  Building,
  AlertTriangle,
  Coins,
  Layers,
  HelpCircle,
  Search,
  Plus,
  X,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { IstBestand, IstBestandDetails, VorsorgeVertraege, UploadedReport, ParsedPosition } from "../types";
import { parseStatementFile, parseFinancialNumber } from "../utils/documentParser";
import { formatEuro } from "../constants/rules";
import { searchSecurities, POPULAR_SECURITIES, SecurityQuote } from "../data/isinDatabase";
import { VerificationStation } from "./VerificationStation";

interface IstBestandScreenProps {
  initialValues: IstBestand;
  isExplainMode: boolean;
  onSubmit: (values: IstBestand) => void;
  onSkip: () => void;
  onOpenGlossary?: (termKey: string) => void;
}

export function IstBestandScreen({
  initialValues,
  isExplainMode,
  onSubmit,
  onSkip,
  onOpenGlossary,
}: IstBestandScreenProps) {
  // Tabs: "bausteine" (Detaillierte Anlageformen nach Mapping-Tabelle 6a), "manuell" (3 Töpfe direkt), "upload" (Depotauszug)
  const [activeTab, setActiveTab] = useState<"bausteine" | "manuell" | "upload">("bausteine");

  // Helper for additive evaluation: "1200 + 3500" -> 4700, handles German & intl notation
  const parseAdditiveValue = (raw: string): number => {
    if (!raw) return 0;
    const parts = raw.split("+");
    let total = 0;
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const num = parseFinancialNumber(trimmed);
      if (num !== null && !isNaN(num)) {
        total += num;
      }
    }
    return Math.round(total);
  };

  const sumEntries = (entries: string[]): number => {
    return entries.reduce((acc, it) => acc + parseAdditiveValue(it), 0);
  };

  // Helper to sanitize additive inputs (digits, +, ., ,, and spaces)
  const handleAdditiveInput = (raw: string, setter: (val: string) => void) => {
    const cleaned = raw.replace(/[^\d+.,\s]/g, "");
    setter(cleaned);
  };

  // State für detaillierte Bausteine
  const initDet = initialValues.details;
  const [tagesgeldGiro, setTagesgeldGiro] = useState<string>(
    initDet?.tagesgeldGiro ? initDet.tagesgeldGiro.toString() : initialValues.sicherheit > 0 ? initialValues.sicherheit.toString() : ""
  );
  const [festgeldBauspar, setFestgeldBauspar] = useState<string>(
    initDet?.festgeldBauspar ? initDet.festgeldBauspar.toString() : ""
  );
  // Optionale Vorsorge- & Rentenverträge (Riester, Rürup, Private Rentenversicherung, Lebensversicherung)
  const initVorsorge = initialValues.vorsorge;
  const [riesterGuthaben, setRiesterGuthaben] = useState<string>(
    initVorsorge?.riesterGuthaben ? initVorsorge.riesterGuthaben.toString() : initDet?.riesterKlassisch ? initDet.riesterKlassisch.toString() : ""
  );
  const [ruerupGuthaben, setRuerupGuthaben] = useState<string>(
    initVorsorge?.ruerupGuthaben ? initVorsorge.ruerupGuthaben.toString() : ""
  );
  const [privateRenteGuthaben, setPrivateRenteGuthaben] = useState<string>(
    initVorsorge?.privateRenteGuthaben ? initVorsorge.privateRenteGuthaben.toString() : ""
  );
  const [lebensversicherung, setLebensversicherung] = useState<string>(
    initVorsorge?.lebensversicherung ? initVorsorge.lebensversicherung.toString() : ""
  );
  const [showVorsorgeKasten, setShowVorsorgeKasten] = useState<boolean>(
    Boolean(
      initVorsorge?.riesterGuthaben ||
      initVorsorge?.ruerupGuthaben ||
      initVorsorge?.privateRenteGuthaben ||
      initVorsorge?.lebensversicherung ||
      initDet?.riesterKlassisch
    )
  );

  const [weltEtf, setWeltEtf] = useState<string>(
    initDet?.weltEtf ? initDet.weltEtf.toString() : initialValues.wachstum > 0 ? initialValues.wachstum.toString() : ""
  );
  const [einzelaktien, setEinzelaktien] = useState<string>(
    initDet?.einzelaktien ? initDet.einzelaktien.toString() : ""
  );
  const [goldRohstoffe, setGoldRohstoffe] = useState<string>(
    initDet?.goldRohstoffe ? initDet.goldRohstoffe.toString() : ""
  );
  const [kryptoTrends, setKryptoTrends] = useState<string>(
    initDet?.kryptoTrends ? initDet.kryptoTrends.toString() : initialValues.spielgeld > 0 ? initialValues.spielgeld.toString() : ""
  );
  const [immobilieEigenkapital, setImmobilieEigenkapital] = useState<string>(
    initDet?.immobilieEigenkapital ? initDet.immobilieEigenkapital.toString() : initialValues.immobilien ? initialValues.immobilien.toString() : ""
  );

  // State für direkte 3-Töpfe-Eingabe (manuell) - unterstützt mehrere addierbare Positionen pro Topf!
  const [sicherheitEntries, setSicherheitEntries] = useState<string[]>([
    initialValues.sicherheit > 0 ? initialValues.sicherheit.toString() : ""
  ]);
  const [wachstumEntries, setWachstumEntries] = useState<string[]>([
    initialValues.wachstum > 0 ? initialValues.wachstum.toString() : ""
  ]);
  const [spielgeldEntries, setSpielgeldEntries] = useState<string[]>([
    initialValues.spielgeld > 0 ? initialValues.spielgeld.toString() : ""
  ]);
  const [immobilienEntries, setImmobilienEntries] = useState<string[]>([
    initialValues.immobilien ? initialValues.immobilien.toString() : ""
  ]);

  const updatePotEntry = (
    pot: "sicherheit" | "wachstum" | "spielgeld" | "immobilien",
    index: number,
    value: string
  ) => {
    const sanitized = value.replace(/[^\d+.,\s]/g, "");
    if (pot === "sicherheit") {
      const next = [...sicherheitEntries];
      next[index] = sanitized;
      setSicherheitEntries(next);
    } else if (pot === "wachstum") {
      const next = [...wachstumEntries];
      next[index] = sanitized;
      setWachstumEntries(next);
    } else if (pot === "spielgeld") {
      const next = [...spielgeldEntries];
      next[index] = sanitized;
      setSpielgeldEntries(next);
    } else if (pot === "immobilien") {
      const next = [...immobilienEntries];
      next[index] = sanitized;
      setImmobilienEntries(next);
    }
  };

  const addPotEntry = (pot: "sicherheit" | "wachstum" | "spielgeld" | "immobilien") => {
    if (pot === "sicherheit") setSicherheitEntries([...sicherheitEntries, ""]);
    else if (pot === "wachstum") setWachstumEntries([...wachstumEntries, ""]);
    else if (pot === "spielgeld") setSpielgeldEntries([...spielgeldEntries, ""]);
    else if (pot === "immobilien") setImmobilienEntries([...immobilienEntries, ""]);
  };

  const removePotEntry = (
    pot: "sicherheit" | "wachstum" | "spielgeld" | "immobilien",
    index: number
  ) => {
    if (pot === "sicherheit" && sicherheitEntries.length > 1) {
      setSicherheitEntries(sicherheitEntries.filter((_, i) => i !== index));
    } else if (pot === "wachstum" && wachstumEntries.length > 1) {
      setWachstumEntries(wachstumEntries.filter((_, i) => i !== index));
    } else if (pot === "spielgeld" && spielgeldEntries.length > 1) {
      setSpielgeldEntries(spielgeldEntries.filter((_, i) => i !== index));
    } else if (pot === "immobilien" && immobilienEntries.length > 1) {
      setImmobilienEntries(immobilienEntries.filter((_, i) => i !== index));
    }
  };

  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadReport, setUploadReport] = useState<UploadedReport | null>(null);
  const [showVerificationStation, setShowVerificationStation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ISIN & Wertpapier-Schnellrechner (gemäß Briefing Abschnitt 3, Punkt 7)
  const [isinQuery, setIsinQuery] = useState("");
  const [selectedSecurity, setSelectedSecurity] = useState<SecurityQuote | null>(null);
  const [securityShares, setSecurityShares] = useState<string>("");
  const [showIsinSearch, setShowIsinSearch] = useState(false);

  // Berechnungen für Bausteine-Mapping (mit additiver Auswertung)
  const numTagesgeld = parseAdditiveValue(tagesgeldGiro);
  const numFestgeld = parseAdditiveValue(festgeldBauspar);
  const numRiester = parseAdditiveValue(riesterGuthaben);
  const numRuerup = parseAdditiveValue(ruerupGuthaben);
  const numPrivateRente = parseAdditiveValue(privateRenteGuthaben);
  const numLebensversicherung = parseAdditiveValue(lebensversicherung);
  const totalVorsorge = numRiester + numRuerup + numPrivateRente + numLebensversicherung;

  const numWeltEtf = parseAdditiveValue(weltEtf);
  const numEinzelaktien = parseAdditiveValue(einzelaktien);
  const numGold = parseAdditiveValue(goldRohstoffe);
  const numKrypto = parseAdditiveValue(kryptoTrends);
  const numImmo = parseAdditiveValue(immobilieEigenkapital);

  // Automatisches Mapping:
  // - Topf 1 (Sicherheit): Tagesgeld + Festgeld/Bausparer + 70% Riester/Klassik-Garantie + 80% Lebensversicherung + 40% Rürup/Privatrente
  // - Topf 2 (Wachstum): Welt-ETFs + Einzelaktien + Gold/Rohstoffe + 30% Riester + 20% Lebensversicherung + 60% Rürup/Privatrente
  // - Topf 3 (Spaßgeld): Krypto & Trend-Investments
  // - Immobilie: Getrennt als Sachwert-Net-Worth ausgewiesen
  const mappedSicherheit = Math.round(
    numTagesgeld + numFestgeld + numRiester * 0.7 + numLebensversicherung * 0.8 + (numRuerup + numPrivateRente) * 0.4
  );
  const mappedWachstum = Math.round(
    numWeltEtf + numEinzelaktien + numGold + numRiester * 0.3 + numLebensversicherung * 0.2 + (numRuerup + numPrivateRente) * 0.6
  );
  const mappedSpielgeld = Math.round(numKrypto);
  const mappedImmobilien = numImmo;

  const totalLiquide = mappedSicherheit + mappedWachstum + mappedSpielgeld;
  const totalMitImmo = totalLiquide + mappedImmobilien;

  // Dalio & Klumpenrisiko-Analyse
  const totalWachstumAssets = numWeltEtf + numEinzelaktien + numGold;
  const einzelaktienAnteil = totalWachstumAssets > 0 ? Math.round((numEinzelaktien / totalWachstumAssets) * 100) : 0;
  const hasKlumpenrisiko = numEinzelaktien > 0 && einzelaktienAnteil > 20;
  const hasDalioKrisenpuffer = numGold > 0;

  // Form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (activeTab === "bausteine") {
      const vorsorgeObj: VorsorgeVertraege = {
        riesterGuthaben: numRiester,
        ruerupGuthaben: numRuerup,
        privateRenteGuthaben: numPrivateRente,
        lebensversicherung: numLebensversicherung,
      };

      const details: IstBestandDetails = {
        tagesgeldGiro: numTagesgeld,
        festgeldBauspar: numFestgeld,
        riesterKlassisch: numRiester,
        vorsorge: totalVorsorge > 0 ? vorsorgeObj : undefined,
        weltEtf: numWeltEtf,
        einzelaktien: numEinzelaktien,
        goldRohstoffe: numGold,
        kryptoTrends: numKrypto,
        immobilieEigenkapital: numImmo,
      };

      onSubmit({
        sicherheit: mappedSicherheit,
        wachstum: mappedWachstum,
        spielgeld: mappedSpielgeld,
        immobilien: mappedImmobilien > 0 ? mappedImmobilien : undefined,
        vorsorge: totalVorsorge > 0 ? vorsorgeObj : undefined,
        details,
      });
      return;
    }

    if (activeTab === "manuell") {
      const s = sumEntries(sicherheitEntries);
      const w = sumEntries(wachstumEntries);
      const sp = sumEntries(spielgeldEntries);
      const imm = sumEntries(immobilienEntries);

      onSubmit({
        sicherheit: s,
        wachstum: w,
        spielgeld: sp,
        immobilien: imm > 0 ? imm : undefined,
      });
      return;
    }

    if (activeTab === "upload" && uploadReport && !uploadReport.error && uploadReport.positions.length > 0) {
      onSubmit({
        sicherheit: uploadReport.totals.sicherheit,
        wachstum: uploadReport.totals.wachstum,
        spielgeld: uploadReport.totals.spielgeld,
      });
    }
  };

  // Process uploaded document locally
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const report = await parseStatementFile(file);
      setUploadReport(report);

      if (!report.error && report.positions.length > 0) {
        setShowVerificationStation(true);
      } else {
        setShowVerificationStation(false);
      }
    } catch (err) {
      console.error("Fehler beim Auslesen der Datei:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Bestätigung der Daten aus der Prüfstation
  const handleConfirmVerifiedPositions = (verifiedPositions: ParsedPosition[]) => {
    const sPositions = verifiedPositions.filter((p) => p.category === "sicherheit");
    const wPositions = verifiedPositions.filter((p) => p.category === "wachstum");
    const spPositions = verifiedPositions.filter((p) => p.category === "spielgeld");
    const immoPositions = verifiedPositions.filter((p) => p.category === "immobilien");

    const sEntries = sPositions.map((p) => p.amount.toString()).filter((s) => s && s !== "0");
    const wEntries = wPositions.map((p) => p.amount.toString()).filter((s) => s && s !== "0");
    const spEntries = spPositions.map((p) => p.amount.toString()).filter((s) => s && s !== "0");
    const immoEntries = immoPositions.map((p) => p.amount.toString()).filter((s) => s && s !== "0");

    setSicherheitEntries(sEntries.length > 0 ? sEntries : [""]);
    setWachstumEntries(wEntries.length > 0 ? wEntries : [""]);
    setSpielgeldEntries(spEntries.length > 0 ? spEntries : [""]);
    if (immoEntries.length > 0) {
      setImmobilienEntries(immoEntries);
    }

    const sTotal = sPositions.reduce((acc, p) => acc + (p.amount || 0), 0);
    const wTotal = wPositions.reduce((acc, p) => acc + (p.amount || 0), 0);
    const spTotal = spPositions.reduce((acc, p) => acc + (p.amount || 0), 0);
    const immoTotal = immoPositions.reduce((acc, p) => acc + (p.amount || 0), 0);

    setTagesgeldGiro(sTotal.toString());
    setWeltEtf(wTotal.toString());
    setKryptoTrends(spTotal.toString());

    if (uploadReport) {
      setUploadReport({
        ...uploadReport,
        positions: verifiedPositions,
        totals: {
          sicherheit: sTotal,
          wachstum: wTotal,
          spielgeld: spTotal,
          immobilien: immoTotal,
          gesamt: sTotal + wTotal + spTotal + immoTotal,
        },
      });
    }

    setShowVerificationStation(false);
    setActiveTab("manuell");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="ist-bestand-screen" className="flex flex-col flex-1 px-5 pt-2 pb-6">
      <div className="space-y-4 my-auto py-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#B8873B] font-bold">
              Ist-Soll-Vergleich
            </span>
            {onOpenGlossary && (
              <button
                type="button"
                onClick={() => onOpenGlossary("Depot")}
                className="text-[11px] font-semibold text-[#B8873B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Warum vergleichen?</span>
              </button>
            )}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Was liegt aktuell wo?
          </h2>
          <p className="text-xs text-[#3E2340]/75">
            Trage deine bestehenden Vermögensbausteine ein. Die App sortiert sie automatisch in die 3 Töpfe und prüft dein Klumpenrisiko.
          </p>
        </div>

        {/* Tab Switcher: Bausteine vs. Töpfe direkt vs. Upload */}
        <div className="grid grid-cols-3 p-1 bg-[#EFECE6] rounded-xl border border-[#E5DFD7] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("bausteine")}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "bausteine"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">Anlageformen</span>
          </button>
          <button
            type="button"
            onClick={() => {
              // Synchronize calculated sums into manual inputs if manual inputs are empty
              if (mappedSicherheit > 0 && sumEntries(sicherheitEntries) === 0) setSicherheitEntries([mappedSicherheit.toString()]);
              if (mappedWachstum > 0 && sumEntries(wachstumEntries) === 0) setWachstumEntries([mappedWachstum.toString()]);
              if (mappedSpielgeld > 0 && sumEntries(spielgeldEntries) === 0) setSpielgeldEntries([mappedSpielgeld.toString()]);
              if (mappedImmobilien > 0 && sumEntries(immobilienEntries) === 0) setImmobilienEntries([mappedImmobilien.toString()]);
              setActiveTab("manuell");
            }}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "manuell"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <span>Töpfe direkt</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="truncate">Depotauszug</span>
          </button>
        </div>

        {/* ===================== TAB 1: ANLAGEFORMEN (MAPPING-TABELLE) ===================== */}
        {activeTab === "bausteine" && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Sicherheit Bausteine */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <BuddhaIcon className="w-4 h-4 text-[#B8873B]" />
                  <span>Sicherheits-Bausteine (Topf 1)</span>
                </label>
                <span className="text-[10px] text-[#3E2340]/60">Kapitalerhalt & Puffer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Tagesgeld, Giro & Notgroschen
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={tagesgeldGiro}
                      onChange={(e) => handleAdditiveInput(e.target.value, setTagesgeldGiro)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Festgeld, Bausparer & Geldmarkt
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={festgeldBauspar}
                      onChange={(e) => handleAdditiveInput(e.target.value, setFestgeldBauspar)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Wachstums-Bausteine (Dalio-Diversifikation & Welt-ETFs) */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#3E2340]" />
                  <span>Wachstums-Bausteine (Topf 2)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowIsinSearch(!showIsinSearch)}
                  className="text-[11px] font-semibold text-[#B8873B] hover:text-[#3E2340] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showIsinSearch ? "ISIN-Suche schließen" : "ISIN / WKN Schnellsuche"}</span>
                </button>
              </div>

              {/* ISIN / Ticker Schnellrechner & Wertpapier-Suche */}
              {showIsinSearch && (
                <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#B8873B]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#3E2340] flex items-center gap-1">
                      <Search className="w-3.5 h-3.5 text-[#B8873B]" />
                      Wertpapier nach ISIN, WKN oder Name suchen
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowIsinSearch(false)}
                      className="text-[#3E2340]/50 hover:text-[#3E2340] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="z. B. IE00B4L5Y983, MSCI World, SAP, Apple..."
                      value={isinQuery}
                      onChange={(e) => setIsinQuery(e.target.value)}
                      className="w-full min-h-[38px] pl-8 pr-3 text-xs rounded-lg bg-white border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] outline-hidden"
                    />
                    <Search className="w-4 h-4 text-[#3E2340]/40 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Gefundene Wertpapiere */}
                  {isinQuery.trim().length >= 2 && (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1">
                      {searchSecurities(isinQuery).length === 0 ? (
                        <p className="text-[11px] text-[#3E2340]/60 p-2">
                          Kein passendes Wertpapier im Richtkurs-Katalog gefunden. Trage den Betrag einfach direkt unten in das Euro-Feld ein.
                        </p>
                      ) : (
                        searchSecurities(isinQuery).map((sec) => (
                          <div
                            key={sec.isin}
                            className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                              selectedSecurity?.isin === sec.isin
                                ? "bg-[#3E2340]/10 border-[#3E2340]"
                                : "bg-white border-[#E5DFD7] hover:border-[#B8873B]"
                            }`}
                          >
                            <div className="space-y-0.5 max-w-[70%]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-[11px] text-[#3E2340]">{sec.name}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded-sm bg-[#EFECE6] font-mono text-[#3E2340]/80">
                                  {sec.isin}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#3E2340]/60 line-clamp-1">{sec.description}</p>
                              <div className="text-[10px] text-[#B8873B] font-semibold">
                                Kurs: {sec.priceEuro.toFixed(2)} € <span className="text-[#3E2340]/40 font-normal">({sec.lastUpdated})</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSecurity(sec);
                                setSecurityShares("10");
                              }}
                              className="px-2 py-1 rounded-md bg-[#3E2340] text-white text-[11px] font-semibold hover:bg-[#3E2340]/90 cursor-pointer"
                            >
                              Auswählen
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Ausgewähltes Wertpapier & Stückzahl-Rechner */}
                  {selectedSecurity && (
                    <div className="p-2.5 rounded-lg bg-white border border-[#B8873B] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#3E2340]">{selectedSecurity.name}</span>
                        <span className="font-mono text-[11px] text-[#B8873B] font-bold">
                          {selectedSecurity.priceEuro.toFixed(2)} € / Stück
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div className="space-y-0.5">
                          <label className="text-[10px] text-[#3E2340]/70 font-semibold block">
                            Stückzahl im Depot:
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="z.B. 25"
                            value={securityShares}
                            onChange={(e) => setSecurityShares(e.target.value)}
                            className="w-full min-h-[34px] px-2.5 text-xs rounded-md bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] outline-hidden font-mono"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[#3E2340]/70 font-semibold block">
                            Errechneter Marktwert:
                          </span>
                          <div className="text-sm font-bold text-[#3E2340] pt-1">
                            {formatEuro(Math.round((parseFloat(securityShares) || 0) * selectedSecurity.priceEuro))}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = Math.round((parseFloat(securityShares) || 0) * selectedSecurity.priceEuro);
                          if (val > 0) {
                            if (selectedSecurity.category === "welt_etf") {
                              const currentVal = parseInt(weltEtf, 10) || 0;
                              setWeltEtf((currentVal + val).toString());
                            } else if (selectedSecurity.category === "einzelaktie") {
                              const currentVal = parseInt(einzelaktien, 10) || 0;
                              setEinzelaktien((currentVal + val).toString());
                            } else if (selectedSecurity.category === "gold_rohstoff") {
                              const currentVal = parseInt(goldRohstoffe, 10) || 0;
                              setGoldRohstoffe((currentVal + val).toString());
                            } else if (selectedSecurity.category === "krypto") {
                              const currentVal = parseInt(kryptoTrends, 10) || 0;
                              setKryptoTrends((currentVal + val).toString());
                            }
                            setSelectedSecurity(null);
                            setSecurityShares("");
                            setIsinQuery("");
                          }
                        }}
                        className="w-full py-1.5 rounded-lg bg-[#B8873B] text-white text-xs font-bold hover:bg-[#8A5E1E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Betrag ({formatEuro(Math.round((parseFloat(securityShares) || 0) * selectedSecurity.priceEuro))}) zu Topf hinzufügen</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Welt-Aktien-ETFs
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={weltEtf}
                      onChange={(e) => handleAdditiveInput(e.target.value, setWeltEtf)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">MSCI World, All-World</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Einzelaktien
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={einzelaktien}
                      onChange={(e) => handleAdditiveInput(e.target.value, setEinzelaktien)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">Für Klumpenrisiko-Check</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Gold & Rohstoffe
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={goldRohstoffe}
                      onChange={(e) => handleAdditiveInput(e.target.value, setGoldRohstoffe)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">Dalio-Krisenpuffer</span>
                </div>
              </div>
            </div>

            {/* 3. OPTIONALER KASTEN: Bestehende Vorsorge- & Rentenverträge */}
            <div className="p-3.5 md:p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#B8873B]" />
                  <span className="font-semibold text-xs text-[#3E2340]">
                    Bestehende Vorsorge- & Rentenverträge
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] font-semibold text-[#B8873B]">
                    Optional
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVorsorgeKasten(!showVorsorgeKasten)}
                  className="text-[11px] font-semibold text-[#B8873B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showVorsorgeKasten ? "Ausblenden" : "Einblenden / Bearbeiten"}</span>
                  {showVorsorgeKasten ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Erläuterung & Wichtig-Box zum einzutragenden Betrag */}
              <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#B8873B]/30 space-y-1.5 text-xs">
                <div className="flex items-start gap-2 text-[#3E2340]">
                  <Info className="w-4 h-4 text-[#B8873B] shrink-0 mt-0.5" />
                  <div className="space-y-1 leading-relaxed">
                    <strong className="block font-bold text-[#3E2340]">
                      Welcher Betrag soll hier eingetragen werden?
                    </strong>
                    <p className="text-[11px] text-[#3E2340]/80">
                      Trage hier das <strong>aktuelle Vertragskapital bzw. den aktuellen Rückkaufswert</strong> laut deiner letzten jährlichen Standmitteilung ein (das Vermögen, das heute im Vertrag liegt). Bitte <strong>nicht deinen monatlichen Sparbeitrag</strong> eintragen!
                    </p>
                    <p className="text-[10px] text-[#3E2340]/60 italic">
                      Dieser Kasten ist komplett optional: Wenn du nur deine liquiden Depots und Konten analysieren möchtest, lass diese Felder einfach leer (0 €).
                    </p>
                  </div>
                </div>
              </div>

              {/* Eingabefelder (wenn ausgeklappt) */}
              {showVorsorgeKasten && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Riester-Rente */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-[#3E2340]/90 block">
                          Riester-Rente
                        </label>
                        {onOpenGlossary && (
                          <button
                            type="button"
                            onClick={() => onOpenGlossary("Altersvorsorgedepot")}
                            className="text-[10px] text-[#B8873B] hover:underline cursor-pointer"
                          >
                            Reform 2026?
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={riesterGuthaben}
                          onChange={(e) => handleAdditiveInput(e.target.value, setRiesterGuthaben)}
                          className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                        />
                        <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                      </div>
                      <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
                        Aktuelles Gesamtkapital laut Standmitteilung
                      </span>
                    </div>

                    {/* Rürup-Rente / Basisrente */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#3E2340]/90 block">
                        Rürup-Rente (Basisrente)
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={ruerupGuthaben}
                          onChange={(e) => handleAdditiveInput(e.target.value, setRuerupGuthaben)}
                          className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                        />
                        <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                      </div>
                      <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
                        Aktuelles Deckungskapital laut Standmitteilung
                      </span>
                    </div>

                    {/* Private Rentenversicherung */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#3E2340]/90 block">
                        Private Altersvorsorge / Rentenversicherung
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={privateRenteGuthaben}
                          onChange={(e) => handleAdditiveInput(e.target.value, setPrivateRenteGuthaben)}
                          className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                        />
                        <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                      </div>
                      <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
                        Aktuelles Guthaben / Rückkaufswert
                      </span>
                    </div>

                    {/* Kapitallebensversicherung */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#3E2340]/90 block">
                        Kapitallebensversicherung
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={lebensversicherung}
                          onChange={(e) => handleAdditiveInput(e.target.value, setLebensversicherung)}
                          className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                        />
                        <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                      </div>
                      <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
                        Aktueller Rückkaufswert
                      </span>
                    </div>
                  </div>

                  {totalVorsorge > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center justify-between text-xs text-[#2E7D32]">
                      <span className="font-semibold">Erfasstes Vorsorgevermögen gesamt:</span>
                      <span className="font-bold text-sm">{formatEuro(totalVorsorge)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Träume (Topf 3) & Eigenheim (Sachwert) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Topf 3: Träume */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B8873B]" />
                  <span>Topf 3: Träume & Chancen (Krypto, Trends & Wünsche)</span>
                </label>
                <p className="text-[10px] text-[#3E2340]/70">
                  Kann bei Gelingen für Träume genutzt werden – <strong>darf man aber nicht brauchen müssen!</strong>
                </p>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={kryptoTrends}
                    onChange={(e) => handleAdditiveInput(e.target.value, setKryptoTrends)}
                    className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                  />
                  <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                </div>
              </div>

              {/* Sachwert: Eigenheim */}
              <div className="p-3.5 rounded-2xl bg-[#F7F4F0] border border-[#B8873B]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#B8873B]" />
                    <span>Eigenheim (getilgtes Eigenkapital)</span>
                  </label>
                  {onOpenGlossary && (
                    <button
                      type="button"
                      onClick={() => onOpenGlossary("Immobilien")}
                      className="text-[10px] text-[#B8873B] underline cursor-pointer"
                    >
                      Warum separat?
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#3E2340]/60">Illiquider Sachwert (verzerrt liquide Töpfe nicht)</p>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={immobilieEigenkapital}
                    onChange={(e) => handleAdditiveInput(e.target.value, setImmobilieEigenkapital)}
                    className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-white border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                  />
                  <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                </div>
              </div>
            </div>

            {/* LIVE-MAPPING VORSCHAU DER 3 TÖPFE */}
            <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E5DFD7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3E2340] uppercase tracking-wider">
                  Automatische Topf-Zuordnung
                </span>
                <span className="text-xs font-bold text-[#3E2340]">
                  Liquides Vermögen: {formatEuro(totalLiquide)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#2E7D32] block font-bold">1. Sichere Anlagen</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedSicherheit)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedSicherheit / totalLiquide) * 100) : 0} %
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340] block font-bold">2. Wachstumsstärker</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedWachstum)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedWachstum / totalLiquide) * 100) : 0} %
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#8A5E1E] block font-bold">3. Träume & Chancen</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedSpielgeld)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedSpielgeld / totalLiquide) * 100) : 0} %
                  </span>
                </div>
              </div>

              {/* Sub-Allokation / Dalio & Klumpenrisiko-Vorschau */}
              {hasKlumpenrisiko && (
                <div className="p-2.5 rounded-xl bg-[#C44D34]/10 border border-[#C44D34]/25 text-xs text-[#C44D34] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Klumpenrisiko im Wachstumstopf:</strong> {einzelaktienAnteil} % deiner Wachstumsanlagen liegen in Einzelaktien. Finanzwissenschaftlich wird ein stabiler Kern von mind. 80–90 % in Welt-ETFs empfohlen, um Einzelrisiken auszuschließen.
                  </p>
                </div>
              )}

              {hasDalioKrisenpuffer && (
                <div className="p-2.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-xs text-[#1B5E20] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Dalio-Krisenpuffer vorhanden:</strong> Du hast {formatEuro(numGold)} in Edelmetallen/Rohstoffen. Das stabilisiert dein Portfolio nach dem Allwetter-Prinzip gegen Krisen.
                  </p>
                </div>
              )}

              {mappedImmobilien > 0 && (
                <div className="text-[11px] text-[#3E2340]/70 flex items-center justify-between pt-1 border-t border-[#E5DFD7]">
                  <span>+ Sachwert Eigenheim (separat geführt):</span>
                  <span className="font-bold">{formatEuro(mappedImmobilien)}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                id="ist-bestand-submit-btn"
                className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Ist-Bestand speichern & Auswertung zeigen</span>
                <ArrowRight className="w-5 h-5 text-[#B8873B]" />
              </button>

              {isExplainMode && (
                <button
                  type="button"
                  id="ist-bestand-skip-btn"
                  onClick={onSkip}
                  className="py-2.5 text-xs text-[#3E2340]/70 hover:text-[#3E2340] text-center font-medium underline cursor-pointer"
                >
                  Ich fange ganz neu an (Überspringen)
                </button>
              )}
            </div>
          </form>
        )}

        {/* ===================== TAB 2: TÖPFE DIREKT (MANUELL) ===================== */}
        {activeTab === "manuell" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#B8873B]/20 text-xs text-[#3E2340]/80">
              💡 <strong>Tipp:</strong> Du kannst mehrere Beträge pro Topf anlegen oder Rechnungen wie <code className="bg-white px-1.5 py-0.5 rounded border border-[#E5DFD7] text-[#B8873B] font-mono">1.200 + 3.500</code> direkt in ein Feld eingeben.
            </div>

            {/* Topf 1: Sicherheit */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <BuddhaIcon className="w-4 h-4 text-[#2E7D32]" />
                  <span>Topf 1: Sichere Anlagen (Sicherheit / Fundament)</span>
                </label>
                <div className="flex items-center gap-2">
                  {sumEntries(sicherheitEntries) > 0 && (
                    <span className="text-xs font-bold text-[#2E7D32] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {formatEuro(sumEntries(sicherheitEntries))}
                    </span>
                  )}
                  {onOpenGlossary && (
                    <button
                      type="button"
                      onClick={() => onOpenGlossary("Sicherheit")}
                      className="text-[11px] text-[#B8873B] underline cursor-pointer"
                    >
                      Was gehört hierher?
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#3E2340]/70">
                Tagesgeld, Notgroschen, Festgeld, Geldmarkt, Instandhaltungsrücklage. Kapitalerhalt & geringes Risiko.
              </p>

              <div className="space-y-2 pt-1">
                {sicherheitEntries.map((entry, idx) => (
                  <div key={`sich-${idx}`} className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                      <input
                        id={idx === 0 ? "ist-sicherheit" : undefined}
                        type="text"
                        inputMode="numeric"
                        placeholder={idx === 0 ? "z. B. 5.000 oder 1.200 + 3.500" : "Weiterer Betrag"}
                        value={entry}
                        onChange={(e) => updatePotEntry(setSicherheitEntries, idx, e.target.value)}
                        className="w-full min-h-[44px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-medium outline-hidden"
                      />
                      <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-xs">
                        €
                      </span>
                    </div>
                    {sicherheitEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePotEntry(setSicherheitEntries, idx)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#3E2340]/40 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eintrag entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addPotEntry(setSicherheitEntries)}
                  className="text-xs font-semibold text-[#B8873B] hover:text-[#8A5E1E] flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Weiteren Betrag zu Topf 1 addieren</span>
                </button>
              </div>
            </div>

            {/* Topf 2: Wachstum */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#3E2340]" />
                  <span>Topf 2: Risikoaffiner & Wachstumsstärker (Wachstum)</span>
                </label>
                <div className="flex items-center gap-2">
                  {sumEntries(wachstumEntries) > 0 && (
                    <span className="text-xs font-bold text-[#3E2340] bg-[#F7F4F0] px-2 py-0.5 rounded-md border border-[#E5DFD7]">
                      {formatEuro(sumEntries(wachstumEntries))}
                    </span>
                  )}
                  {onOpenGlossary && (
                    <button
                      type="button"
                      onClick={() => onOpenGlossary("Wachstum")}
                      className="text-[11px] text-[#B8873B] underline cursor-pointer"
                    >
                      Was gehört hierher?
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#3E2340]/70">
                Breit gestreute Welt-Aktien & Gold. Risikoaffiner, aber substanziell wachstumsstärker für den Ruhestand.
              </p>

              <div className="space-y-2 pt-1">
                {wachstumEntries.map((entry, idx) => (
                  <div key={`wachs-${idx}`} className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                      <input
                        id={idx === 0 ? "ist-wachstum" : undefined}
                        type="text"
                        inputMode="numeric"
                        placeholder={idx === 0 ? "z. B. 15.000 oder 10.000 + 5.000" : "Weiterer Betrag"}
                        value={entry}
                        onChange={(e) => updatePotEntry(setWachstumEntries, idx, e.target.value)}
                        className="w-full min-h-[44px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-medium outline-hidden"
                      />
                      <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-xs">
                        €
                      </span>
                    </div>
                    {wachstumEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePotEntry(setWachstumEntries, idx)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#3E2340]/40 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eintrag entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addPotEntry(setWachstumEntries)}
                  className="text-xs font-semibold text-[#B8873B] hover:text-[#8A5E1E] flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Weiteren Betrag zu Topf 2 addieren</span>
                </button>
              </div>
            </div>

            {/* IMMOBILIEN-FELD (Eigenkapital) */}
            <div className="p-3.5 rounded-2xl bg-[#F7F4F0] border border-[#B8873B]/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#B8873B]" />
                  <span>Immobilien: Eigenkapital & getilgte Anteile</span>
                </label>
                <div className="flex items-center gap-2">
                  {sumEntries(immobilienEntries) > 0 && (
                    <span className="text-xs font-bold text-[#B8873B] bg-white px-2 py-0.5 rounded-md border border-[#B8873B]/30">
                      {formatEuro(sumEntries(immobilienEntries))}
                    </span>
                  )}
                  {onOpenGlossary && (
                    <button
                      type="button"
                      onClick={() => onOpenGlossary("Immobilien")}
                      className="text-[11px] text-[#B8873B] underline cursor-pointer"
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#3E2340]/60">
                Getrennt erfasster Sachwert zur Abrundung deines Gesamtvermögens.
              </p>

              <div className="space-y-2 pt-1">
                {immobilienEntries.map((entry, idx) => (
                  <div key={`immo-${idx}`} className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                      <input
                        id={idx === 0 ? "ist-immobilien" : undefined}
                        type="text"
                        inputMode="numeric"
                        placeholder={idx === 0 ? "z. B. 80.000 oder 50.000 + 30.000" : "Weiterer Betrag"}
                        value={entry}
                        onChange={(e) => updatePotEntry(setImmobilienEntries, idx, e.target.value)}
                        className="w-full min-h-[44px] pl-3.5 pr-8 rounded-xl bg-white border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-medium outline-hidden"
                      />
                      <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-xs">
                        €
                      </span>
                    </div>
                    {immobilienEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePotEntry(setImmobilienEntries, idx)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#3E2340]/40 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eintrag entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addPotEntry(setImmobilienEntries)}
                  className="text-xs font-semibold text-[#B8873B] hover:text-[#8A5E1E] flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Weiteren Immobilienbetrag addieren</span>
                </button>
              </div>
            </div>

            {/* Topf 3: Träume */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B8873B]" />
                  <span>Topf 3: Träume & Chancen (Herzenswünsche & Krypto)</span>
                </label>
                <div className="flex items-center gap-2">
                  {sumEntries(spielgeldEntries) > 0 && (
                    <span className="text-xs font-bold text-[#B8873B] bg-[#F7F4F0] px-2 py-0.5 rounded-md border border-[#E5DFD7]">
                      {formatEuro(sumEntries(spielgeldEntries))}
                    </span>
                  )}
                  {onOpenGlossary && (
                    <button
                      type="button"
                      onClick={() => onOpenGlossary("Träume")}
                      className="text-[11px] text-[#B8873B] underline cursor-pointer"
                    >
                      Was gehört hierher?
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#3E2340]/70">
                Kann bei Gelingen für Träume genutzt werden – <strong>das Geld darf man aber unter keinen Umständen brauchen müssen!</strong>
              </p>

              <div className="space-y-2 pt-1">
                {spielgeldEntries.map((entry, idx) => (
                  <div key={`spiel-${idx}`} className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                      <input
                        id={idx === 0 ? "ist-spielgeld" : undefined}
                        type="text"
                        inputMode="numeric"
                        placeholder={idx === 0 ? "z. B. 2.000 oder 1.000 + 1.000" : "Weiterer Betrag"}
                        value={entry}
                        onChange={(e) => updatePotEntry(setSpielgeldEntries, idx, e.target.value)}
                        className="w-full min-h-[44px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-medium outline-hidden"
                      />
                      <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-xs">
                        €
                      </span>
                    </div>
                    {spielgeldEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePotEntry(setSpielgeldEntries, idx)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#3E2340]/40 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eintrag entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addPotEntry(setSpielgeldEntries)}
                  className="text-xs font-semibold text-[#B8873B] hover:text-[#8A5E1E] flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Weiteren Betrag zu Topf 3 addieren</span>
                </button>
              </div>
            </div>

            {/* GESAMTVORSCHAU DER EINGEGEBENEN TÖPFE */}
            <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E5DFD7] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#3E2340]">
                <span>Erfasste Summen (berechnet aus deinen Eingaben):</span>
                <span className="font-mono font-bold text-sm">
                  {formatEuro(
                    sumEntries(sicherheitEntries) +
                      sumEntries(wachstumEntries) +
                      sumEntries(spielgeldEntries) +
                      sumEntries(immobilienEntries)
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340]/60 block font-semibold">1. Sicherheit</span>
                  <span className="font-bold text-[#2E7D32]">{formatEuro(sumEntries(sicherheitEntries))}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340]/60 block font-semibold">2. Wachstum</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(sumEntries(wachstumEntries))}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340]/60 block font-semibold">3. Träume</span>
                  <span className="font-bold text-[#B8873B]">{formatEuro(sumEntries(spielgeldEntries))}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340]/60 block font-semibold">Immobilien</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(sumEntries(immobilienEntries))}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                id="ist-bestand-submit-manuell-btn"
                className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Auswertung zeigen</span>
                <ArrowRight className="w-5 h-5 text-[#B8873B]" />
              </button>

              {isExplainMode && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="py-2.5 text-xs text-[#3E2340]/70 hover:text-[#3E2340] text-center font-medium underline cursor-pointer"
                >
                  Ich fange ganz neu an (Überspringen)
                </button>
              )}
            </div>
          </form>
        )}

        {/* ===================== TAB 3: UPLOAD (DSGVO-KONFORM) ===================== */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            {/* DSGVO-Garantie-Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>100 % DSGVO-konform: Reines Edge-Processing</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-950/80">
                Deine Datei wird ausschließlich lokal im Arbeitsspeicher dieses Browsers ausgelesen. Es werden <strong>keine personenbezogenen Daten</strong> an Server, Clouds oder KIs gesendet.
              </p>
              {onOpenGlossary && (
                <button
                  type="button"
                  onClick={() => onOpenGlossary("DSGVO")}
                  className="text-[11px] text-emerald-800 font-semibold underline cursor-pointer"
                >
                  Wie ist das technisch & rechtlich sichergestellt?
                </button>
              )}
            </div>

            {/* Wenn Prüfstation aktiv ist, diese prominent anzeigen */}
            {uploadReport && showVerificationStation ? (
              <VerificationStation
                report={uploadReport}
                onConfirm={handleConfirmVerifiedPositions}
                onCancel={() => {
                  setShowVerificationStation(false);
                  setUploadReport(null);
                }}
                onOpenGlossary={onOpenGlossary}
              />
            ) : (
              <>
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#B8873B] bg-[#B8873B]/10 scale-[1.01]"
                      : "border-[#E5DFD7] bg-white hover:border-[#B8873B]/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.csv,.txt,.json,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-[#B8873B]" />
                  </div>
                  <p className="text-sm font-semibold text-[#3E2340]">
                    {isProcessing
                      ? "Lese Dokument (PDF/CSV) lokal im Browser aus..."
                      : "Depotauszug (PDF, CSV, TXT) hierher ziehen oder antippen"}
                  </p>
                  <p className="text-[11px] text-[#3E2340]/60 mt-1 max-w-md">
                    Liest Bank- und Depot-PDFs (z. B. Trade Republic, Scalable, ING, DKB) sowie CSV & TXT direkt im Browser aus – mit anschließender Prüfstation zur Bestätigung.
                  </p>
                </div>

                {/* Uploaded Results Preview falls vorhanden */}
                {uploadReport && (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E2340]">
                        <FileText className="w-4 h-4 text-[#B8873B]" />
                        <span className="truncate max-w-[170px]">{uploadReport.fileName}</span>
                      </div>
                      {uploadReport.error || uploadReport.positions.length === 0 ? (
                        <span className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Keine Positionen erkannt
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ausgelesen ({uploadReport.positions.length} Positionen)
                        </span>
                      )}
                    </div>

                    {uploadReport.error || uploadReport.positions.length === 0 ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                        <p className="leading-relaxed">
                          {uploadReport.error ||
                            "In dieser Datei konnten keine Finanzpositionen mit eindeutigen Euro-Beträgen erkannt werden. Du kannst die Beträge direkt in den Töpfen eintragen."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("manuell")}
                          className="text-xs font-bold text-[#B8873B] underline hover:text-[#8A5E1E] cursor-pointer"
                        >
                          Zu den Töpfen wechseln & Beträge eintragen →
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Summarized pots */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="p-2 rounded-xl bg-[#F7F4F0]">
                            <span className="text-[10px] text-[#3E2340]/60 block font-semibold">Sicherheit</span>
                            <span className="font-serif font-bold text-xs text-[#3E2340]">
                              {formatEuro(uploadReport.totals.sicherheit)}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#F7F4F0]">
                            <span className="text-[10px] text-[#3E2340]/60 block font-semibold">Wachstum</span>
                            <span className="font-serif font-bold text-xs text-[#3E2340]">
                              {formatEuro(uploadReport.totals.wachstum)}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#F7F4F0]">
                            <span className="text-[10px] text-[#3E2340]/60 block font-semibold">Träume</span>
                            <span className="font-serif font-bold text-xs text-[#3E2340]">
                              {formatEuro(uploadReport.totals.spielgeld)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowVerificationStation(true)}
                            className="flex-1 min-h-[44px] rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-[#B8873B] cursor-pointer"
                          >
                            <span>Prüfstation aufrufen</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab("manuell")}
                            className="flex-1 min-h-[44px] rounded-xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>In Töpfen prüfen</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#B8873B]" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
