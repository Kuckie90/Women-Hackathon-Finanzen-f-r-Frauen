import { useState } from "react";
import { ArrowRight, Leaf, Shield, Info } from "lucide-react";
import { NachhaltigkeitChoice, GreifbarChoice } from "../types";

interface OptionalQuestionsScreenProps {
  initialNachhaltigkeitScale: number;
  initialGreifbarScale: number;
  onSubmit: (
    nachhaltigkeitScale: number,
    greifbarScale: number,
    nachhaltigkeit: NachhaltigkeitChoice,
    greifbar: GreifbarChoice
  ) => void;
}

export function OptionalQuestionsScreen({
  initialNachhaltigkeitScale,
  initialGreifbarScale,
  onSubmit,
}: OptionalQuestionsScreenProps) {
  const [nachhaltigkeitScale, setNachhaltigkeitScale] = useState<number>(
    initialNachhaltigkeitScale || 5
  );
  const [greifbarScale, setGreifbarScale] = useState<number>(
    initialGreifbarScale || 5
  );

  const handleContinue = () => {
    const nachChoice: NachhaltigkeitChoice =
      nachhaltigkeitScale >= 6 ? "wichtig" : "egal";
    const greifChoice: GreifbarChoice =
      greifbarScale >= 6 ? "greifbar" : "egal";

    onSubmit(nachhaltigkeitScale, greifbarScale, nachChoice, greifChoice);
  };

  const getNachhaltigkeitLabel = (val: number) => {
    if (val <= 2) return "1–2: Reine Renditeorientierung, keine Kriterien";
    if (val <= 5) return "3–5: Pragmatisch – Standard-Weltportfolio";
    if (val <= 8) return "6–8: Wichtig – Gute ESG/SRI-Filterung";
    return "9–10: Höchste Priorität – Strikte Ausschlusskriterien";
  };

  const getGreifbarLabel = (val: number) => {
    if (val <= 2) return "1–2: Rein digital reicht (ETFs, Xetra-Gold, REITs)";
    if (val <= 5) return "3–5: Ausgewogen – Haptik nett, aber digital okay";
    if (val <= 8) return "6–8: Physischer Bezug geschätzt (z. B. Gold/Immobilie)";
    return "9–10: Physisches Gold zu Hause & greifbares Betreten essenziell";
  };

  return (
    <div
      id="optional-questions-screen"
      className="flex flex-col flex-1 px-5 pt-2 pb-4"
    >
      <div className="space-y-4 my-auto py-2">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B8873B]/10 text-[#B8873B] text-[11px] font-semibold tracking-wide">
            Freiwillige Präferenzen
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Zwei Feineinstellungen
          </h2>
          <p className="text-xs text-[#3E2340]/75">
            Auf einer Skala von 1 bis 10: Diese Werte bestimmen, welche
            konkreten Anlageformen dir in den Töpfen vorgeschlagen werden.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {/* Skala 1: Nachhaltigkeit */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#3E2340]">
                    1. Nachhaltigkeit & Ethik
                  </h3>
                  <p className="text-[11px] text-[#3E2340]/60">
                    ESG-Kriterien, Rüstungs- und Kohleausschluss
                  </p>
                </div>
              </div>
              <span className="text-base font-serif font-bold text-[#B8873B] px-2.5 py-0.5 rounded-full bg-[#B8873B]/10">
                {nachhaltigkeitScale} / 10
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1.5 pt-1">
              <input
                id="slider-nachhaltigkeit"
                type="range"
                min="1"
                max="10"
                step="1"
                value={nachhaltigkeitScale}
                onChange={(e) => setNachhaltigkeitScale(parseInt(e.target.value, 10))}
                className="w-full accent-[#B8873B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3E2340]/50 font-medium">
                <span>1 (Egal)</span>
                <span>5 (Mittel)</span>
                <span>10 (Strikt)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F7F4F0] text-xs text-[#3E2340] font-medium">
              {getNachhaltigkeitLabel(nachhaltigkeitScale)}
            </div>
          </div>

          {/* Skala 2: Haptische Sachwerte & Gold zu Hause */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#3E2340]">
                    2. Haptisch greifbare Werte
                  </h3>
                  <p className="text-[11px] text-[#3E2340]/60">
                    Physisches Gold zu Hause & echte Immobilien
                  </p>
                </div>
              </div>
              <span className="text-base font-serif font-bold text-[#3E2340] px-2.5 py-0.5 rounded-full bg-[#3E2340]/10">
                {greifbarScale} / 10
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1.5 pt-1">
              <input
                id="slider-greifbar"
                type="range"
                min="1"
                max="10"
                step="1"
                value={greifbarScale}
                onChange={(e) => setGreifbarScale(parseInt(e.target.value, 10))}
                className="w-full accent-[#3E2340] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3E2340]/50 font-medium">
                <span>1 (Rein digital)</span>
                <span>5 (Mittel)</span>
                <span>10 (Physisch essenziell)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F7F4F0] text-xs text-[#3E2340] font-medium">
              {getGreifbarLabel(greifbarScale)}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#EFECE6] border border-[#E5DFD7] flex items-start gap-2 text-xs text-[#3E2340]/75">
          <Info className="w-4 h-4 text-[#B8873B] shrink-0 mt-0.5" />
          <p>
            Grundsatz: Deine Angaben auf den Skalen ändern nur, welche Beispiele
            und Produktformen genannt werden — nie die Kernaufteilung der drei
            Töpfe.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            id="optional-continue-btn"
            onClick={handleContinue}
            className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Weiter zum Ist-Stand</span>
            <ArrowRight className="w-5 h-5 text-[#B8873B]" />
          </button>
        </div>
      </div>
    </div>
  );
}
