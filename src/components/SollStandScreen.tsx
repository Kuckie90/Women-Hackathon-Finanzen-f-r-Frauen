import { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  Clock,
  PiggyBank,
  CheckCircle2,
  ChevronRight,
  Sliders,
  RotateCcw,
  Info,
  Coins,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { Answers, PotAllocation, PotAllocationRanges, ProfileType } from "../types";
import {
  ZIELALLOKATION,
  ZIELALLOKATION_SPANNEN,
  calculateProfile,
  formatEuro,
} from "../constants/rules";
import { balanceAllocation } from "../utils/goalsAndPension";

interface SollStandScreenProps {
  answers: Answers;
  onUpdateAllocation: (allocation: PotAllocation | null) => void;
  onContinueToIst: () => void;
  onOpenGlossary?: (termKey: string) => void;
}

export function SollStandScreen({
  answers,
  onUpdateAllocation,
  onContinueToIst,
  onOpenGlossary,
}: SollStandScreenProps) {
  // 1. Profil & Soll-Allokation berechnen
  const breakdown = calculateProfile(answers);
  const profile: ProfileType = breakdown.finalProfile;
  const sollAllocation: PotAllocation = ZIELALLOKATION[profile];
  const sollSpannen: PotAllocationRanges = ZIELALLOKATION_SPANNEN[profile];

  // Aktive Allokation (falls schon adjustiert, ansonsten wissenschaftliche Empfehlung)
  const [allocation, setAllocation] = useState<PotAllocation>(
    answers.customAllocation || sollAllocation
  );

  const isCustomized =
    allocation.sicherheit !== sollAllocation.sicherheit ||
    allocation.wachstum !== sollAllocation.wachstum ||
    allocation.spielgeld !== sollAllocation.spielgeld;

  // Beispielrechnung / Anlagekapital zur Veranschaulichung "Wie viel Geld in welche Kategorie"
  const [kapitalBetrag, setKapitalBetrag] = useState<number>(
    answers.einmalbetrag > 0 ? answers.einmalbetrag : 10000
  );

  // Live Euro-Beträge für jeden Topf
  const euroSicherheit = Math.round((kapitalBetrag * allocation.sicherheit) / 100);
  const euroWachstum = Math.round((kapitalBetrag * allocation.wachstum) / 100);
  const euroSpielgeld = kapitalBetrag - euroSicherheit - euroWachstum;

  // Review-Slider Handler mit automatischer 100%-Ausbalancierung
  const handleSliderChange = (key: "sicherheit" | "wachstum" | "spielgeld", val: number) => {
    const balanced = balanceAllocation(key, val, allocation);
    setAllocation(balanced);
    onUpdateAllocation(balanced);
  };

  const handleResetToRecommendation = () => {
    setAllocation(sollAllocation);
    onUpdateAllocation(null);
  };

  return (
    <div
      id="soll-stand-screen"
      className="flex flex-col flex-1 px-4 pt-3 pb-8 space-y-5"
    >
      {/* Header Banner */}
      <div className="space-y-1.5 text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8873B]/10 text-[#B8873B] text-[11px] font-semibold tracking-wide">
          <Layers className="w-3.5 h-3.5" />
          <span>Schritt 1: Topfverteilungsvorschlag</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#3E2340]">
          Profil: {profile}
        </h1>
        <p className="text-xs text-[#3E2340]/75 max-w-[400px] mx-auto leading-relaxed">
          Basierend auf deinen Antworten ist dies dein <strong>wissenschaftlich empfohlener Topfverteilungsvorschlag</strong>.
          Überprüfe die Zuteilung und passe sie bei Bedarf selbstständig an deine Wünsche an.
        </p>
      </div>

      {/* Rechenbeispiel / Kapital-Eingabe */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#3E2340] flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#B8873B]" />
            <span>Wie viel Geld in welche Kategorie? (Anlagebetrag)</span>
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              step="500"
              value={kapitalBetrag}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setKapitalBetrag(isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-24 px-2 py-1 text-right text-xs font-bold text-[#3E2340] bg-[#F7F4F0] border border-[#E5DFD7] rounded-lg outline-hidden focus:border-[#B8873B]"
            />
            <span className="text-xs font-semibold text-[#3E2340]/60">€</span>
          </div>
        </div>

        {/* Quick-Buttons für Kapital */}
        <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto pb-0.5">
          {[2500, 5000, 10000, 25000, 50000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setKapitalBetrag(amt)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-all cursor-pointer ${
                kapitalBetrag === amt
                  ? "bg-[#3E2340] text-white border-[#3E2340]"
                  : "bg-[#F7F4F0] text-[#3E2340]/70 border-[#E5DFD7] hover:border-[#B8873B]"
              }`}
            >
              {formatEuro(amt)}
            </button>
          ))}
        </div>
      </div>

      {/* Soll-Allokations-Karten (Die 3 Töpfe mit Live-Euro) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Topf 1: Sicherheit */}
        <div
          id="soll-topf-1"
          className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
              <BuddhaIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
              Topf 1: Sicherheit
            </span>
            <span className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] block">
              {allocation.sicherheit} %
            </span>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] font-semibold text-[#B8873B]">
              Spannbreite: {sollSpannen.sicherheit.min}–{sollSpannen.sicherheit.max} %
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5DFD7]/60 text-[10px] text-[#3E2340]/70 leading-tight">
            Notgroschen & Tagesgeld
            {kapitalBetrag > 0 && (
              <span className="font-bold text-xs text-[#2E7D32] block pt-1">
                {formatEuro(euroSicherheit)}
              </span>
            )}
          </div>
        </div>

        {/* Topf 2: Wachstum */}
        <div
          id="soll-topf-2"
          className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#3E2340]" />
            </div>
            <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
              Topf 2: Wachstum
            </span>
            <span className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] block">
              {allocation.wachstum} %
            </span>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] font-semibold text-[#3E2340]">
              Spannbreite: {sollSpannen.wachstum.min}–{sollSpannen.wachstum.max} %
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5DFD7]/60 text-[10px] text-[#3E2340]/70 leading-tight">
            Welt-ETFs & Rente
            {kapitalBetrag > 0 && (
              <span className="font-bold text-xs text-[#3E2340] block pt-1">
                {formatEuro(euroWachstum)}
              </span>
            )}
          </div>
        </div>

        {/* Topf 3: Träume */}
        <div
          id="soll-topf-3"
          className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#B8873B]" />
            </div>
            <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
              Topf 3: Träume
            </span>
            <span className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] block">
              {allocation.spielgeld} %
            </span>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] font-semibold text-[#8A5E1E]">
              Spannbreite: {sollSpannen.spielgeld.min}–{sollSpannen.spielgeld.max} %
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5DFD7]/60 text-[10px] text-[#3E2340]/70 leading-tight">
            Wünsche & Freiheit
            {kapitalBetrag > 0 && (
              <span className="font-bold text-xs text-[#B8873B] block pt-1">
                {formatEuro(euroSpielgeld)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visueller Soll-Balken */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#3E2340]">
          <span className="font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#B8873B]" />
            <span>Aktuelle Zielverteilung</span>
          </span>
          <span className="text-[11px] text-[#3E2340]/70 font-semibold">100 %</span>
        </div>
        <div className="h-4 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${allocation.sicherheit}%` }}
            className="bg-[#2E7D32] h-full transition-all"
            title={`Topf 1 (Sicherheit): ${allocation.sicherheit}%`}
          />
          <div
            style={{ width: `${allocation.wachstum}%` }}
            className="bg-[#3E2340] h-full transition-all"
            title={`Topf 2 (Wachstum): ${allocation.wachstum}%`}
          />
          <div
            style={{ width: `${allocation.spielgeld}%` }}
            className="bg-[#B8873B] h-full transition-all"
            title={`Topf 3 (Träume): ${allocation.spielgeld}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#3E2340]/70 pt-0.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] inline-block" />
            <span>Topf 1 ({allocation.sicherheit}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3E2340] inline-block" />
            <span>Topf 2 ({allocation.wachstum}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8873B] inline-block" />
            <span>Topf 3 ({allocation.spielgeld}%)</span>
          </div>
        </div>
      </div>

      {/* Review-Möglichkeit & Selbstständige Adjustierung */}
      <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4 text-[#B8873B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8873B]">
                  Review & Feinabstimmung
                </span>
                {isCustomized ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#B8873B]/15 text-[#8A5E1E] uppercase">
                    Selbst adjustiert
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#2E7D32]/15 text-[#1B5E20] uppercase">
                    Empfehlung aktiv
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-[#3E2340]">
                Zuteilung in die Töpfe selbstständig anpassen
              </h3>
            </div>
          </div>

          {isCustomized && (
            <button
              type="button"
              onClick={handleResetToRecommendation}
              className="text-[11px] text-[#B8873B] hover:text-[#3E2340] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Zurücksetzen</span>
            </button>
          )}
        </div>

        <p className="text-xs text-[#3E2340]/75 leading-relaxed">
          Möchtest du mehr Sicherheit oder mehr Renditechancen? Verändere die Schieberegler ganz nach deinen Bedürfnissen – die Gesamtsumme gleicht sich automatisch auf 100 % aus:
        </p>

        {/* Sliders */}
        <div className="space-y-3 pt-1">
          {/* Slider 1: Sicherheit */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2E7D32] flex items-center gap-1">
                <span>Topf 1 (Sicherheit)</span>
              </span>
              <span className="font-serif font-bold text-sm text-[#3E2340]">
                {allocation.sicherheit} %
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={allocation.sicherheit}
              onChange={(e) => handleSliderChange("sicherheit", parseInt(e.target.value, 10))}
              className="w-full accent-[#2E7D32] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#3E2340]/50">
              <span>Empfohlener Korridor: {sollSpannen.sicherheit.min}–{sollSpannen.sicherheit.max} %</span>
              <span>{formatEuro(euroSicherheit)}</span>
            </div>
          </div>

          {/* Slider 2: Wachstum */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#3E2340] flex items-center gap-1">
                <span>Topf 2 (Wachstum)</span>
              </span>
              <span className="font-serif font-bold text-sm text-[#3E2340]">
                {allocation.wachstum} %
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={allocation.wachstum}
              onChange={(e) => handleSliderChange("wachstum", parseInt(e.target.value, 10))}
              className="w-full accent-[#3E2340] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#3E2340]/50">
              <span>Empfohlener Korridor: {sollSpannen.wachstum.min}–{sollSpannen.wachstum.max} %</span>
              <span>{formatEuro(euroWachstum)}</span>
            </div>
          </div>

          {/* Slider 3: Träume */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#8A5E1E] flex items-center gap-1">
                <span>Topf 3 (Träume)</span>
              </span>
              <span className="font-serif font-bold text-sm text-[#3E2340]">
                {allocation.spielgeld} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={allocation.spielgeld}
              onChange={(e) => handleSliderChange("spielgeld", parseInt(e.target.value, 10))}
              className="w-full accent-[#B8873B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#3E2340]/50">
              <span>Empfohlener Korridor: {sollSpannen.spielgeld.min}–{sollSpannen.spielgeld.max} %</span>
              <span>{formatEuro(euroSpielgeld)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Überleitung / Weiter zu Schritt 2: Bestehende Anlagen */}
      <div className="p-4 rounded-2xl bg-[#3E2340] text-[#F7F4F0] space-y-3 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8873B]">
            Nächster Schritt
          </span>
          <h2 className="font-serif text-lg font-bold text-[#F7F4F0]">
            Hast du bereits bestehende Anlagen?
          </h2>
          <p className="text-xs text-[#F7F4F0]/80 leading-relaxed">
            Im nächsten Schritt kannst du hochladen oder eintragen, was du bereits angelegt hast (Depotauszug, Tagesgeld, ETFs).
            Wir zeigen dir genau auf, in welche Töpfe deine aktuellen Anlagen fallen und wo Lücken bestehen.
          </p>
        </div>

        <button
          type="button"
          id="confirm-topfverteilung-btn"
          onClick={onContinueToIst}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#B8873B] hover:bg-[#A37530] active:scale-[0.99] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Zuteilung übernehmen & Bestehende Anlagen prüfen</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
