import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Lock,
  Building,
  AlertTriangle,
  Coins,
  Layers,
  HelpCircle,
  Search,
  Plus,
  X,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { IstBestand, IstBestandDetails, UploadedReport } from "../types";
import { parseStatementFile } from "../utils/documentParser";
import { formatEuro } from "../constants/rules";
import { searchSecurities, POPULAR_SECURITIES, SecurityQuote } from "../data/isinDatabase";

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

  // Helper to remove leading zeros and non-digits cleanly
  const handleCleanNumberInput = (raw: string, setter: (val: string) => void) => {
    if (raw === "") {
      setter("");
      return;
    }
    const digits = raw.replace(/\D/g, "");
    const cleaned = digits.replace(/^0+(?=\d)/, "");
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
  const [riesterKlassisch, setRiesterKlassisch] = useState<string>(
    initDet?.riesterKlassisch ? initDet.riesterKlassisch.toString() : ""
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

  // State für direkte 3-Töpfe-Eingabe (manuell)
  const [manSicherheit, setManSicherheit] = useState<string>(
    initialValues.sicherheit > 0 ? initialValues.sicherheit.toString() : ""
  );
  const [manWachstum, setManWachstum] = useState<string>(
    initialValues.wachstum > 0 ? initialValues.wachstum.toString() : ""
  );
  const [manSpielgeld, setManSpielgeld] = useState<string>(
    initialValues.spielgeld > 0 ? initialValues.spielgeld.toString() : ""
  );
  const [manImmobilien, setManImmobilien] = useState<string>(
    initialValues.immobilien ? initialValues.immobilien.toString() : ""
  );

  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadReport, setUploadReport] = useState<UploadedReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ISIN & Wertpapier-Schnellrechner (gemäß Briefing Abschnitt 3, Punkt 7)
  const [isinQuery, setIsinQuery] = useState("");
  const [selectedSecurity, setSelectedSecurity] = useState<SecurityQuote | null>(null);
  const [securityShares, setSecurityShares] = useState<string>("");
  const [showIsinSearch, setShowIsinSearch] = useState(false);

  // Berechnungen für Bausteine-Mapping (gemäß Abschnitt 6a)
  const numTagesgeld = parseInt(tagesgeldGiro, 10) || 0;
  const numFestgeld = parseInt(festgeldBauspar, 10) || 0;
  const numRiester = parseInt(riesterKlassisch, 10) || 0;
  const numWeltEtf = parseInt(weltEtf, 10) || 0;
  const numEinzelaktien = parseInt(einzelaktien, 10) || 0;
  const numGold = parseInt(goldRohstoffe, 10) || 0;
  const numKrypto = parseInt(kryptoTrends, 10) || 0;
  const numImmo = parseInt(immobilieEigenkapital, 10) || 0;

  // Automatisches Mapping:
  // - Topf 1 (Sicherheit): Tagesgeld + Festgeld/Bausparer + 70% Riester (Garantieteil)
  // - Topf 2 (Wachstum): Welt-ETFs + Einzelaktien + Gold/Rohstoffe + 30% Riester (Fondsanteil)
  // - Topf 3 (Spaßgeld): Krypto & Trend-Investments
  // - Immobilie: Getrennt als Sachwert-Net-Worth ausgewiesen
  const mappedSicherheit = Math.round(numTagesgeld + numFestgeld + numRiester * 0.7);
  const mappedWachstum = Math.round(numWeltEtf + numEinzelaktien + numGold + numRiester * 0.3);
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
      const details: IstBestandDetails = {
        tagesgeldGiro: numTagesgeld,
        festgeldBauspar: numFestgeld,
        riesterKlassisch: numRiester,
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
        details,
      });
      return;
    }

    if (activeTab === "manuell") {
      const s = parseInt(manSicherheit, 10) || 0;
      const w = parseInt(manWachstum, 10) || 0;
      const sp = parseInt(manSpielgeld, 10) || 0;
      const imm = parseInt(manImmobilien, 10) || 0;

      onSubmit({
        sicherheit: s,
        wachstum: w,
        spielgeld: sp,
        immobilien: imm > 0 ? imm : undefined,
      });
      return;
    }

    if (activeTab === "upload" && uploadReport) {
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

      setManSicherheit(report.totals.sicherheit.toString());
      setManWachstum(report.totals.wachstum.toString());
      setManSpielgeld(report.totals.spielgeld.toString());
      setWeltEtf(report.totals.wachstum.toString());
      setTagesgeldGiro(report.totals.sicherheit.toString());
      setKryptoTrends(report.totals.spielgeld.toString());
    } catch (err) {
      console.error("Fehler beim Auslesen der Datei:", err);
    } finally {
      setIsProcessing(false);
    }
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
              // Synchronize calculated sums into manual inputs
              if (mappedSicherheit > 0 && !manSicherheit) setManSicherheit(mappedSicherheit.toString());
              if (mappedWachstum > 0 && !manWachstum) setManWachstum(mappedWachstum.toString());
              if (mappedSpielgeld > 0 && !manSpielgeld) setManSpielgeld(mappedSpielgeld.toString());
              if (mappedImmobilien > 0 && !manImmobilien) setManImmobilien(mappedImmobilien.toString());
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
                      onChange={(e) => handleCleanNumberInput(e.target.value, setTagesgeldGiro)}
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
                      onChange={(e) => handleCleanNumberInput(e.target.value, setFestgeldBauspar)}
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
                      onChange={(e) => handleCleanNumberInput(e.target.value, setWeltEtf)}
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
                      onChange={(e) => handleCleanNumberInput(e.target.value, setEinzelaktien)}
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
                      onChange={(e) => handleCleanNumberInput(e.target.value, setGoldRohstoffe)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">Dalio-Krisenpuffer</span>
                </div>
              </div>
            </div>

            {/* 3. Altersvorsorge-Verträge (Riester & Lebensversicherungen) */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#B8873B]" />
                  <span>Riester-Rente & klassische Rentenversicherung</span>
                </label>
                {onOpenGlossary && (
                  <button
                    type="button"
                    onClick={() => onOpenGlossary("Altersvorsorgedepot")}
                    className="text-[11px] text-[#B8873B] underline cursor-pointer"
                  >
                    Reform 2026?
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#3E2340]/60 leading-relaxed">
                Wird automatisch gesplittet: 70 % Garantieanteil fließen in Topf 1 (Sicherheit), 30 % Fondsanteil in Topf 2 (Wachstum).
              </p>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={riesterKlassisch}
                  onChange={(e) => handleCleanNumberInput(e.target.value, setRiesterKlassisch)}
                  className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                />
                <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
              </div>
            </div>

            {/* 4. Träume (Topf 3) & Eigenheim (Sachwert) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Topf 3: Träume */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B8873B]" />
                  <span>Topf 3: Träume (Wünsche, Krypto & Herzensprojekte)</span>
                </label>
                <p className="text-[10px] text-[#3E2340]/60">Herzenswünsche, freie Freude, Krypto, Kunst</p>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={kryptoTrends}
                    onChange={(e) => handleCleanNumberInput(e.target.value, setKryptoTrends)}
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
                    onChange={(e) => handleCleanNumberInput(e.target.value, setImmobilieEigenkapital)}
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
                  <span className="text-[10px] text-[#3E2340]/60 block font-semibold">1. Sicherheit</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedSicherheit)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedSicherheit / totalLiquide) * 100) : 0} %
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340]/60 block font-semibold">2. Wachstum</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedWachstum)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedWachstum / totalLiquide) * 100) : 0} %
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340]/60 block font-semibold">3. Träume</span>
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Topf 1: Sicherheit */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ist-sicherheit"
                  className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5"
                >
                  <BuddhaIcon className="w-4 h-4 text-[#B8873B]" />
                  <span>Topf 1: Sicherheit (Fundament)</span>
                </label>
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
              <p className="text-[11px] text-[#3E2340]/60">
                Tagesgeld, Notgroschen, Festgeld, Geldmarkt, Instandhaltungsrücklage
              </p>
              <div className="relative flex items-center">
                <input
                  id="ist-sicherheit"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={manSicherheit}
                  onChange={(e) => handleCleanNumberInput(e.target.value, setManSicherheit)}
                  className="w-full min-h-[46px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  €
                </span>
              </div>
            </div>

            {/* Topf 2: Wachstum */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ist-wachstum"
                  className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4 text-[#3E2340]" />
                  <span>Topf 2: Wachstum (Langfristig)</span>
                </label>
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
              <p className="text-[11px] text-[#3E2340]/60">
                Welt-Aktien, ETFs, Fonds, Goldanteile, offene Immobilienfonds
              </p>
              <div className="relative flex items-center">
                <input
                  id="ist-wachstum"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={manWachstum}
                  onChange={(e) => handleCleanNumberInput(e.target.value, setManWachstum)}
                  className="w-full min-h-[46px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  €
                </span>
              </div>
            </div>

            {/* IMMOBILIEN-FELD (Eigenkapital) */}
            <div className="p-3.5 rounded-2xl bg-[#F7F4F0] border border-[#B8873B]/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ist-immobilien"
                  className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5"
                >
                  <Building className="w-4 h-4 text-[#B8873B]" />
                  <span>Immobilien: Eigenkapital & getilgte Anteile</span>
                </label>
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
              <p className="text-[11px] text-[#3E2340]/60">
                Getrennt erfasster Sachwert zur Abrundung deines Gesamtvermögens.
              </p>
              <div className="relative flex items-center">
                <input
                  id="ist-immobilien"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={manImmobilien}
                  onChange={(e) => handleCleanNumberInput(e.target.value, setManImmobilien)}
                  className="w-full min-h-[46px] pl-3.5 pr-8 rounded-xl bg-white border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  €
                </span>
              </div>
            </div>

            {/* Topf 3: Träume */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ist-spielgeld"
                  className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#B8873B]" />
                  <span>Topf 3: Träume (Wünsche & freie Wahl)</span>
                </label>
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
              <p className="text-[11px] text-[#3E2340]/60">
                Frei für deine Herzenswünsche: Reisen, Krypto, Einzelaktien, Experimente
              </p>
              <div className="relative flex items-center">
                <input
                  id="ist-spielgeld"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={manSpielgeld}
                  onChange={(e) => handleCleanNumberInput(e.target.value, setManSpielgeld)}
                  className="w-full min-h-[46px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  €
                </span>
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
                accept=".csv,.txt,.json,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center mb-2">
                <Upload className="w-6 h-6 text-[#B8873B]" />
              </div>
              <p className="text-sm font-semibold text-[#3E2340]">
                {isProcessing
                  ? "Analysiere Datei lokal im Browser..."
                  : "Depotauszug hierher ziehen oder antippen"}
              </p>
              <p className="text-[11px] text-[#3E2340]/60 mt-1">
                Unterstützt CSV, TXT, JSON oder Auszüge aller gängigen Broker (Trade Republic, Scalable, ING, Comdirect etc.)
              </p>
            </div>

            {/* Uploaded Results Preview */}
            {uploadReport && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E2340]">
                    <FileText className="w-4 h-4 text-[#B8873B]" />
                    <span className="truncate max-w-[170px]">{uploadReport.fileName}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Lokal erkannt
                  </span>
                </div>

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

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full min-h-[48px] rounded-xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Diese Auswertung übernehmen</span>
                  <ArrowRight className="w-4 h-4 text-[#B8873B]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
