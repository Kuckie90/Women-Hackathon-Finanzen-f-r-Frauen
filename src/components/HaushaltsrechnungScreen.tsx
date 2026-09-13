import { useState } from "react";
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  Wallet,
  Home,
  ShoppingBag,
  Info,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { formatEuro } from "../constants/rules";

interface HaushaltsrechnungScreenProps {
  initialNetto?: number;
  onApplySavingsRate: (monatsrate: number, nettoeinkommen: number) => void;
  onOpenSparplaner?: (monatsrate: number) => void;
  onBackToStart: () => void;
}

export function HaushaltsrechnungScreen({
  initialNetto,
  onApplySavingsRate,
  onOpenSparplaner,
  onBackToStart,
}: HaushaltsrechnungScreenProps) {
  // Einnahmen
  const [gehaltNetto, setGehaltNetto] = useState<number>(initialNetto || 2800);
  const [nebenEinkommen, setNebenEinkommen] = useState<number>(0);

  // Fixkosten (50% Grundbedürfnisse)
  const [wohnenWarm, setWohnenWarm] = useState<number>(950);
  const [stromInternet, setStromInternet] = useState<number>(120);
  const [versicherungen, setVersicherungen] = useState<number>(90);
  const [mobilitaet, setMobilitaet] = useState<number>(80);

  // Variable Kosten (30% Wünsche / Alltag)
  const [lebensmittelAlltag, setLebensmittelAlltag] = useState<number>(450);
  const [freizeitAusgehen, setFreizeitAusgehen] = useState<number>(300);
  const [abosShopping, setAbosShopping] = useState<number>(150);

  // Berechnungen
  const gesamtNetto = Math.max(0, gehaltNetto + nebenEinkommen);
  const gesamtFixkosten = wohnenWarm + stromInternet + versicherungen + mobilitaet;
  const gesamtVariable = lebensmittelAlltag + freizeitAusgehen + abosShopping;
  const gesamtAusgaben = gesamtFixkosten + gesamtVariable;
  const freierSparbetrag = Math.max(0, gesamtNetto - gesamtAusgaben);

  // 50/30/20 Vergleich
  const fixProzent = gesamtNetto > 0 ? Math.round((gesamtFixkosten / gesamtNetto) * 100) : 0;
  const varProzent = gesamtNetto > 0 ? Math.round((gesamtVariable / gesamtNetto) * 100) : 0;
  const sparProzent = gesamtNetto > 0 ? Math.round((freierSparbetrag / gesamtNetto) * 100) : 0;

  const targetFix = Math.round(gesamtNetto * 0.5);
  const targetVar = Math.round(gesamtNetto * 0.3);
  const targetSpar = Math.round(gesamtNetto * 0.2);

  const handleApply = () => {
    onApplySavingsRate(freierSparbetrag, gesamtNetto);
  };

  return (
    <div id="haushaltsrechnung-screen" className="flex flex-col flex-1 px-5 pt-3 pb-6 space-y-5">
      {/* Title Header */}
      <div className="space-y-1 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3E2340]/10 text-[#3E2340] text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Haushaltsrechner</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#3E2340]">
          Deine Haushaltsrechnung
        </h2>
        <p className="text-xs text-[#3E2340]/75 max-w-sm mx-auto">
          Ermittle deinen monatlichen finanziellen Spielraum und die ideale Sparrate nach der bewährten 50/30/20-Regel.
        </p>
      </div>

      {/* 1. Einnahmen */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#3E2340]">
              Monatliche Netto-Einnahmen
            </h3>
          </div>
          <span className="text-sm font-bold text-[#2E7D32]">
            {formatEuro(gesamtNetto)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#3E2340]/70 block">
              Gehalt / Haupteinkommen
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={50}
                value={gehaltNetto || ""}
                onChange={(e) => setGehaltNetto(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#3E2340]/70 block">
              Kindergeld / Nebenjob / Boni
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={25}
                value={nebenEinkommen || ""}
                onChange={(e) => setNebenEinkommen(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-3 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fixkosten (50% Grundbedürfnisse) */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#3E2340]">
                Fixkosten (Grundbedürfnisse)
              </h3>
              <span className="text-[10px] text-[#3E2340]/60">
                Richtwert 50 %: ca. {formatEuro(targetFix)}
              </span>
            </div>
          </div>
          <span className="text-sm font-bold text-[#3E2340]">
            {formatEuro(gesamtFixkosten)} ({fixProzent} %)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#3E2340]/70 block">
              Wohnen (Warmmiete / Rate)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={25}
                value={wohnenWarm || ""}
                onChange={(e) => setWohnenWarm(Number(e.target.value))}
                className="w-full min-h-[38px] px-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#3E2340]/70 block">
              Strom, Gas & Internet
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={10}
                value={stromInternet || ""}
                onChange={(e) => setStromInternet(Number(e.target.value))}
                className="w-full min-h-[38px] px-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#3E2340]/70 block">
              Versicherungen (Haftpfl., BU)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={10}
                value={versicherungen || ""}
                onChange={(e) => setVersicherungen(Number(e.target.value))}
                className="w-full min-h-[38px] px-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#3E2340]/70 block">
              Mobilität (ÖPNV / Auto)
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={10}
                value={mobilitaet || ""}
                onChange={(e) => setMobilitaet(Number(e.target.value))}
                className="w-full min-h-[38px] px-3 pr-7 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-2.5 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Variable Ausgaben (30% Wünsche / Lifestyle) */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#B8873B]/15 text-[#8A5E1E] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#3E2340]">
                Variable Ausgaben (Wünsche & Alltag)
              </h3>
              <span className="text-[10px] text-[#3E2340]/60">
                Richtwert 30 %: ca. {formatEuro(targetVar)}
              </span>
            </div>
          </div>
          <span className="text-sm font-bold text-[#3E2340]">
            {formatEuro(gesamtVariable)} ({varProzent} %)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#3E2340]/70 block">
              Lebensmittel
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={25}
                value={lebensmittelAlltag || ""}
                onChange={(e) => setLebensmittelAlltag(Number(e.target.value))}
                className="w-full min-h-[38px] px-2.5 pr-6 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-2 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#3E2340]/70 block">
              Freizeit / Gastro
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={25}
                value={freizeitAusgehen || ""}
                onChange={(e) => setFreizeitAusgehen(Number(e.target.value))}
                className="w-full min-h-[38px] px-2.5 pr-6 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-2 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-[#3E2340]/70 block">
              Shopping / Abos
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={0}
                step={10}
                value={abosShopping || ""}
                onChange={(e) => setAbosShopping(Number(e.target.value))}
                className="w-full min-h-[38px] px-2.5 pr-6 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-xs font-semibold text-[#3E2340] outline-hidden focus:border-[#B8873B]"
              />
              <span className="absolute right-2 text-xs text-[#3E2340]/50 pointer-events-none">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Auswertung: 50/30/20 & Freie Sparrate */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3E2340] to-[#251527] text-[#F7F4F0] shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B8873B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#B8873B]">
              Dein monatlicher Überschuss
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
            {sparProzent} % Sparquote
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
          <div>
            <div className="font-serif text-3xl font-bold text-[#F7F4F0]">
              {formatEuro(freierSparbetrag)}
            </div>
            <div className="text-[11px] text-[#F7F4F0]/75">
              Jeden Monat frei zum Sparen & Anlegen
            </div>
          </div>
          <div className="text-right text-[11px] text-[#F7F4F0]/70">
            <div>50/30/20 Richtwert:</div>
            <div className="font-bold text-[#B8873B] text-sm">{formatEuro(targetSpar)} (20 %)</div>
          </div>
        </div>

        {/* 50/30/20 Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-[#F7F4F0]/80 font-medium">
            <span>Fix: {fixProzent}%</span>
            <span>Wünsche: {varProzent}%</span>
            <span>Sparen: {sparProzent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, fixProzent)}%` }}
              className="h-full bg-[#E5DFD7]/80 transition-all"
              title="Fixkosten"
            />
            <div
              style={{ width: `${Math.min(100, varProzent)}%` }}
              className="h-full bg-[#B8873B]/80 transition-all"
              title="Wünsche"
            />
            <div
              style={{ width: `${Math.min(100, sparProzent)}%` }}
              className="h-full bg-[#2E7D32] transition-all"
              title="Freier Sparbetrag"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleApply}
          className="w-full min-h-[50px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Sparrate ({formatEuro(freierSparbetrag)}) für Assetanalyse übernehmen</span>
          <ArrowRight className="w-4 h-4 text-[#B8873B]" />
        </button>

        {onOpenSparplaner && (
          <button
            type="button"
            onClick={() => onOpenSparplaner(freierSparbetrag)}
            className="w-full min-h-[46px] rounded-2xl bg-white border border-[#B8873B]/50 text-[#3E2340] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#B8873B]/10 active:scale-[0.99] transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#B8873B]" />
            <span>Zinseszins im Sparplaner berechnen ({formatEuro(freierSparbetrag)}/Monat)</span>
          </button>
        )}

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
