import { useState } from "react";
import { Sliders, RotateCcw, Sparkles, TrendingUp, Check } from "lucide-react";
import { PotAllocation, PotAllocationRanges, ProfileType } from "../types";
import { balanceAllocation } from "../utils/goalsAndPension";

interface PotCustomizerProps {
  recommendedAllocation: PotAllocation;
  recommendedRanges?: PotAllocationRanges;
  currentAllocation: PotAllocation;
  profileName: ProfileType;
  onChangeAllocation: (allocation: PotAllocation | null) => void;
}

export function PotCustomizer({
  recommendedAllocation,
  recommendedRanges,
  currentAllocation,
  profileName,
  onChangeAllocation,
}: PotCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isCustom =
    currentAllocation.sicherheit !== recommendedAllocation.sicherheit ||
    currentAllocation.wachstum !== recommendedAllocation.wachstum ||
    currentAllocation.spielgeld !== recommendedAllocation.spielgeld;

  const handleSliderChange = (
    key: "sicherheit" | "wachstum" | "spielgeld",
    val: number
  ) => {
    const balanced = balanceAllocation(key, val, currentAllocation);
    onChangeAllocation(balanced);
  };

  const handleQuickAdjust = (type: "sicherheit_plus" | "wachstum_plus") => {
    if (type === "sicherheit_plus") {
      const newSich = Math.min(85, currentAllocation.sicherheit + 10);
      handleSliderChange("sicherheit", newSich);
    } else {
      const newWachs = Math.min(85, currentAllocation.wachstum + 10);
      handleSliderChange("wachstum", newWachs);
    }
  };

  return (
    <div
      id="pot-customizer-section"
      className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8873B] block">
                Feinabstimmung
              </span>
              {isCustom ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#B8873B]/15 text-[#8A5E1E] uppercase">
                  Händisch angepasst
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#2E7D32]/15 text-[#1B5E20] uppercase">
                  Empfehlung aktiv
                </span>
              )}
            </div>
            <h4 className="font-bold text-xs text-[#3E2340]">
              Töpfe-Aufteilung händisch anpassen
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-[#B8873B] hover:text-[#3E2340] cursor-pointer px-2 py-1 rounded-lg border border-[#E5DFD7] hover:border-[#B8873B] transition-all"
        >
          {isOpen ? "Zuklappen" : "Anpassen"}
        </button>
      </div>

      <div className="text-xs text-[#3E2340]/75 space-y-1 leading-relaxed">
        <p>
          Deine berechnete Empfehlung (Profil: <strong>{profileName}</strong>) lautet{" "}
          <strong>
            {recommendedAllocation.sicherheit} % Sicherheit /{" "}
            {recommendedAllocation.wachstum} % Wachstum /{" "}
            {recommendedAllocation.spielgeld} % Träume
          </strong>
          . Du kannst die Verteilung jederzeit nach deinem persönlichen Bauchgefühl justieren.
        </p>
        {recommendedRanges && (
          <p className="text-[11px] text-[#3E2340]/60">
            Empfohlene BaFin-konforme Korridore: Sicherheit {recommendedRanges.sicherheit.min}–{recommendedRanges.sicherheit.max} %, Wachstum {recommendedRanges.wachstum.min}–{recommendedRanges.wachstum.max} %, Träume {recommendedRanges.spielgeld.min}–{recommendedRanges.spielgeld.max} %.
          </p>
        )}
      </div>

      {isOpen && (
        <div className="pt-2 space-y-4 border-t border-[#E5DFD7]/70">
          {/* Slider 1: Sicherheit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#3E2340]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                Topf 1: Sichere Anlagen (Sicherheit / Fundament)
              </span>
              <span className="font-bold font-serif text-sm">
                {currentAllocation.sicherheit} %
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={currentAllocation.sicherheit}
              onChange={(e) =>
                handleSliderChange("sicherheit", parseInt(e.target.value))
              }
              className="w-full accent-[#2E7D32] cursor-pointer h-2 bg-[#E5DFD7] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#3E2340]/50">
              <span>Wenig Puffer (10 %)</span>
              <span>Viel Puffer (80 %)</span>
            </div>
          </div>

          {/* Slider 2: Wachstum */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#3E2340]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3E2340]" />
                Topf 2: Risikoaffiner & Wachstumsstärker (Wachstum)
              </span>
              <span className="font-bold font-serif text-sm">
                {currentAllocation.wachstum} %
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="85"
              step="5"
              value={currentAllocation.wachstum}
              onChange={(e) =>
                handleSliderChange("wachstum", parseInt(e.target.value))
              }
              className="w-full accent-[#3E2340] cursor-pointer h-2 bg-[#E5DFD7] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#3E2340]/50">
              <span>Konservativ (10 %)</span>
              <span>Max. Rendite (85 %)</span>
            </div>
          </div>

          {/* Slider 3: Träume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#3E2340]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8873B]" />
                Topf 3: Träume & Chancen (Darf man nicht brauchen müssen!)
              </span>
              <span className="font-bold font-serif text-sm">
                {currentAllocation.spielgeld} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={currentAllocation.spielgeld}
              onChange={(e) =>
                handleSliderChange("spielgeld", parseInt(e.target.value))
              }
              className="w-full accent-[#B8873B] cursor-pointer h-2 bg-[#E5DFD7] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#3E2340]/50">
              <span>Keine Träume-Quote (0 %)</span>
              <span>Chancen-Budget (30 %)</span>
            </div>
          </div>

          {/* Schnellauswahl & Reset */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickAdjust("sicherheit_plus")}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-[#E5DFD7] bg-[#F7F4F0] text-[#3E2340] hover:border-[#B8873B] cursor-pointer"
            >
              +10 % Sicherheit
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdjust("wachstum_plus")}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-[#E5DFD7] bg-[#F7F4F0] text-[#3E2340] hover:border-[#B8873B] cursor-pointer"
            >
              +10 % Wachstum
            </button>
            {isCustom && (
              <button
                type="button"
                onClick={() => onChangeAllocation(null)}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-[#C44D34]/30 bg-[#C44D34]/10 text-[#C44D34] font-semibold hover:bg-[#C44D34]/20 flex items-center gap-1 cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Auf Empfehlung zurücksetzen</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
