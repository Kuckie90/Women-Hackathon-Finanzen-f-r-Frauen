import { useState, FormEvent } from "react";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  HelpCircle,
  PiggyBank,
  CheckCircle2,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { LebenszieleConfig } from "../types";
import { calculateRentenluecke } from "../utils/goalsAndPension";
import { formatEuro } from "../constants/rules";

interface LebenszieleScreenProps {
  initialConfig?: LebenszieleConfig;
  nettoeinkommen?: number;
  onSubmit: (config: LebenszieleConfig) => void;
  onOpenGlossary?: (term: string) => void;
  onBackToStart?: () => void;
  isStandaloneFromStart?: boolean;
}

export function LebenszieleScreen({
  initialConfig,
  nettoeinkommen,
  onSubmit,
  onOpenGlossary,
  onBackToStart,
  isStandaloneFromStart,
}: LebenszieleScreenProps) {
  // Alter & Rente
  const [alterStr, setAlterStr] = useState<string>(
    (initialConfig?.rentenluecke.aktuellesAlter || 32).toString()
  );
  const [rentenAlterStr, setRentenAlterStr] = useState<string>(
    (initialConfig?.rentenluecke.rentenAlter || 67).toString()
  );

  // Default estimations based on Nettoeinkommen (if available)
  const defaultWunsch = nettoeinkommen
    ? Math.round((nettoeinkommen * 0.8) / 50) * 50
    : initialConfig?.rentenluecke.wunschRenteNetto || 2000;
  const defaultErwartet = nettoeinkommen
    ? Math.round((nettoeinkommen * 0.52) / 50) * 50
    : initialConfig?.rentenluecke.erwarteteRenteNetto || 1300;

  const [wunschNettoStr, setWunschNettoStr] = useState<string>(defaultWunsch.toString());
  const [erwarteteRenteStr, setErwarteteRenteStr] = useState<string>(defaultErwartet.toString());

  // Mittelfristiges Ziel
  const [mfTitel, setMfTitel] = useState<string>(
    initialConfig?.mittelfristZiel.titel || "Immobilien-Eigenkapital / Sabbatical"
  );
  const [mfBetragStr, setMfBetragStr] = useState<string>(
    (initialConfig?.mittelfristZiel.zielbetrag || 20000).toString()
  );
  const [mfJahre, setMfJahre] = useState<number>(
    initialConfig?.mittelfristZiel.jahre || 5
  );

  // Kurzfristiges Ziel
  const [kfTitel, setKfTitel] = useState<string>(
    initialConfig?.kurzfristZiel.titel || "Notgroschen & liquide Rücklagen"
  );
  const [kfBetragStr, setKfBetragStr] = useState<string>(
    (initialConfig?.kurzfristZiel.zielbetrag || 6000).toString()
  );

  // Reform 2026: Altersvorsorgedepot & Frühstart-Rente für Kinder
  const [hasRiester, setHasRiester] = useState<boolean>(
    initialConfig?.reform2026?.hasRiester ?? false
  );
  const [interessiertAltersvorsorgedepot, setInteressiertAltersvorsorgedepot] = useState<boolean>(
    initialConfig?.reform2026?.interessiertAltersvorsorgedepot ?? true
  );
  const [hasKinder, setHasKinder] = useState<boolean>(
    initialConfig?.reform2026?.hasKinder ?? false
  );
  const [kinderAnzahl, setKinderAnzahl] = useState<number>(
    initialConfig?.reform2026?.kinderAnzahl || 1
  );
  const [kinderSparbeitragElternStr, setKinderSparbeitragElternStr] = useState<string>(
    (initialConfig?.reform2026?.kinderSparbeitragEltern ?? 25).toString()
  );

  // Helper to remove leading zeros and prevent raw "02000" input bugs
  const handleCleanNumberInput = (raw: string, setter: (val: string) => void) => {
    if (raw === "") {
      setter("");
      return;
    }
    const digits = raw.replace(/\D/g, "");
    const cleaned = digits.replace(/^0+(?=\d)/, "");
    setter(cleaned);
  };

  // Parsed numerical values
  const alter = parseInt(alterStr, 10) || 30;
  const rentenAlter = parseInt(rentenAlterStr, 10) || 67;
  const wunschNetto = parseInt(wunschNettoStr, 10) || 0;
  const erwarteteRente = parseInt(erwarteteRenteStr, 10) || 0;
  const mfBetrag = parseInt(mfBetragStr, 10) || 0;
  const kfBetrag = parseInt(kfBetragStr, 10) || 0;
  const kinderSparbeitragEltern = parseInt(kinderSparbeitragElternStr, 10) || 0;

  // Live calculation of Pension Gap
  const rentenData = calculateRentenluecke(
    alter,
    rentenAlter,
    wunschNetto,
    erwarteteRente
  );

  const jahreBisRente = Math.max(1, rentenAlter - alter);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const config: LebenszieleConfig = {
      rentenCheckAktiv: true,
      rentenluecke: rentenData,
      reform2026: {
        hasRiester,
        interessiertAltersvorsorgedepot,
        hasKinder,
        kinderAnzahl: hasKinder ? Math.max(1, kinderAnzahl) : 0,
        kinderSparbeitragEltern: hasKinder ? Math.max(0, kinderSparbeitragEltern) : 0,
      },
      kurzfristZiel: {
        titel: kfTitel,
        zielbetrag: Math.max(0, kfBetrag),
        monate: 12,
      },
      mittelfristZiel: {
        titel: mfTitel,
        zielbetrag: Math.max(0, mfBetrag),
        jahre: mfJahre,
      },
    };
    onSubmit(config);
  };

  const mittelfristPresets = [
    { title: "Immobilien-Eigenkapital", betrag: 25000, jahre: 5 },
    { title: "Sabbatical / Weltreise", betrag: 12000, jahre: 3 },
    { title: "Weiterbildung & Gründung", betrag: 10000, jahre: 3 },
    { title: "Familienauszeit & Kinder", betrag: 15000, jahre: 4 },
  ];

  return (
    <div id="lebensziele-screen" className="flex flex-col flex-1 px-5 pt-2 pb-6">
      <form onSubmit={handleSubmit} className="space-y-4 my-auto py-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#B8873B] font-bold">
              Lebensziele & Zeithorizonte
            </span>
            {onOpenGlossary && (
              <button
                type="button"
                onClick={() => onOpenGlossary("Lebensziele")}
                className="text-[11px] font-semibold text-[#B8873B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Warum Zeithorizonte?</span>
              </button>
            )}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Deine Ziele bestimmen deine Töpfe
          </h2>
          <p className="text-xs text-[#3E2340]/70 leading-relaxed">
            Ein Topf ist nie Selbstzweck, sondern dient einem Lebensziel.
            Kurzfristiges gehört in Topf 1 (Sicherheit), deine Rentenlücke in Topf 2 (Wachstum).
          </p>
        </div>

        {/* 1. LANGFRISTIG: RENTENLÜCKEN-RECHNER (TOPF 2: WACHSTUM) */}
        <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8873B] block">
                  Langfristig (&gt; 10 Jahre) • Topf 2: Wachstum
                </span>
                <h3 className="font-bold text-sm text-[#3E2340]">
                  Deine Rentenlücke (Gender Pension Gap)
                </h3>
              </div>
            </div>
            {onOpenGlossary && (
              <button
                type="button"
                onClick={() => onOpenGlossary("Rentenluecke")}
                className="text-[11px] text-[#B8873B] hover:underline cursor-pointer"
              >
                Details
              </button>
            )}
          </div>

          {/* Alter & Rentenalter */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="alter-input" className="text-[11px] font-semibold text-[#3E2340]/80">
                Dein Alter heute
              </label>
              <div className="relative flex items-center">
                <input
                  id="alter-input"
                  type="text"
                  inputMode="numeric"
                  value={alterStr}
                  placeholder="32"
                  onChange={(e) => handleCleanNumberInput(e.target.value, setAlterStr)}
                  onBlur={() => {
                    if (!alterStr || parseInt(alterStr, 10) < 18) setAlterStr("32");
                  }}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] text-sm font-semibold outline-hidden focus:border-[#B8873B]"
                />
                <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">
                  Jahre
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="rentenalter-input" className="text-[11px] font-semibold text-[#3E2340]/80">
                Geplanter Rentenstart
              </label>
              <div className="relative flex items-center">
                <input
                  id="rentenalter-input"
                  type="text"
                  inputMode="numeric"
                  value={rentenAlterStr}
                  placeholder="67"
                  onChange={(e) => handleCleanNumberInput(e.target.value, setRentenAlterStr)}
                  onBlur={() => {
                    if (!rentenAlterStr || parseInt(rentenAlterStr, 10) < 55) setRentenAlterStr("67");
                  }}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] text-sm font-semibold outline-hidden focus:border-[#B8873B]"
                />
                <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">
                  Jahre
                </span>
              </div>
            </div>
          </div>

          {/* Wunschrente vs. Erwartete Rente */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label htmlFor="wunsch-rente-input" className="text-[11px] font-semibold text-[#3E2340]/80">
                Wunsch-Netto im Alter
              </label>
              <div className="relative flex items-center">
                <input
                  id="wunsch-rente-input"
                  type="text"
                  inputMode="numeric"
                  value={wunschNettoStr}
                  placeholder="2000"
                  onChange={(e) => handleCleanNumberInput(e.target.value, setWunschNettoStr)}
                  onBlur={() => {
                    if (!wunschNettoStr || parseInt(wunschNettoStr, 10) === 0) {
                      setWunschNettoStr(defaultWunsch.toString());
                    }
                  }}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] text-sm font-semibold outline-hidden focus:border-[#B8873B]"
                />
                <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">
                  €/Monat
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="erwartet-rente-input" className="text-[11px] font-semibold text-[#3E2340]/80">
                Erwartete gesetzl. Rente
              </label>
              <div className="relative flex items-center">
                <input
                  id="erwartet-rente-input"
                  type="text"
                  inputMode="numeric"
                  value={erwarteteRenteStr}
                  placeholder="1300"
                  onChange={(e) => handleCleanNumberInput(e.target.value, setErwarteteRenteStr)}
                  onBlur={() => {
                    if (erwarteteRenteStr === "") {
                      setErwarteteRenteStr(defaultErwartet.toString());
                    }
                  }}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] text-sm font-semibold outline-hidden focus:border-[#B8873B]"
                />
                <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">
                  €/Monat
                </span>
              </div>
            </div>
          </div>

          {/* Rentenlücken-Ergebnis-Box */}
          <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#3E2340]/80 font-medium">
                Monatliche Rentenlücke:
              </span>
              <span className="text-base font-serif font-bold text-[#C44D34]">
                {formatEuro(rentenData.rentenlueckeMonatlich)} / Monat
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-[#E5DFD7]/60 pt-1.5">
              <span className="text-[#3E2340]/80">
                Benötigter Kapitalstock (25 Jahre Rente):
              </span>
              <span className="font-semibold text-[#3E2340]">
                {formatEuro(rentenData.benoetigtesKapital)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#2E7D32]/10 border border-[#2E7D32]/25 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#1B5E20] font-semibold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Nötige Sparrate in Topf 2 (Welt-ETFs):</span>
              </div>
              <span className="font-bold text-[#1B5E20] text-sm">
                ca. {formatEuro(rentenData.monatlicheSparrateFuerRente)} / Monat
              </span>
            </div>

            <p className="text-[10px] text-[#3E2340]/70 leading-relaxed pt-0.5">
              In {jahreBisRente} Jahren bis zur Rente übernimmt der Zinseszins (@ 6 % p.a.) den Großteil der Arbeit. Du sparst ca. {formatEuro(rentenData.monatlicheSparrateFuerRente * 12 * jahreBisRente)} ein, der Zinseszins macht daraus {formatEuro(rentenData.benoetigtesKapital)}.
            </p>
          </div>
        </div>

        {/* REFORM 2026: ALTERSVORSORGEDEPOT & FRÜHSTART-RENTE */}
        <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8873B] block">
                  Reform 2026 • Staatliche Förderung
                </span>
                <h3 className="font-bold text-sm text-[#3E2340]">
                  Altersvorsorgedepot & Frühstart-Rente
                </h3>
              </div>
            </div>
            {onOpenGlossary && (
              <button
                type="button"
                onClick={() => onOpenGlossary("Altersvorsorgedepot")}
                className="text-[11px] font-semibold text-[#B8873B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
            )}
          </div>

          {/* 1. Altersvorsorgedepot / Riester Check */}
          <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#3E2340] block">
                  Riester-Vertrag vorhanden?
                </span>
                <p className="text-[11px] text-[#3E2340]/70 leading-relaxed">
                  Alte Riester-Verträge litten unter teuren 100-%-Garantien. Ab 2026 erlaubt das neue <strong>Altersvorsorgedepot</strong> die garantiefreie Anlage in kostengünstige Welt-ETFs bei voller Steuerförderung.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHasRiester(!hasRiester)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  hasRiester
                    ? "bg-[#3E2340] text-white"
                    : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:border-[#B8873B]"
                }`}
              >
                {hasRiester ? "Ja, vorhanden" : "Nein"}
              </button>
            </div>

            {hasRiester && (
              <div className="p-2.5 rounded-lg bg-white border border-[#B8873B]/30 text-[11px] text-[#3E2340]/85 space-y-1">
                <span className="font-bold text-[#B8873B] block">
                  💡 Wechsel-Chance ab 2026:
                </span>
                <p>
                  Bestehendes Riester-Guthaben kann voraussichtlich gebührenfrei in ein neues Altersvorsorgedepot übertragen werden. Damit schließt du deine Rentenlücke mit breit gestreuten Welt-ETFs deutlich renditestärker!
                </p>
              </div>
            )}
          </div>

          {/* 2. Frühstart-Rente für Kinder */}
          <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#3E2340] flex items-center gap-1.5">
                  <span>Frühstart-Rente für Kinder</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#B8873B]/20 text-[#B8873B] font-bold">
                    Neu 2026
                  </span>
                </span>
                <p className="text-[11px] text-[#3E2340]/70 leading-relaxed">
                  Staatliche Förderung: 10 € / Monat pro Kind ab dem 6. Lebensjahr (ab Jahrgang 2020) direkt in ein zertifiziertes Altersvorsorgedepot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHasKinder(!hasKinder)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  hasKinder
                    ? "bg-[#2E7D32] text-white"
                    : "bg-white border border-[#E5DFD7] text-[#3E2340]/70 hover:border-[#B8873B]"
                }`}
              >
                {hasKinder ? "Ja, Kinder" : "Nein"}
              </button>
            </div>

            {hasKinder && (
              <div className="p-3 rounded-xl bg-white border border-[#2E7D32]/30 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#3E2340]/80 block mb-1">
                      Anzahl Kinder
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setKinderAnzahl(num)}
                          className={`flex-1 py-1 text-xs rounded-md border font-bold transition-all cursor-pointer ${
                            kinderAnzahl === num
                              ? "bg-[#2E7D32] text-white border-[#2E7D32]"
                              : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#3E2340]/80 block mb-1">
                      Eigener monatl. Sparbeitrag
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={kinderSparbeitragElternStr}
                        onChange={(e) => handleCleanNumberInput(e.target.value, setKinderSparbeitragElternStr)}
                        placeholder="25"
                        className="w-full px-2.5 py-1 text-xs font-bold text-[#3E2340] bg-[#F7F4F0] border border-[#E5DFD7] rounded-lg outline-hidden focus:border-[#2E7D32]"
                      />
                      <span className="absolute right-2 text-xs text-[#3E2340]/50 pointer-events-none">
                        €/M
                      </span>
                    </div>
                  </div>
                </div>

                {/* Zinseszins-Rechnung für Kinder */}
                {(() => {
                  const monatGesamt = kinderAnzahl * 10 + kinderSparbeitragEltern;
                  const r = 0.06 / 12;
                  const n = 144; // 12 Jahre (vom 6. bis 18. Lebensjahr)
                  const fv18 = Math.round(monatGesamt * ((Math.pow(1 + r, n) - 1) / r));
                  const fv67 = Math.round(fv18 * Math.pow(1.06, 49));
                  const staatlichGesamt = kinderAnzahl * 1440;

                  return (
                    <div className="p-2.5 rounded-lg bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-xs text-[#1B5E20] space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Geschenktes Basiskapital vom Staat:</span>
                        <span>{formatEuro(staatlichGesamt)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Mit 18 Jahren (bei 6 % Rendite):</span>
                        <span className="font-semibold">{formatEuro(fv18)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold border-t border-[#2E7D32]/20 pt-1">
                        <span>Zinseszins-Hebel bis zur Rente des Kindes:</span>
                        <span className="text-[#1B5E20]">{formatEuro(fv67)}</span>
                      </div>
                    </div>
                  );
                })()}

                {onOpenGlossary && (
                  <button
                    type="button"
                    onClick={() => onOpenGlossary("FruehstartRente")}
                    className="text-[11px] text-[#2E7D32] underline cursor-pointer block"
                  >
                    Wie funktioniert die Frühstart-Rente im Detail?
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. MITTELFRISTIG: 3-10 JAHRE (TOPF 1 & 2) */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E2340]/60 block">
                Mittelfristig (3–10 Jahre) • Topf 1 & 2
              </span>
              <h3 className="font-bold text-sm text-[#3E2340]">
                Wichtiges Zwischenziel
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={mfTitel}
              onChange={(e) => setMfTitel(e.target.value)}
              placeholder="z. B. Immobilien-Eigenkapital, Sabbatical..."
              className="w-full min-h-[40px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
            />

            {/* Schnell-Presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {mittelfristPresets.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => {
                    setMfTitel(preset.title);
                    setMfBetragStr(preset.betrag.toString());
                    setMfJahre(preset.jahre);
                  }}
                  className={`px-2 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                    mfTitel === preset.title
                      ? "bg-[#3E2340] text-white border-[#3E2340]"
                      : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                  Zielbetrag
                </span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={mfBetragStr}
                    placeholder="20000"
                    onChange={(e) => handleCleanNumberInput(e.target.value, setMfBetragStr)}
                    onBlur={() => {
                      if (!mfBetragStr) setMfBetragStr("20000");
                    }}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
                  />
                  <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">
                    €
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                  Geplanter Zeithorizont
                </span>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={mfJahre}
                    onChange={(e) => setMfJahre(parseInt(e.target.value) || 5)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
                  />
                  <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">
                    Jahre
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KURZFRISTIG: < 3 JAHRE (TOPF 1: SICHERHEIT) */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
              <BuddhaIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] block">
                Kurzfristig (&lt; 3 Jahre) • Topf 1: Sicherheit
              </span>
              <h3 className="font-bold text-sm text-[#3E2340]">
                Notgroschen & unvorhergesehene Ausgaben
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                Bezeichnung
              </span>
              <input
                type="text"
                value={kfTitel}
                onChange={(e) => setKfTitel(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#3E2340]/80 block">
                Zielbetrag (3–6 Monatsausgaben)
              </span>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={kfBetragStr}
                  placeholder="6000"
                  onChange={(e) => handleCleanNumberInput(e.target.value, setKfBetragStr)}
                  onBlur={() => {
                    if (!kfBetragStr) setKfBetragStr("6000");
                  }}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
                />
                <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">
                  €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Weiter-Button */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            id="lebensziele-submit-btn"
            className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>
              {isStandaloneFromStart
                ? "Rentenlücke speichern & in Assetanalyse übernehmen"
                : "Ziele übernehmen & weiter"}
            </span>
            <ArrowRight className="w-5 h-5 text-[#B8873B]" />
          </button>

          {onBackToStart && (
            <button
              type="button"
              onClick={onBackToStart}
              className="w-full py-2.5 text-xs text-[#3E2340]/70 hover:text-[#3E2340] font-medium text-center cursor-pointer transition-colors"
            >
              ← Zurück zur Startseite
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
