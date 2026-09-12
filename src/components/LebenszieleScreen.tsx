import { useState, FormEvent } from "react";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  PiggyBank,
  CheckCircle2,
} from "lucide-react";
import { LebenszieleConfig } from "../types";
import { calculateRentenluecke } from "../utils/goalsAndPension";
import { formatEuro } from "../constants/rules";

interface LebenszieleScreenProps {
  initialConfig?: LebenszieleConfig;
  nettoeinkommen?: number;
  onSubmit: (config: LebenszieleConfig) => void;
  onOpenGlossary?: (term: string) => void;
}

export function LebenszieleScreen({
  initialConfig,
  nettoeinkommen,
  onSubmit,
  onOpenGlossary,
}: LebenszieleScreenProps) {
  // Alter & Rente
  const [alter, setAlter] = useState<number>(
    initialConfig?.rentenluecke.aktuellesAlter || 32
  );
  const [rentenAlter, setRentenAlter] = useState<number>(
    initialConfig?.rentenluecke.rentenAlter || 67
  );

  // Default estimations based on Nettoeinkommen (if available)
  const defaultWunsch = nettoeinkommen
    ? Math.round((nettoeinkommen * 0.8) / 50) * 50
    : initialConfig?.rentenluecke.wunschRenteNetto || 2000;
  const defaultErwartet = nettoeinkommen
    ? Math.round((nettoeinkommen * 0.52) / 50) * 50
    : initialConfig?.rentenluecke.erwarteteRenteNetto || 1300;

  const [wunschNetto, setWunschNetto] = useState<number>(defaultWunsch);
  const [erwarteteRente, setErwarteteRente] = useState<number>(defaultErwartet);

  // Mittelfristiges Ziel
  const [mfTitel, setMfTitel] = useState<string>(
    initialConfig?.mittelfristZiel.titel || "Immobilien-Eigenkapital / Sabbatical"
  );
  const [mfBetrag, setMfBetrag] = useState<number>(
    initialConfig?.mittelfristZiel.zielbetrag || 20000
  );
  const [mfJahre, setMfJahre] = useState<number>(
    initialConfig?.mittelfristZiel.jahre || 5
  );

  // Kurzfristiges Ziel
  const [kfTitel, setKfTitel] = useState<string>(
    initialConfig?.kurzfristZiel.titel || "Notgroschen & liquide Rücklagen"
  );
  const [kfBetrag, setKfBetrag] = useState<number>(
    initialConfig?.kurzfristZiel.zielbetrag || 6000
  );

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
                  type="number"
                  min="18"
                  max="65"
                  value={alter}
                  onChange={(e) => setAlter(parseInt(e.target.value) || 30)}
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
                  type="number"
                  min="60"
                  max="72"
                  value={rentenAlter}
                  onChange={(e) => setRentenAlter(parseInt(e.target.value) || 67)}
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
                  type="number"
                  step="50"
                  min="500"
                  value={wunschNetto}
                  onChange={(e) => setWunschNetto(parseInt(e.target.value) || 0)}
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
                  type="number"
                  step="50"
                  min="0"
                  value={erwarteteRente}
                  onChange={(e) => setErwarteteRente(parseInt(e.target.value) || 0)}
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
                    setMfBetrag(preset.betrag);
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
                    type="number"
                    step="1000"
                    min="0"
                    value={mfBetrag}
                    onChange={(e) => setMfBetrag(parseInt(e.target.value) || 0)}
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
              <ShieldCheck className="w-4 h-4" />
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
                  type="number"
                  step="500"
                  min="0"
                  value={kfBetrag}
                  onChange={(e) => setKfBetrag(parseInt(e.target.value) || 0)}
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
        <div className="pt-2">
          <button
            type="submit"
            id="lebensziele-submit-btn"
            className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Ziele übernehmen & weiter</span>
            <ArrowRight className="w-5 h-5 text-[#B8873B]" />
          </button>
        </div>
      </form>
    </div>
  );
}
