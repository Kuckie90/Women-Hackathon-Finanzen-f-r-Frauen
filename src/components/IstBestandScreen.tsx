import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Lock,
  Building,
  RefreshCw,
  Info,
} from "lucide-react";
import { IstBestand, UploadedReport, ParsedPosition } from "../types";
import { parseStatementFile } from "../utils/documentParser";
import { formatEuro } from "../constants/rules";

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
  const [activeTab, setActiveTab] = useState<"manuell" | "upload">("manuell");

  // Form states
  const [sicherheit, setSicherheit] = useState<string>(
    initialValues.sicherheit > 0 ? initialValues.sicherheit.toString() : ""
  );
  const [wachstum, setWachstum] = useState<string>(
    initialValues.wachstum > 0 ? initialValues.wachstum.toString() : ""
  );
  const [spielgeld, setSpielgeld] = useState<string>(
    initialValues.spielgeld > 0 ? initialValues.spielgeld.toString() : ""
  );
  const [immobilien, setImmobilien] = useState<string>(
    initialValues.immobilien && initialValues.immobilien > 0
      ? initialValues.immobilien.toString()
      : ""
  );

  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadReport, setUploadReport] = useState<UploadedReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const s = Math.max(0, parseFloat(sicherheit.replace(",", ".")) || 0);
    const w = Math.max(0, parseFloat(wachstum.replace(",", ".")) || 0);
    const sp = Math.max(0, parseFloat(spielgeld.replace(",", ".")) || 0);
    const imm = Math.max(0, parseFloat(immobilien.replace(",", ".")) || 0);

    // Immobilien-Tilgung/Eigenkapital fließt in Topf 2 (Wachstum)
    const effectiveWachstum = w + imm;

    onSubmit({
      sicherheit: s,
      wachstum: effectiveWachstum,
      spielgeld: sp,
      immobilien: imm > 0 ? imm : undefined,
    });
  };

  // Process uploaded document locally
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const report = await parseStatementFile(file);
      setUploadReport(report);

      // Auto-populate manual fields with parsed sums
      setSicherheit(report.totals.sicherheit.toString());
      setWachstum(report.totals.wachstum.toString());
      setSpielgeld(report.totals.spielgeld.toString());
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

  // Re-classify a parsed position
  const handleReclassify = (posId: string, newCat: "sicherheit" | "wachstum" | "spielgeld") => {
    if (!uploadReport) return;
    const updatedPositions = uploadReport.positions.map((p) =>
      p.id === posId ? { ...p, category: newCat } : p
    );

    let s = 0;
    let w = 0;
    let sp = 0;
    updatedPositions.forEach((p) => {
      if (p.category === "sicherheit") s += p.amount;
      else if (p.category === "wachstum") w += p.amount;
      else if (p.category === "spielgeld") sp += p.amount;
    });

    setUploadReport({
      ...uploadReport,
      positions: updatedPositions,
      totals: { sicherheit: s, wachstum: w, spielgeld: sp, gesamt: s + w + sp },
    });

    setSicherheit(s.toString());
    setWachstum(w.toString());
    setSpielgeld(sp.toString());
  };

  return (
    <div id="ist-bestand-screen" className="flex flex-col flex-1 px-5 pt-2 pb-4">
      <div className="space-y-4 my-auto py-2">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Was liegt schon wo?
          </h2>
          <p className="text-xs text-[#3E2340]/75">
            Trage dein bestehendes Vermögen ein oder lade deinen Depotauszug direkt
            hoch. So siehst du die Lücke zwischen Ist und Soll.
          </p>
        </div>

        {/* Tab Switcher: Manuell vs. Auszug hochladen */}
        <div className="grid grid-cols-2 p-1 bg-[#EFECE6] rounded-xl border border-[#E5DFD7] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("manuell")}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "manuell"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <span>Töpfe manuell</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Depotauszug auslesen</span>
          </button>
        </div>

        {/* ===================== TAB 1: MANUELL ===================== */}
        {activeTab === "manuell" && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Topf 1: Sicherheit */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ist-sicherheit"
                  className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#B8873B]" />
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
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={sicherheit}
                  onChange={(e) => setSicherheit(e.target.value)}
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
                  <TrendingUp className="w-4 h-4 text-[#B8873B]" />
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
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={wachstum}
                  onChange={(e) => setWachstum(e.target.value)}
                  className="w-full min-h-[46px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  €
                </span>
              </div>
            </div>

            {/* IMMOBILIEN-FELD (Fließt ins Wachstum) */}
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
                    Details & Zuordnung
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#3E2340]/60">
                Fließt automatisch als langfristiger Sachwert in Topf 2 (Wachstum).
              </p>
              <div className="relative flex items-center">
                <input
                  id="ist-immobilien"
                  type="number"
                  min="0"
                  step="500"
                  placeholder="0"
                  value={immobilien}
                  onChange={(e) => setImmobilien(e.target.value)}
                  className="w-full min-h-[46px] pl-3.5 pr-8 rounded-xl bg-white border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  €
                </span>
              </div>
            </div>

            {/* Topf 3: Spaßgeld */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="ist-spielgeld"
                  className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#B8873B]" />
                  <span>Topf 3: Spaßgeld / Spielgeld (Freie Wahl)</span>
                </label>
                {onOpenGlossary && (
                  <button
                    type="button"
                    onClick={() => onOpenGlossary("Spaßgeld")}
                    className="text-[11px] text-[#B8873B] underline cursor-pointer"
                  >
                    Was gehört hierher?
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#3E2340]/60">
                Frei für Dinge, die Spaß machen: Krypto, Einzelaktien, Wünsche, Experimente
              </p>
              <div className="relative flex items-center">
                <input
                  id="ist-spielgeld"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={spielgeld}
                  onChange={(e) => setSpielgeld(e.target.value)}
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
                id="ist-bestand-submit-btn"
                className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Auswertung zeigen</span>
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

        {/* ===================== TAB 2: UPLOAD (DSGVO-KONFORM) ===================== */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            {/* DSGVO-Garantie-Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>100 % DSGVO-konform: Reines Edge-Processing</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-950/80">
                Deine Datei wird ausschließlich lokal im Arbeitsspeicher dieses
                Browsers ausgelesen. Es werden <strong>keine fremden personenbezogenen
                Daten</strong> an Server, Clouds oder KIs gesendet.
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
                Unterstützt CSV, TXT, JSON oder Depotauszüge aller gängigen Broker (Trade Republic, Scalable, ING, Comdirect etc.)
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
                    <span className="text-[10px] text-[#3E2340]/60 block font-semibold">
                      Sicherheit
                    </span>
                    <span className="font-serif font-bold text-xs text-[#3E2340]">
                      {formatEuro(uploadReport.totals.sicherheit)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F4F0]">
                    <span className="text-[10px] text-[#3E2340]/60 block font-semibold">
                      Wachstum
                    </span>
                    <span className="font-serif font-bold text-xs text-[#3E2340]">
                      {formatEuro(uploadReport.totals.wachstum)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F4F0]">
                    <span className="text-[10px] text-[#3E2340]/60 block font-semibold">
                      Spaßgeld
                    </span>
                    <span className="font-serif font-bold text-xs text-[#3E2340]">
                      {formatEuro(uploadReport.totals.spielgeld)}
                    </span>
                  </div>
                </div>

                {/* Positions list with quick re-categorization */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/70 block">
                    Erkannte Positionen ({uploadReport.positions.length}):
                  </span>
                  {uploadReport.positions.map((pos) => (
                    <div
                      key={pos.id}
                      className="p-2 rounded-xl bg-[#F7F4F0] flex items-center justify-between text-xs gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#3E2340] truncate">
                          {pos.name}
                        </p>
                        <p className="text-[10px] text-[#3E2340]/60">
                          {formatEuro(pos.amount)}
                        </p>
                      </div>

                      {/* Dropdown to switch pot */}
                      <select
                        value={pos.category}
                        onChange={(e) =>
                          handleReclassify(
                            pos.id,
                            e.target.value as "sicherheit" | "wachstum" | "spielgeld"
                          )
                        }
                        className="text-[10px] bg-white border border-[#E5DFD7] rounded-lg px-1.5 py-1 text-[#3E2340] font-semibold"
                      >
                        <option value="sicherheit">Sicherheit</option>
                        <option value="wachstum">Wachstum</option>
                        <option value="spielgeld">Spaßgeld</option>
                      </select>
                    </div>
                  ))}
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
