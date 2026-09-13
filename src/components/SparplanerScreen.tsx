import { useState, useId } from "react";
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  Award,
} from "lucide-react";
import { formatEuro } from "../constants/rules";

interface SparplanerScreenProps {
  initialMonatsrate?: number;
  initialEinmalbetrag?: number;
  onApplyPlan: (monatsrate: number, einmalbetrag: number) => void;
  onBackToStart: () => void;
}

export function SparplanerScreen({
  initialMonatsrate,
  initialEinmalbetrag,
  onApplyPlan,
  onBackToStart,
}: SparplanerScreenProps) {
  const [monatsrate, setMonatsrate] = useState<number>(initialMonatsrate || 150);
  const [startkapital, setStartkapital] = useState<number>(initialEinmalbetrag || 1000);
  const [jahre, setJahre] = useState<number>(15);
  const [rendite, setRendite] = useState<number>(7.0);

  const startkapitalInputId = useId();
  const monatsrateInputId = useId();
  const jahreRangeId = useId();
  const renditeRangeId = useId();

  // Zinseszins-Berechnung
  const months = Math.max(1, jahre * 12);
  const monthlyRate = rendite / 100 / 12;

  let endwert = startkapital;
  if (monthlyRate > 0) {
    const compoundGrowth = Math.pow(1 + monthlyRate, months);
    const startValue = startkapital * compoundGrowth;
    const annuityValue = monatsrate * ((compoundGrowth - 1) / monthlyRate);
    endwert = Math.round(startValue + annuityValue);
  } else {
    endwert = startkapital + monatsrate * months;
  }

  const eingezahlt = Math.round(startkapital + monatsrate * months);
  const zinsgewinn = Math.max(0, endwert - eingezahlt);
  const gewinnProzent = endwert > 0 ? Math.round((zinsgewinn / endwert) * 100) : 0;
  const eingezahltProzent = 100 - gewinnProzent;

  // Meilensteine berechnen für 5, 10, 15, 20, 25 Jahre
  const milestones = [5, 10, 15, 20, 25, 30].filter((y) => y <= Math.max(jahre, 20)).map((y) => {
    const m = y * 12;
    const cg = Math.pow(1 + monthlyRate, m);
    const val = Math.round(startkapital * cg + monatsrate * ((cg - 1) / monthlyRate));
    const paid = Math.round(startkapital + monatsrate * m);
    return { jahre: y, val, paid, gain: Math.max(0, val - paid) };
  });

  const handleApply = () => {
    onApplyPlan(monatsrate, startkapital);
  };

  return (
    <div id="sparplaner-screen" className="flex flex-col flex-1 px-5 pt-3 pb-6 space-y-5">
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#B8873B]/15 text-[#8A5E1E] text-xs font-semibold">
          <TrendingUp className="w-3.5 h-3.5 text-[#B8873B]" />
          <span>Zinseszinsrechner</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#3E2340]">
          Dein Sparplaner
        </h2>
        <p className="text-xs text-[#3E2340]/75 max-w-sm mx-auto">
          Erlebe den Zinseszinseffekt: Sieh, wie aus deiner monatlichen Sparrate über die Zeit ein echtes Vermögen wird.
        </p>
      </div>

      {/* Ergebnis Hero Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3E2340] to-[#251527] text-[#F7F4F0] shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8873B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#B8873B]">
              Erwartetes Vermögen nach {jahre} Jahren
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
            @{rendite.toFixed(1)} % p.a.
          </span>
        </div>

        <div className="border-b border-white/10 pb-3">
          <div className="font-serif text-3xl sm:text-4xl font-bold text-[#F7F4F0]">
            {formatEuro(endwert)}
          </div>
          <p className="text-xs text-[#F7F4F0]/80 mt-1">
            Davon sind <strong className="text-[#B8873B] font-bold">{formatEuro(zinsgewinn)} ({gewinnProzent} %)</strong> reiner Zinseszinsgewinn!
          </p>
        </div>

        {/* Visual Split Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-[#F7F4F0]/80 font-medium">
            <span>Eingezahlt: {formatEuro(eingezahlt)} ({eingezahltProzent}%)</span>
            <span className="text-[#B8873B]">Zinsgewinn: {formatEuro(zinsgewinn)} ({gewinnProzent}%)</span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/25 overflow-hidden flex">
            <div
              style={{ width: `${eingezahltProzent}%` }}
              className="h-full bg-[#E5DFD7]/80 transition-all duration-300"
              title="Eigene Einzahlungen"
            />
            <div
              style={{ width: `${gewinnProzent}%` }}
              className="h-full bg-[#B8873B] transition-all duration-300"
              title="Erwirtschaftete Gewinne"
            />
          </div>
        </div>
      </div>

      {/* Eingabefelder */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-4">
        {/* Sparrate & Startkapital */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor={monatsrateInputId} className="text-xs font-semibold text-[#3E2340] block">
              Monatliche Sparrate
            </label>
            <div className="relative flex items-center">
              <input
                id={monatsrateInputId}
                type="number"
                min={10}
                step={25}
                value={monatsrate || ""}
                onChange={(e) => setMonatsrate(Math.max(0, Number(e.target.value)))}
                className="w-full min-h-[42px] px-3 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor={startkapitalInputId} className="text-xs font-semibold text-[#3E2340] block">
              Startkapital (Einmal)
            </label>
            <div className="relative flex items-center">
              <input
                id={startkapitalInputId}
                type="number"
                min={0}
                step={500}
                value={startkapital || ""}
                onChange={(e) => setStartkapital(Math.max(0, Number(e.target.value)))}
                className="w-full min-h-[42px] px-3 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>
        </div>

        {/* Anlagedauer Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs font-semibold text-[#3E2340]">
            <label htmlFor={jahreRangeId}>Anlagedauer: {jahre} Jahre</label>
            <span className="text-[11px] text-[#3E2340]/60">({jahre * 12} Monate)</span>
          </div>
          <input
            id={jahreRangeId}
            type="range"
            min={3}
            max={40}
            step={1}
            value={jahre}
            onChange={(e) => setJahre(Number(e.target.value))}
            className="w-full h-2 bg-[#E5DFD7] rounded-lg appearance-none cursor-pointer accent-[#B8873B]"
          />
          <div className="flex justify-between gap-1 pt-1">
            {[5, 10, 15, 20, 25, 30].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setJahre(y)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  jahre === y
                    ? "bg-[#3E2340] text-[#F7F4F0]"
                    : "bg-[#F7F4F0] text-[#3E2340]/70 hover:bg-[#E5DFD7]"
                }`}
              >
                {y} J.
              </button>
            ))}
          </div>
        </div>

        {/* Renditeauswahl */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs font-semibold text-[#3E2340]">
            <label htmlFor={renditeRangeId}>Erwartete Rendite p.a.: {rendite.toFixed(1)} %</label>
            <span className="text-[10px] text-[#3E2340]/60">nach Produktkosten</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRendite(2.0)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                rendite === 2.0
                  ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340]"
                  : "bg-[#F7F4F0] text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
              }`}
            >
              <div className="text-[10px] opacity-75">Sicherheit</div>
              <div className="text-xs font-bold">2,0 %</div>
              <div className="text-[9px] opacity-70">Geldmarkt/Festgeld</div>
            </button>

            <button
              type="button"
              onClick={() => setRendite(5.0)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                rendite === 5.0
                  ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340]"
                  : "bg-[#F7F4F0] text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
              }`}
            >
              <div className="text-[10px] opacity-75">Ausgewogen</div>
              <div className="text-xs font-bold">5,0 %</div>
              <div className="text-[9px] opacity-70">50 % Aktien + Festgeld</div>
            </button>

            <button
              type="button"
              onClick={() => setRendite(7.0)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                rendite === 7.0
                  ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340]"
                  : "bg-[#F7F4F0] text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
              }`}
            >
              <div className="text-[10px] opacity-75">Wachstum</div>
              <div className="text-xs font-bold">7,0 %</div>
              <div className="text-[9px] opacity-70">MSCI World Schnitt</div>
            </button>
          </div>

          <input
            id={renditeRangeId}
            type="range"
            min={1.0}
            max={12.0}
            step={0.5}
            value={rendite}
            onChange={(e) => setRendite(Number(e.target.value))}
            className="w-full h-1.5 bg-[#E5DFD7] rounded-lg appearance-none cursor-pointer accent-[#B8873B]"
          />
        </div>
      </div>

      {/* Meilensteine */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-2.5">
        <h3 className="text-xs font-bold text-[#3E2340]">
          Vermögensentwicklung im Zeitverlauf
        </h3>
        <div className="space-y-1.5">
          {milestones.map((m) => (
            <div
              key={m.jahre}
              className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                m.jahre === jahre ? "bg-[#B8873B]/15 font-bold" : "bg-[#F7F4F0]"
              }`}
            >
              <span className="text-[#3E2340]/80">{m.jahre} Jahre</span>
              <span className="text-[#3E2340]/60">Eingezahlt: {formatEuro(m.paid)}</span>
              <span className="font-bold text-[#3E2340]">{formatEuro(m.val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleApply}
          className="w-full min-h-[50px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Sparrate ({formatEuro(monatsrate)}/Monat) für Assetanalyse übernehmen</span>
          <ArrowRight className="w-4 h-4 text-[#B8873B]" />
        </button>

        <button
          type="button"
          onClick={onBackToStart}
          className="w-full py-2.5 text-xs text-[#3E2340]/70 hover:text-[#3E2340] font-medium text-center cursor-pointer transition-colors"
        >
          ← Zurück zur Startseite
        </button>
      </div>
    </div>
  );
}
