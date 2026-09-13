import { useState, useRef, useEffect, FormEvent, ChangeEvent, DragEvent } from "react";
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
  Briefcase,
  SlidersHorizontal,
  Camera,
  Monitor,
  Clipboard,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { IstBestand, IstBestandDetails, VorsorgeVertraege, UploadedReport, ParsedPosition } from "../types";
import {
  parseStatementFile,
  parseFinancialNumber,
  captureDisplayMediaScreenshot,
  getImageFromClipboard,
} from "../utils/documentParser";
import { formatEuro } from "../constants/rules";
import { searchSecurities, SecurityQuote } from "../data/isinDatabase";
import { VerificationStation } from "./VerificationStation";

interface CustomAssetItem {
  id: string;
  name: string;
  amount: string;
  category: "sicherheit" | "wachstum" | "spielgeld" | "immobilien";
}

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
  // Zwei intuitive Tabs: "bausteine" (Anlageformen eintragen) oder "upload" (Depotauszug scannen)
  // Ein manuelles Zuordnen zu Töpfen gibt es nicht mehr – das übernimmt Angelegt vollautomatisch!
  const [activeTab, setActiveTab] = useState<"bausteine" | "upload">("bausteine");

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

  // Helper to sanitize additive inputs (digits, +, ., ,, and spaces)
  const handleAdditiveInput = (raw: string, setter: (val: string) => void) => {
    const cleaned = raw.replace(/[^\d+.,\s]/g, "");
    setter(cleaned);
  };

  // State für die konkreten Anlageformen
  const initDet = initialValues.details;

  // 1. Geld & Zinsanlagen
  const [tagesgeldGiro, setTagesgeldGiro] = useState<string>(
    initDet?.tagesgeldGiro ? initDet.tagesgeldGiro.toString() : initialValues.sicherheit > 0 ? initialValues.sicherheit.toString() : ""
  );
  const [festgeldBauspar, setFestgeldBauspar] = useState<string>(
    initDet?.festgeldBauspar ? initDet.festgeldBauspar.toString() : ""
  );
  const [anleihen, setAnleihen] = useState<string>(
    initDet?.anleihen ? initDet.anleihen.toString() : ""
  );

  // 2. Aktien & Wertpapiere
  const [weltEtf, setWeltEtf] = useState<string>(
    initDet?.weltEtf ? initDet.weltEtf.toString() : initialValues.wachstum > 0 ? initialValues.wachstum.toString() : ""
  );
  const [einzelaktien, setEinzelaktien] = useState<string>(
    initDet?.einzelaktien ? initDet.einzelaktien.toString() : ""
  );

  // 3. Immobilien & Sachwerte
  const [immobilieEigenkapital, setImmobilieEigenkapital] = useState<string>(
    initDet?.immobilieEigenkapital ? initDet.immobilieEigenkapital.toString() : initialValues.immobilien ? initialValues.immobilien.toString() : ""
  );
  const [immobilienfonds, setImmobilienfonds] = useState<string>(
    initDet?.immobilienfonds ? initDet.immobilienfonds.toString() : ""
  );
  const [goldRohstoffe, setGoldRohstoffe] = useState<string>(
    initDet?.goldRohstoffe ? initDet.goldRohstoffe.toString() : ""
  );

  // 4. Zukunft & Spekulation (Chancen)
  const [kryptoTrends, setKryptoTrends] = useState<string>(
    initDet?.kryptoTrends ? initDet.kryptoTrends.toString() : initialValues.spielgeld > 0 ? initialValues.spielgeld.toString() : ""
  );

  // 5. Optionale Vorsorgeverträge
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

  // 6. Beliebige eigene freie Positionen
  const [customPositions, setCustomPositions] = useState<CustomAssetItem[]>(
    initDet?.customPositions?.map((p) => ({
      id: p.id || Math.random().toString(),
      name: p.name,
      amount: p.amount.toString(),
      category: (p.category as any) || "wachstum",
    })) || []
  );

  // Upload & Screenshot states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScreenCapturing, setIsScreenCapturing] = useState(false);
  const [screenshotNotice, setScreenshotNotice] = useState<string | null>(null);
  const [uploadReport, setUploadReport] = useState<UploadedReport | null>(null);
  const [showVerificationStation, setShowVerificationStation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ISIN & Wertpapier-Schnellsuche
  const [isinQuery, setIsinQuery] = useState("");
  const [selectedSecurity, setSelectedSecurity] = useState<SecurityQuote | null>(null);
  const [securityShares, setSecurityShares] = useState<string>("");
  const [showIsinSearch, setShowIsinSearch] = useState(false);

  // Berechnungen & Summierung
  const numTagesgeld = parseAdditiveValue(tagesgeldGiro);
  const numFestgeld = parseAdditiveValue(festgeldBauspar);
  const numAnleihen = parseAdditiveValue(anleihen);

  const numWeltEtf = parseAdditiveValue(weltEtf);
  const numEinzelaktien = parseAdditiveValue(einzelaktien);

  const numImmoEigenkapital = parseAdditiveValue(immobilieEigenkapital);
  const numImmoFonds = parseAdditiveValue(immobilienfonds);
  const numGold = parseAdditiveValue(goldRohstoffe);

  const numKrypto = parseAdditiveValue(kryptoTrends);

  const numRiester = parseAdditiveValue(riesterGuthaben);
  const numRuerup = parseAdditiveValue(ruerupGuthaben);
  const numPrivateRente = parseAdditiveValue(privateRenteGuthaben);
  const numLebensversicherung = parseAdditiveValue(lebensversicherung);
  const totalVorsorge = numRiester + numRuerup + numPrivateRente + numLebensversicherung;

  // Freie Positionen summieren nach Kategorie
  let customSicherheit = 0;
  let customWachstum = 0;
  let customSpielgeld = 0;
  let customImmo = 0;

  customPositions.forEach((pos) => {
    const val = parseAdditiveValue(pos.amount);
    if (pos.category === "sicherheit") customSicherheit += val;
    else if (pos.category === "wachstum") customWachstum += val;
    else if (pos.category === "spielgeld") customSpielgeld += val;
    else if (pos.category === "immobilien") customImmo += val;
  });

  // =========================================================================
  // AUTOMATISCHES TOPF-MAPPING (Der Kernservice des Produkts!)
  // =========================================================================
  // - Topf 1 (Sicherheit):
  //   Giro + Tagesgeld (100 %) + Festgeld/Bauspar (100 %) + Anleihen (70 %)
  //   + Riester-Klassik (70 %) + Lebensversicherung (80 %) + Rürup/Privatrente (40 %) + freie Sicherheits-Assets
  // - Topf 2 (Wachstum):
  //   Welt-ETFs (100 %) + Einzelaktien (100 %) + Gold/Rohstoffe (100 % nach Dalio)
  //   + Immobilienfonds (100 %) + Anleihen (30 %) + Riester (30 %) + LV (20 %) + Rürup/Privatrente (60 %) + freie Wachstums-Assets
  // - Topf 3 (Freie Chancen / Spielgeld):
  //   Krypto & Trend-Assets (100 %) + freie Chancen
  // - Substanzvermögen Sachwert:
  //   Eigene Immobilie (getilgtes Eigenkapital) + freie Immobilienwerte
  // =========================================================================
  const mappedSicherheit = Math.round(
    numTagesgeld +
      numFestgeld +
      numAnleihen * 0.7 +
      numRiester * 0.7 +
      numLebensversicherung * 0.8 +
      (numRuerup + numPrivateRente) * 0.4 +
      customSicherheit
  );

  const mappedWachstum = Math.round(
    numWeltEtf +
      numEinzelaktien +
      numGold +
      numImmoFonds +
      numAnleihen * 0.3 +
      numRiester * 0.3 +
      numLebensversicherung * 0.2 +
      (numRuerup + numPrivateRente) * 0.6 +
      customWachstum
  );

  const mappedSpielgeld = Math.round(numKrypto + customSpielgeld);
  const mappedImmobilien = numImmoEigenkapital + customImmo;

  const totalLiquide = mappedSicherheit + mappedWachstum + mappedSpielgeld;
  const totalMitImmo = totalLiquide + mappedImmobilien;

  // Schnelle Klumpen-Prüfung für Vorschau
  const totalWachstumAssets = numWeltEtf + numEinzelaktien + numGold + numImmoFonds;
  const einzelaktienAnteil =
    totalWachstumAssets > 0 ? Math.round((numEinzelaktien / totalWachstumAssets) * 100) : 0;
  const hasKlumpenrisiko = numEinzelaktien > 0 && einzelaktienAnteil > 20;
  const hasDalioKrisenpuffer = numGold > 0;
  const hasImmoDoppelung = numImmoEigenkapital > 0 && numImmoFonds > 0;

  // Custom Position Handler
  const handleAddCustomPosition = () => {
    setCustomPositions((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        name: "",
        amount: "",
        category: "wachstum",
      },
    ]);
  };

  const handleUpdateCustomPosition = (
    id: string,
    field: keyof CustomAssetItem,
    value: string
  ) => {
    setCustomPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemoveCustomPosition = (id: string) => {
    setCustomPositions((prev) => prev.filter((p) => p.id !== id));
  };

  // Form Submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const vorsorgeObj: VorsorgeVertraege = {
      riesterGuthaben: numRiester,
      ruerupGuthaben: numRuerup,
      privateRenteGuthaben: numPrivateRente,
      lebensversicherung: numLebensversicherung,
    };

    const details: IstBestandDetails = {
      tagesgeldGiro: numTagesgeld,
      festgeldBauspar: numFestgeld,
      anleihen: numAnleihen,
      riesterKlassisch: numRiester,
      vorsorge: totalVorsorge > 0 ? vorsorgeObj : undefined,
      weltEtf: numWeltEtf,
      einzelaktien: numEinzelaktien,
      goldRohstoffe: numGold,
      immobilienfonds: numImmoFonds,
      kryptoTrends: numKrypto,
      immobilieEigenkapital: numImmoEigenkapital,
      customPositions: customPositions
        .filter((p) => parseAdditiveValue(p.amount) > 0)
        .map((p) => ({
          id: p.id,
          name: p.name || "Individuelle Anlage",
          amount: parseAdditiveValue(p.amount),
          category: p.category,
        })),
    };

    onSubmit({
      sicherheit: mappedSicherheit,
      wachstum: mappedWachstum,
      spielgeld: mappedSpielgeld,
      immobilien: mappedImmobilien > 0 ? mappedImmobilien : undefined,
      vorsorge: totalVorsorge > 0 ? vorsorgeObj : undefined,
      details,
    });
  };

  // Automatisches Einfügen aus der Zwischenablage (Strg+V / Cmd+V)
  useEffect(() => {
    if (activeTab !== "upload") return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const file = new File(
              [blob],
              `screenshot-zwischenablage-${Date.now()}.png`,
              { type: blob.type }
            );
            handleProcessFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [activeTab]);

  // Upload Processing
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setScreenshotNotice(null);
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
      setScreenshotNotice("Beim Auslesen ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Screenshot im Browser direkt aufnehmen
  const handleTakeScreenshot = async () => {
    setScreenshotNotice(null);
    setIsScreenCapturing(true);
    try {
      const file = await captureDisplayMediaScreenshot();
      if (file) {
        await handleProcessFile(file);
      }
    } catch (err: any) {
      console.warn("Screenshot capture notice:", err);
      if (err?.name !== "NotAllowedError") {
        setScreenshotNotice(
          "Bildschirmaufnahme konnte nicht gestartet werden. Tipp: Erstelle einen Screenshot und füge ihn einfach mit Strg+V (Cmd+V) hier ein."
        );
      }
    } finally {
      setIsScreenCapturing(false);
    }
  };

  // Bild aus Zwischenablage per Klick holen
  const handlePasteFromClipboardButton = async () => {
    setScreenshotNotice(null);
    try {
      const file = await getImageFromClipboard();
      if (file) {
        await handleProcessFile(file);
      } else {
        setScreenshotNotice(
          "Kein Bild in der Zwischenablage gefunden. Mache bitte einen Screenshot (z. B. Win+Shift+S oder Cmd+Shift+4) und drücke hier einfach Strg+V."
        );
      }
    } catch {
      setScreenshotNotice(
        "Konnte nicht direkt auf die Zwischenablage zugreifen. Bitte drücke einfach Strg+V (bzw. Cmd+V auf dem Mac)."
      );
    }
  };

  const handleConfirmVerifiedPositions = (verifiedPositions: ParsedPosition[]) => {
    let sTagesgeld = 0;
    let sFestgeld = 0;
    let sAnleihen = 0;
    let wWelt = 0;
    let wEinzel = 0;
    let wGold = 0;
    let wImmoFonds = 0;
    let spKrypto = 0;
    let immoEigen = 0;

    verifiedPositions.forEach((p) => {
      const name = (p.name || "").toLowerCase();
      const notes = (p.notes || "").toLowerCase();
      const combined = `${name} ${notes}`;
      const amt = Number(p.amount) || 0;
      if (amt <= 0) return;

      if (p.category === "sicherheit") {
        if (
          combined.includes("festgeld") ||
          combined.includes("bauspar") ||
          combined.includes("geldmarkt") ||
          combined.includes("dbx0an")
        ) {
          sFestgeld += amt;
        } else if (
          combined.includes("anleihe") ||
          combined.includes("renten") ||
          combined.includes("bundes") ||
          combined.includes("staatsanleihe")
        ) {
          sAnleihen += amt;
        } else {
          sTagesgeld += amt;
        }
      } else if (p.category === "wachstum") {
        if (
          combined.includes("gold") ||
          combined.includes("silber") ||
          combined.includes("edelmetall") ||
          combined.includes("etc")
        ) {
          wGold += amt;
        } else if (
          combined.includes("immobilienfonds") ||
          combined.includes("hausinvest") ||
          combined.includes("reit")
        ) {
          wImmoFonds += amt;
        } else if (
          combined.includes("etf") ||
          combined.includes("world") ||
          combined.includes("all-world") ||
          combined.includes("acwi") ||
          combined.includes("msci") ||
          combined.includes("stoxx") ||
          combined.includes("s&p") ||
          combined.includes("fonds")
        ) {
          wWelt += amt;
        } else {
          wEinzel += amt;
        }
      } else if (p.category === "spielgeld") {
        spKrypto += amt;
      } else if (p.category === "immobilien") {
        immoEigen += amt;
      }
    });

    if (sTagesgeld > 0) setTagesgeldGiro(Math.round(sTagesgeld).toString());
    if (sFestgeld > 0) setFestgeldBauspar(Math.round(sFestgeld).toString());
    if (sAnleihen > 0) setAnleihen(Math.round(sAnleihen).toString());
    if (wWelt > 0) setWeltEtf(Math.round(wWelt).toString());
    if (wEinzel > 0) setEinzelaktien(Math.round(wEinzel).toString());
    if (wGold > 0) setGoldRohstoffe(Math.round(wGold).toString());
    if (wImmoFonds > 0) setImmobilienfonds(Math.round(wImmoFonds).toString());
    if (spKrypto > 0) setKryptoTrends(Math.round(spKrypto).toString());
    if (immoEigen > 0) setImmobilieEigenkapital(Math.round(immoEigen).toString());

    if (uploadReport) {
      const sTotal = sTagesgeld + sFestgeld + sAnleihen;
      const wTotal = wWelt + wEinzel + wGold + wImmoFonds;
      const spTotal = spKrypto;
      const immoTotal = immoEigen;

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
    setActiveTab("bausteine");
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
        {/* Titel & Subtitel */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#B8873B] font-bold">
              Schritt 2: Bestehende Anlagen
            </span>
            {onOpenGlossary && (
              <button
                type="button"
                onClick={() => onOpenGlossary("Depot")}
                className="text-[11px] font-semibold text-[#B8873B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Warum erfassen?</span>
              </button>
            )}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Deine bestehenden Anlagen
          </h2>
          <p className="text-xs text-[#3E2340]/75">
            Trage deine Anlageformen einfach untereinander ein oder lade deinen Depotauszug hoch.
          </p>
        </div>

        {/* SERVICE-VERSPRECHEN: Nutzer muss NIE Töpfe zuordnen! */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#B8873B]/30 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3E2340]">
            <Sparkles className="w-4 h-4 text-[#B8873B] shrink-0" />
            <span>Der Angelegt-Service für dich:</span>
          </div>
          <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
            Du musst deine einzelnen Assets, Aktien oder Depots <strong>keinem Topf zuordnen</strong>. Trage einfach ein, was du besitzt – unser Algorithmus übernimmt die strukturierte Zuordnung vollautomatisch und analysiert deine Risiken und Korrelationen.
          </p>
        </div>

        {/* Tab Switcher: Anlageformen eintragen vs. Depotauszug hochladen */}
        <div className="grid grid-cols-2 p-1 bg-[#EFECE6] rounded-xl border border-[#E5DFD7] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("bausteine")}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "bausteine"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">Anlagen eintragen</span>
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
            <span className="truncate">Screenshot / PDF scannen</span>
          </button>
        </div>

        {/* ===================== TAB 1: ANLAGEFORMEN UNTEREINANDER ===================== */}
        {activeTab === "bausteine" && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Geld & Zinsanlagen */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <BuddhaIcon className="w-4 h-4 text-[#2E7D32]" />
                  <span>Liquidität & Zinsanlagen</span>
                </label>
                <span className="text-[10px] text-[#3E2340]/60">Kapitalerhalt & Puffer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Girokonto & Tagesgeld
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
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">Notgroschen & Kontostand</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Festgeld & Bausparer
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
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">Geldmarkt & Sparbriefe</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Anleihen & Rentenfonds
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={anleihen}
                      onChange={(e) => handleAdditiveInput(e.target.value, setAnleihen)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">Staats- & Firmenanleihen</span>
                </div>
              </div>
            </div>

            {/* 2. Börsengehandelte Wertpapiere (ETFs & Aktien) */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#3E2340]" />
                  <span>Aktien & Börsenwerte</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowIsinSearch(!showIsinSearch)}
                  className="text-[11px] font-semibold text-[#B8873B] hover:text-[#3E2340] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showIsinSearch ? "Suche schließen" : "ISIN / WKN Schnellsuche"}</span>
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
                              const currentVal = parseAdditiveValue(weltEtf);
                              setWeltEtf(currentVal > 0 ? `${currentVal} + ${val}` : val.toString());
                            } else if (selectedSecurity.category === "einzelaktie") {
                              const currentVal = parseAdditiveValue(einzelaktien);
                              setEinzelaktien(currentVal > 0 ? `${currentVal} + ${val}` : val.toString());
                            } else if (selectedSecurity.category === "gold_rohstoff") {
                              const currentVal = parseAdditiveValue(goldRohstoffe);
                              setGoldRohstoffe(currentVal > 0 ? `${currentVal} + ${val}` : val.toString());
                            } else if (selectedSecurity.category === "krypto") {
                              const currentVal = parseAdditiveValue(kryptoTrends);
                              setKryptoTrends(currentVal > 0 ? `${currentVal} + ${val}` : val.toString());
                            }
                            setSelectedSecurity(null);
                            setSecurityShares("");
                            setIsinQuery("");
                          }
                        }}
                        className="w-full py-1.5 rounded-lg bg-[#B8873B] text-white text-xs font-bold hover:bg-[#8A5E1E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Wert ({formatEuro(Math.round((parseFloat(securityShares) || 0) * selectedSecurity.priceEuro))}) zu deinen Anlagen addieren</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Welt-Aktien-ETFs & Fonds
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
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">MSCI World, All-World, ACWI</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Einzelaktien & Unternehmensanteile
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
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">Apple, SAP, Allianz etc. (für Klumpenanalyse)</span>
                </div>
              </div>
            </div>

            {/* 3. Immobilien & Reale Sachwerte */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#B8873B]" />
                  <span>Immobilien & Sachwerte</span>
                </label>
                <span className="text-[10px] text-[#3E2340]/60">Substanz & Krisenschutz</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Eigene Immobilie */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                      Eigene Immobilie
                    </span>
                    {onOpenGlossary && (
                      <button
                        type="button"
                        onClick={() => onOpenGlossary("Immobilien")}
                        className="text-[10px] text-[#B8873B] hover:underline cursor-pointer"
                      >
                        Info
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={immobilieEigenkapital}
                      onChange={(e) => handleAdditiveInput(e.target.value, setImmobilieEigenkapital)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
                    Getilgtes Eigenkapital (Marktwert abzgl. Restschuld)
                  </span>
                </div>

                {/* Immobilienfonds / REITs */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Immobilienfonds & REITs
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={immobilienfonds}
                      onChange={(e) => handleAdditiveInput(e.target.value, setImmobilienfonds)}
                      className="w-full min-h-[42px] pl-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-sm font-semibold outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
                  </div>
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
                    HausInvest, Grundbesitz, REIT-ETFs
                  </span>
                </div>

                {/* Gold & Rohstoffe */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                    Gold & Edelmetalle
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
                  <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
                    Dalio-Allwetter-Krisenpuffer
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Zukunft, Spekulative Chancen & Krypto */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B8873B]" />
                  <span>Kryptowährungen & spekulative Satelliten</span>
                </label>
                <span className="text-[10px] text-[#3E2340]/60">Chancen & Wünsche</span>
              </div>
              <p className="text-[10px] text-[#3E2340]/70">
                Bitcoin, Ethereum, P2P-Kredite, Start-ups. Kann für Träume genutzt werden – <strong>darf man aber nicht brauchen müssen!</strong>
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

            {/* 5. OPTIONALER KASTEN: Bestehende Vorsorge- & Rentenverträge */}
            <div className="p-3.5 md:p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#B8873B]" />
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
                  <span>{showVorsorgeKasten ? "Ausblenden" : "Einblenden"}</span>
                  {showVorsorgeKasten ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showVorsorgeKasten && (
                <div className="space-y-3 pt-1 border-t border-[#E5DFD7]">
                  <div className="p-2.5 rounded-xl bg-[#F7F4F0] text-[11px] text-[#3E2340]/80 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#B8873B] shrink-0 mt-0.5" />
                    <span>
                      Trage hier das <strong>aktuelle Vertragskapital</strong> bzw. den <strong>Rückkaufswert</strong> laut deiner letzten Standmitteilung ein (nicht den Monatsbeitrag).
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#3E2340]/90 block">
                        Riester-Rente
                      </label>
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
                    </div>

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
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#3E2340]/90 block">
                        Private Rentenversicherung
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
                    </div>

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
                    </div>
                  </div>

                  {totalVorsorge > 0 && (
                    <div className="p-2 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center justify-between text-xs text-[#2E7D32]">
                      <span className="font-semibold">Erfasstes Vorsorgevermögen:</span>
                      <span className="font-bold text-sm">{formatEuro(totalVorsorge)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 6. BELIEBIGE WEITERE INDIVIDUELLE POSITIONEN */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-[#3E2340] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#B8873B]" />
                  <span>Weitere individuelle Vermögenswerte</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddCustomPosition}
                  className="text-[11px] font-semibold text-[#B8873B] hover:text-[#8A5E1E] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Position hinzufügen</span>
                </button>
              </div>

              {customPositions.length === 0 ? (
                <p className="text-[11px] text-[#3E2340]/60 italic">
                  Besitzt du z. B. Kunstgegenstände, Firmenbeteiligungen, P2P-Kredite oder Wald-/Grundbesitz? Klicke auf „+ Position hinzufügen“.
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  {customPositions.map((pos) => (
                    <div key={pos.id} className="p-2.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Name (z.B. P2P-Kredite, Oldtimer, Firmenanteile)"
                          value={pos.name}
                          onChange={(e) => handleUpdateCustomPosition(pos.id, "name", e.target.value)}
                          className="flex-1 min-h-[36px] px-2.5 text-xs rounded-lg bg-white border border-[#E5DFD7] text-[#3E2340] outline-hidden font-medium"
                        />
                        <div className="relative w-32">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Betrag €"
                            value={pos.amount}
                            onChange={(e) => handleUpdateCustomPosition(pos.id, "amount", e.target.value)}
                            className="w-full min-h-[36px] pl-2.5 pr-6 text-xs rounded-lg bg-white border border-[#E5DFD7] text-[#3E2340] outline-hidden font-semibold"
                          />
                          <span className="absolute right-2 top-2 text-xs text-[#3E2340]/40 pointer-events-none">€</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomPosition(pos.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3E2340]/40 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-[#3E2340]/60">Art der Anlage:</span>
                        {(["sicherheit", "wachstum", "spielgeld", "immobilien"] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleUpdateCustomPosition(pos.id, "category", cat)}
                            className={`px-2 py-0.5 rounded-md cursor-pointer capitalize font-semibold transition-all ${
                              pos.category === cat
                                ? "bg-[#3E2340] text-white"
                                : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:text-[#3E2340]"
                            }`}
                          >
                            {cat === "sicherheit"
                              ? "Sicherheit"
                              : cat === "wachstum"
                              ? "Wachstum"
                              : cat === "spielgeld"
                              ? "Chancen"
                              : "Immobilien"}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE-VORSCHAU DER AUTOMATISCHEN ZUORDNUNG */}
            <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E5DFD7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3E2340] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#B8873B]" />
                  <span>Automatische Zuordnung in deine 3 Töpfe</span>
                </span>
                <span className="text-xs font-bold text-[#3E2340]">
                  Liquides Vermögen: {formatEuro(totalLiquide)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#2E7D32] block font-bold">1. Sicherheit</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedSicherheit)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedSicherheit / totalLiquide) * 100) : 0} %
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#3E2340] block font-bold">2. Wachstum</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedWachstum)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedWachstum / totalLiquide) * 100) : 0} %
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7]">
                  <span className="text-[10px] text-[#8A5E1E] block font-bold">3. Freie Chancen</span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block">
                    {formatEuro(mappedSpielgeld)}
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">
                    {totalLiquide > 0 ? Math.round((mappedSpielgeld / totalLiquide) * 100) : 0} %
                  </span>
                </div>
              </div>

              {/* Analyse-Signale vorab */}
              {hasImmoDoppelung && (
                <div className="p-2.5 rounded-xl bg-[#B8873B]/10 border border-[#B8873B]/30 text-xs text-[#8A5E1E] flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#B8873B]" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Immobilien-Kombination erkannt:</strong> Du besitzt eine eigene Immobilie und Immobilienfonds. Im nächsten Schritt analysieren wir deinen Sektor-Zusammenhang und das Klumpenrisiko.
                  </p>
                </div>
              )}

              {hasKlumpenrisiko && (
                <div className="p-2.5 rounded-xl bg-[#C44D34]/10 border border-[#C44D34]/25 text-xs text-[#C44D34] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Einzelaktien-Anteil:</strong> {einzelaktienAnteil} % deiner Wachstumsanlagen liegen in Einzelaktien. Wir untersuchen gleich die Korrelation und Markowitz-Diversifikation.
                  </p>
                </div>
              )}

              {hasDalioKrisenpuffer && (
                <div className="p-2.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-xs text-[#1B5E20] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Dalio-Krisenpuffer aktiv:</strong> Edelmetalle ({formatEuro(numGold)}) weisen eine geringe Korrelation zu Aktien auf und schützen gegen Stagflation.
                  </p>
                </div>
              )}

              {mappedImmobilien > 0 && (
                <div className="text-[11px] text-[#3E2340]/70 flex items-center justify-between pt-1 border-t border-[#E5DFD7]">
                  <span>+ Sachwert Eigenheim (gesondert geführt):</span>
                  <span className="font-bold">{formatEuro(mappedImmobilien)}</span>
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                id="ist-bestand-submit-btn"
                className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Anlagen jetzt automatisch analysieren & zuordnen</span>
                <ArrowRight className="w-5 h-5 text-[#B8873B]" />
              </button>

              {isExplainMode && (
                <button
                  type="button"
                  id="ist-bestand-skip-btn"
                  onClick={onSkip}
                  className="py-2.5 text-xs text-[#3E2340]/70 hover:text-[#3E2340] text-center font-medium underline cursor-pointer"
                >
                  Ich habe noch keine Anlagen (Neustart mit 0 €)
                </button>
              )}
            </div>
          </form>
        )}

        {/* ===================== TAB 2: UPLOAD & SCREENSHOT ===================== */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            {/* DSGVO & Datenschutz-Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Sicher & DSGVO-konform: Verschlüsselt & Vertraulich</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Edge & SSL
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-950/80">
                Auszüge und Screenshots werden ausschließlich für die Extraktion deiner Depotwerte verwendet und <strong>niemals gespeichert</strong>. Du behältst in der anschließenden Prüfstation die volle Kontrolle über jede Position.
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

            {/* Wenn Prüfstation aktiv ist */}
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
                {/* 3 Schnellauswahl-Aktionen für Screenshot, Zwischenablage & Foto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Screenshot aufnehmen */}
                  <button
                    type="button"
                    onClick={handleTakeScreenshot}
                    disabled={isProcessing || isScreenCapturing}
                    className="p-3 rounded-xl bg-white border border-[#E5DFD7] hover:border-[#B8873B] text-left transition-all hover:shadow-xs active:scale-[0.99] cursor-pointer group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-[#3E2340]/10 text-[#3E2340] group-hover:bg-[#3E2340] group-hover:text-[#F7F4F0] transition-colors flex items-center justify-center shrink-0">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#3E2340]">Screenshot machen</span>
                    </div>
                    <p className="text-[10px] text-[#3E2340]/60 pl-9 leading-tight">
                      Broker-Fenster oder App direkt im Browser erfassen
                    </p>
                  </button>

                  {/* Option 2: Zwischenablage */}
                  <button
                    type="button"
                    onClick={handlePasteFromClipboardButton}
                    disabled={isProcessing}
                    className="p-3 rounded-xl bg-white border border-[#E5DFD7] hover:border-[#B8873B] text-left transition-all hover:shadow-xs active:scale-[0.99] cursor-pointer group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-[#B8873B]/10 text-[#B8873B] group-hover:bg-[#B8873B] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                        <Clipboard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#3E2340]">Aus Zwischenablage</span>
                    </div>
                    <p className="text-[10px] text-[#3E2340]/60 pl-9 leading-tight">
                      Oder einfach <strong>Strg + V</strong> (Cmd + V) drücken
                    </p>
                  </button>

                  {/* Option 3: Kamera / Foto */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isProcessing}
                    className="p-3 rounded-xl bg-white border border-[#E5DFD7] hover:border-[#B8873B] text-left transition-all hover:shadow-xs active:scale-[0.99] cursor-pointer group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#3E2340]">Foto mit Kamera</span>
                    </div>
                    <p className="text-[10px] text-[#3E2340]/60 pl-9 leading-tight">
                      Depot-Brief oder Dokument abfotografieren
                    </p>
                  </button>
                </div>

                {/* Versteckte Kamera-Eingabe */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Hinweis / Fehlermeldung bei Screenshot */}
                {screenshotNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{screenshotNotice}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshotNotice(null)}
                      className="text-amber-700 hover:text-amber-900 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Drag & Drop Upload Zone für PDF / Screenshot / CSV */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#B8873B] bg-[#B8873B]/10 scale-[1.01]"
                      : "border-[#E5DFD7] bg-white hover:border-[#B8873B]/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.json,application/pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center mb-3">
                    {isProcessing || isScreenCapturing ? (
                      <Loader2 className="w-6 h-6 text-[#B8873B] animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#B8873B]" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#3E2340]">
                    {isProcessing
                      ? "Screenshot / PDF wird analysiert..."
                      : isScreenCapturing
                      ? "Wähle das Fenster oder den Tab deines Depots..."
                      : "PDF-Depotauszug oder Screenshot hierher ziehen"}
                  </p>
                  <p className="text-[11px] text-[#3E2340]/60 mt-1.5 max-w-md leading-relaxed">
                    Unterstützt <strong>PDF</strong>, <strong>PNG</strong>, <strong>JPG</strong>, <strong>CSV</strong> (Trade Republic, Scalable, ING, Comdirect, DKB, Flatex u.v.m.).
                  </p>
                  <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-[#F7F4F0] text-[10px] font-semibold text-[#3E2340]/70 border border-[#E5DFD7]">
                    <Sparkles className="w-3 h-3 text-[#B8873B]" />
                    <span>Automatische Erkennung von ISINs, Titeln und Topf-Zuordnung</span>
                  </span>
                </div>

                {/* Uploaded Results Preview */}
                {uploadReport && (
                  <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3.5 animate-in fade-in duration-200 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#3E2340]">
                        <FileText className="w-4 h-4 text-[#B8873B]" />
                        <span className="truncate max-w-[190px]">{uploadReport.fileName}</span>
                        {uploadReport.detectedBroker && (
                          <span className="text-[10px] font-bold text-[#3E2340]/60 bg-[#F7F4F0] px-1.5 py-0.5 rounded">
                            {uploadReport.detectedBroker}
                          </span>
                        )}
                      </div>
                      {uploadReport.error || uploadReport.positions.length === 0 ? (
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Keine Positionen erkannt
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {uploadReport.extractionMethod === "ai" ? (
                            <span className="text-[10px] text-purple-900 font-semibold bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-700" />
                              <span>KI-Vision erkannt</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Lokal ausgelesen</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Screenshot / PDF Thumbnail falls vorhanden */}
                    {uploadReport.previewImageUrl && (
                      <div className="p-2.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#E5DFD7] bg-white shrink-0 flex items-center justify-center">
                          <img
                            src={uploadReport.previewImageUrl}
                            alt="Auszug Vorschau"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1 font-semibold text-[#3E2340]">
                            <ImageIcon className="w-3.5 h-3.5 text-[#B8873B]" />
                            <span>Erfasster Screenshot / Auszug</span>
                          </div>
                          <p className="text-[11px] text-[#3E2340]/70 truncate">
                            {uploadReport.positions.length} Positionen im Bild erkannt
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadReport.error || uploadReport.positions.length === 0 ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                        <p className="leading-relaxed">
                          {uploadReport.error ||
                            "In diesem Screenshot / Dokument konnten keine Finanzpositionen mit eindeutigen Euro-Beträgen erkannt werden. Bitte trage die Beträge in den Feldern unter 'Anlagen eintragen' ein oder versuche einen kontrastreicheren Screenshot."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("bausteine")}
                          className="text-xs font-bold text-[#B8873B] underline hover:text-[#8A5E1E] cursor-pointer"
                        >
                          Zu 'Anlagen eintragen' wechseln →
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs">
                          <div className="p-2 rounded-xl bg-[#F7F4F0]">
                            <span className="text-[10px] text-emerald-800 block font-semibold">1. Sicherheit</span>
                            <span className="font-serif font-bold text-xs text-[#3E2340]">
                              {formatEuro(uploadReport.totals.sicherheit)}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#F7F4F0]">
                            <span className="text-[10px] text-[#3E2340] block font-semibold">2. Wachstum</span>
                            <span className="font-serif font-bold text-xs text-[#3E2340]">
                              {formatEuro(uploadReport.totals.wachstum)}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#F7F4F0]">
                            <span className="text-[10px] text-[#B8873B] block font-semibold">3. Träume</span>
                            <span className="font-serif font-bold text-xs text-[#B8873B]">
                              {formatEuro(uploadReport.totals.spielgeld)}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-[#F7F4F0]">
                            <span className="text-[10px] text-[#665445] block font-semibold">Immobilien</span>
                            <span className="font-serif font-bold text-xs text-[#3E2340]">
                              {formatEuro(uploadReport.totals.immobilien)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowVerificationStation(true)}
                            className="flex-1 min-h-[44px] rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-[#B8873B] transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#B8873B]" />
                            <span>Prüfstation öffnen ({uploadReport.positions.length} Positionen)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirmVerifiedPositions(uploadReport.positions)}
                            className="flex-1 min-h-[44px] rounded-xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#3E2340]/90 transition-colors cursor-pointer"
                          >
                            <span>Direkt in Töpfe übernehmen</span>
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
