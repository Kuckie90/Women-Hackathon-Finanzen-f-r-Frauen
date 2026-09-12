import { useState } from "react";
import {
  ArrowRight,
  Leaf,
  Shield,
  Brain,
  Award,
  Smartphone,
  Info,
} from "lucide-react";
import {
  NachhaltigkeitChoice,
  GreifbarChoice,
  EntscheidungsStilChoice,
  MarkenPraeferenzChoice,
  TechAffinitaetChoice,
} from "../types";

interface OptionalQuestionsScreenProps {
  initialNachhaltigkeitScale: number;
  initialGreifbarScale: number;
  initialEntscheidungsStil?: EntscheidungsStilChoice;
  initialMarkenPraeferenz?: MarkenPraeferenzChoice;
  initialTechAffinitaet?: TechAffinitaetChoice;
  onSubmit: (
    nachhaltigkeitScale: number,
    greifbarScale: number,
    nachhaltigkeit: NachhaltigkeitChoice,
    greifbar: GreifbarChoice,
    entscheidungsStil: EntscheidungsStilChoice,
    markenPraeferenz: MarkenPraeferenzChoice,
    techAffinitaet: TechAffinitaetChoice
  ) => void;
}

export function OptionalQuestionsScreen({
  initialNachhaltigkeitScale,
  initialGreifbarScale,
  initialEntscheidungsStil,
  initialMarkenPraeferenz,
  initialTechAffinitaet,
  onSubmit,
}: OptionalQuestionsScreenProps) {
  const [nachhaltigkeitScale, setNachhaltigkeitScale] = useState<number>(
    initialNachhaltigkeitScale || 5
  );
  const [greifbarScale, setGreifbarScale] = useState<number>(
    initialGreifbarScale || 5
  );
  const [entscheidungsStil, setEntscheidungsStil] = useState<EntscheidungsStilChoice>(
    initialEntscheidungsStil || "ausgewogen"
  );
  const [markenPraeferenz, setMarkenPraeferenz] = useState<MarkenPraeferenzChoice>(
    initialMarkenPraeferenz || "welt_index"
  );
  const [techAffinitaet, setTechAffinitaet] = useState<TechAffinitaetChoice>(
    initialTechAffinitaet || "digital"
  );

  const handleContinue = () => {
    const nachChoice: NachhaltigkeitChoice =
      nachhaltigkeitScale >= 6 ? "wichtig" : "egal";
    const greifChoice: GreifbarChoice =
      greifbarScale >= 6 ? "greifbar" : "egal";

    onSubmit(
      nachhaltigkeitScale,
      greifbarScale,
      nachChoice,
      greifChoice,
      entscheidungsStil,
      markenPraeferenz,
      techAffinitaet
    );
  };

  const getNachhaltigkeitLabel = (val: number) => {
    if (val <= 2) return "1–2: Reine Marktrendite, keine ESG-Filterung";
    if (val <= 5) return "3–5: Pragmatisch – Standard-Weltportfolio (MSCI World)";
    if (val <= 8) return "6–8: Wichtig – Strikte ESG-/SRI-Filterung für saubere Werte";
    return "9–10: Höchste Priorität – Kompromisslose Ausschlusskriterien (Kohle, Waffen)";
  };

  const getGreifbarLabel = (val: number) => {
    if (val <= 2) return "1–2: Rein digital reicht vollkommen (ETFs, Xetra-Gold)";
    if (val <= 5) return "3–5: Ausgewogen – Digital ist praktisch, Haptik nett";
    if (val <= 8) return "6–8: Physischer Bezug geschätzt (physisches Gold, echte Immobilien)";
    return "9–10: Physisches Gold & anfassbare Werte zu Hause sind essenziell";
  };

  return (
    <div
      id="optional-questions-screen"
      className="flex flex-col flex-1 px-5 pt-2 pb-4"
    >
      <div className="space-y-4 my-auto py-2">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B8873B]/10 text-[#B8873B] text-[11px] font-semibold tracking-wide">
            Entscheidungsbaum & Feintuning
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Deine Anlegerinnen-Persönlichkeit
          </h2>
          <p className="text-xs text-[#3E2340]/75">
            Gemäß wissenschaftlichem Entscheidungsbaum: Verfeinere emotionale Präferenzen, Anfassbarkeit und Markenbezug.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Dimension: Rational vs. Emotional */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#3E2340]">
                  1. Rationale Daten vs. Bauchgefühl
                </h3>
                <p className="text-[10px] text-[#3E2340]/60">
                  Wie triffst du Finanzentscheidungen am liebsten?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setEntscheidungsStil("rational")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  entscheidungsStil === "rational"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Nüchterne Zahlen</span>
                <span className="block text-[9px] opacity-75">Statistik & Fakten</span>
              </button>

              <button
                type="button"
                onClick={() => setEntscheidungsStil("ausgewogen")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  entscheidungsStil === "ausgewogen"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Ausgewogen</span>
                <span className="block text-[9px] opacity-75">Kopf & Herz</span>
              </button>

              <button
                type="button"
                onClick={() => setEntscheidungsStil("emotional")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  entscheidungsStil === "emotional"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Gutes Gefühl</span>
                <span className="block text-[9px] opacity-75">Ruhiger Schlaf zählt</span>
              </button>
            </div>
          </div>

          {/* Dimension: Konkretheitsbedürfnis (Haptik & Gold) */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#3E2340]">
                    2. Konkretheitsbedürfnis (Anfassbare Werte)
                  </h3>
                  <p className="text-[10px] text-[#3E2340]/60">
                    Physisches Gold, echte Immobilien vs. reine Wertpapier-Depots
                  </p>
                </div>
              </div>
              <span className="text-xs font-serif font-bold text-[#B8873B] px-2 py-0.5 rounded-full bg-[#B8873B]/10">
                {greifbarScale} / 10
              </span>
            </div>

            <div className="space-y-1">
              <input
                id="slider-greifbar"
                type="range"
                min="1"
                max="10"
                step="1"
                value={greifbarScale}
                onChange={(e) => setGreifbarScale(parseInt(e.target.value, 10))}
                className="w-full accent-[#B8873B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3E2340]/50 font-medium">
                <span>1 (Rein digital)</span>
                <span>5 (Ausgewogen)</span>
                <span>10 (Physisch essenziell)</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#F7F4F0] text-[11px] text-[#3E2340] font-medium">
              {getGreifbarLabel(greifbarScale)}
            </div>
          </div>

          {/* Dimension: Markenpräferenz & Index-Offenheit */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#3E2340]">
                  3. Marken- & Produktpräferenz
                </h3>
                <p className="text-[10px] text-[#3E2340]/60">
                  Breite Indexfonds (MSCI World) vs. bekannte Alltagsmarken (Apple, SAP)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setMarkenPraeferenz("welt_index")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  markenPraeferenz === "welt_index"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Welt-Indexfonds</span>
                <span className="block text-[9px] opacity-75">Maximale Streuung</span>
              </button>

              <button
                type="button"
                onClick={() => setMarkenPraeferenz("offen")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  markenPraeferenz === "offen"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Index + Marken</span>
                <span className="block text-[9px] opacity-75">Kern-Satellit</span>
              </button>

              <button
                type="button"
                onClick={() => setMarkenPraeferenz("bekannte_marken")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  markenPraeferenz === "bekannte_marken"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Bekannte Marken</span>
                <span className="block text-[9px] opacity-75">Alltagsbezug</span>
              </button>
            </div>
          </div>

          {/* Dimension: Nachhaltigkeit (ESG/SRI) */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#3E2340]">
                    4. Nachhaltigkeit & Ethik
                  </h3>
                  <p className="text-[10px] text-[#3E2340]/60">
                    ESG-Filterung, Ausschluss von Rüstung & fossilen Energien
                  </p>
                </div>
              </div>
              <span className="text-xs font-serif font-bold text-[#2E7D32] px-2 py-0.5 rounded-full bg-[#2E7D32]/10">
                {nachhaltigkeitScale} / 10
              </span>
            </div>

            <div className="space-y-1">
              <input
                id="slider-nachhaltigkeit"
                type="range"
                min="1"
                max="10"
                step="1"
                value={nachhaltigkeitScale}
                onChange={(e) => setNachhaltigkeitScale(parseInt(e.target.value, 10))}
                className="w-full accent-[#2E7D32] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3E2340]/50 font-medium">
                <span>1 (Egal)</span>
                <span>5 (Mittel)</span>
                <span>10 (Strikt)</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#F7F4F0] text-[11px] text-[#3E2340] font-medium">
              {getNachhaltigkeitLabel(nachhaltigkeitScale)}
            </div>
          </div>

          {/* Dimension: Tech-Affinität */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#3E2340]">
                  5. Tech- & Broker-Präferenz
                </h3>
                <p className="text-[10px] text-[#3E2340]/60">
                  Wie führst du deine Konten und Depots am liebsten?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setTechAffinitaet("digital")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  techAffinitaet === "digital"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Smartphone-App</span>
                <span className="block text-[9px] opacity-75">Neobroker / Direkt</span>
              </button>

              <button
                type="button"
                onClick={() => setTechAffinitaet("gemischt")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  techAffinitaet === "gemischt"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Web & Direktbank</span>
                <span className="block text-[9px] opacity-75">ING / DKB / Comdirect</span>
              </button>

              <button
                type="button"
                onClick={() => setTechAffinitaet("klassisch")}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  techAffinitaet === "klassisch"
                    ? "bg-[#3E2340] text-white border-[#3E2340] font-bold"
                    : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                }`}
              >
                <span className="block font-semibold text-[11px]">Filiale / Ansprechp.</span>
                <span className="block text-[9px] opacity-75">Persönlicher Kontakt</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#EFECE6] border border-[#E5DFD7] flex items-start gap-2 text-xs text-[#3E2340]/75">
          <Info className="w-4 h-4 text-[#B8873B] shrink-0 mt-0.5" />
          <p>
            Diese Präferenzen personalisieren deine Auswertung und Produktbeispiele, verändern aber nicht eigenmächtig deine wissenschaftlich hergeleiteten Topf-Größen.
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
