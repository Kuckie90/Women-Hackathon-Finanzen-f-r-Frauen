import { useState, FormEvent } from "react";
import { ArrowRight, Euro, Sparkles, Calculator, Sliders } from "lucide-react";
import { formatEuro } from "../constants/rules";

interface Question8BetraegeProps {
  initialEinmalbetrag: number;
  initialMonatsrate: number;
  initialNettoeinkommen?: number;
  monatlicheSparrateFuerRente?: number;
  onSubmit: (einmalbetrag: number, monatsrate: number, nettoeinkommen?: number) => void;
  isExplainMode: boolean;
}

export function Question8Betraege({
  initialEinmalbetrag,
  initialMonatsrate,
  initialNettoeinkommen,
  monatlicheSparrateFuerRente,
  onSubmit,
  isExplainMode,
}: Question8BetraegeProps) {
  const [mode, setMode] = useState<"rechner" | "manuell">(
    initialNettoeinkommen ? "rechner" : "manuell"
  );

  const [nettoInput, setNettoInput] = useState<string>(
    initialNettoeinkommen ? initialNettoeinkommen.toString() : "2500"
  );
  const [einmal, setEinmal] = useState<string>(
    initialEinmalbetrag > 0 ? initialEinmalbetrag.toString() : ""
  );
  const [monat, setMonat] = useState<string>(
    initialMonatsrate > 0 ? initialMonatsrate.toString() : "150"
  );

  // Suggested calculation based on 15% rule of thumb
  const calcNetto = parseFloat(nettoInput.replace(",", ".")) || 0;
  const suggestedRate = Math.max(50, Math.round((calcNetto * 0.15) / 10) * 10);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const einmalNum = Math.max(0, parseFloat(einmal.replace(",", ".")) || 0);
    const monatNum =
      mode === "rechner"
        ? suggestedRate
        : Math.max(0, parseFloat(monat.replace(",", ".")) || 0);

    onSubmit(einmalNum, monatNum, calcNetto > 0 ? calcNetto : undefined);
  };

  const quickMonatRates = [50, 100, 150, 250, 400];

  return (
    <div id="question-8-screen" className="flex flex-col flex-1 px-5 pt-2 pb-4">
      <form onSubmit={handleSubmit} className="space-y-4 my-auto py-2">
        <div className="space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-[#B8873B] font-bold">
            Frage 8 von 8
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Womit startest du?
          </h2>
          <p className="text-xs text-[#3E2340]/70">
            Trage ein, was du jetzt anlegen kannst oder monatlich zur Seite legen möchtest.
          </p>
        </div>

        {/* Mode Switcher: Rechner vs. Manuell */}
        <div className="grid grid-cols-2 p-1 bg-[#EFECE6] rounded-xl border border-[#E5DFD7] text-xs font-semibold">
          <button
            type="button"
            id="mode-rechner-btn"
            onClick={() => {
              setMode("rechner");
              setMonat(suggestedRate.toString());
            }}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === "rechner"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Sparrate berechnen</span>
          </button>
          <button
            type="button"
            id="mode-manuell-btn"
            onClick={() => setMode("manuell")}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === "manuell"
                ? "bg-[#3E2340] text-[#F7F4F0] shadow-xs"
                : "text-[#3E2340]/70 hover:text-[#3E2340]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Selbst festlegen</span>
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {/* Rechner-Option: Nettoeinkommen */}
          {mode === "rechner" ? (
            <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 space-y-3 shadow-xs">
              <div className="space-y-1">
                <label
                  htmlFor="input-nettoeinkommen"
                  className="block text-xs font-semibold text-[#3E2340]"
                >
                  Dein monatliches Nettoeinkommen (ca.)
                </label>
                <div className="relative flex items-center">
                  <input
                    id="input-nettoeinkommen"
                    type="number"
                    min="0"
                    step="50"
                    value={nettoInput}
                    onChange={(e) => {
                      setNettoInput(e.target.value);
                      const n = parseFloat(e.target.value) || 0;
                      setMonat(Math.max(50, Math.round((n * 0.15) / 10) * 10).toString());
                    }}
                    className="w-full min-h-[48px] pl-3.5 pr-10 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                  />
                  <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                    € Netto
                  </span>
                </div>
              </div>

              {/* Berechnete Empfehlung */}
              <div className="p-3 rounded-xl bg-[#B8873B]/10 border border-[#B8873B]/25 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#B8873B] block">
                    Empfohlene Sparrate (15 % Faustformel):
                  </span>
                  <span className="text-xs text-[#3E2340]/80">
                    Gesunder Vermögensaufbau ohne Verzicht
                  </span>
                </div>
                <span className="text-xl font-serif font-bold text-[#3E2340]">
                  {formatEuro(suggestedRate)}
                </span>
              </div>
            </div>
          ) : (
            /* Manuelle Eingabe: Monatliche Sparrate */
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-[#E5DFD7]">
              <label
                htmlFor="input-monatsrate"
                className="block text-xs font-semibold text-[#3E2340]"
              >
                Monatliche Sparrate
              </label>
              <div className="relative flex items-center">
                <input
                  id="input-monatsrate"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="z. B. 150"
                  value={monat}
                  onChange={(e) => setMonat(e.target.value)}
                  className="w-full min-h-[48px] pl-3.5 pr-10 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  € / Monat
                </span>
              </div>

              {/* Quick selectors */}
              <div className="flex items-center gap-1.5 pt-1.5 overflow-x-auto pb-1">
                {quickMonatRates.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setMonat(rate.toString())}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      monat === rate.toString()
                        ? "bg-[#3E2340] text-white border-[#3E2340]"
                        : "bg-white text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
                    }`}
                  >
                    {rate} €
                  </button>
                ))}
              </div>

              {monatlicheSparrateFuerRente && monatlicheSparrateFuerRente > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-xs text-[#1B5E20] flex items-center justify-between">
                  <span>Für deine Rentenlücke nötig:</span>
                  <span className="font-bold">{formatEuro(monatlicheSparrateFuerRente)} / Mon.</span>
                </div>
              )}
            </div>
          )}

          {/* Field 2: Einmalbetrag */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-[#E5DFD7]">
            <label
              htmlFor="input-einmalbetrag"
              className="block text-xs font-semibold text-[#3E2340]"
            >
              Einmalbetrag zum Start (optional)
            </label>
            <div className="relative flex items-center">
              <input
                id="input-einmalbetrag"
                type="number"
                min="0"
                step="50"
                placeholder="0"
                value={einmal}
                onChange={(e) => setEinmal(e.target.value)}
                className="w-full min-h-[48px] pl-3.5 pr-8 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
              />
              <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                €
              </span>
            </div>
            <p className="text-[11px] text-[#3E2340]/60">
              Geld, das heute bereitsteht (z. B. Steuerrückzahlung, Erspartes).
            </p>
          </div>
        </div>

        {isExplainMode && (
          <div className="p-3.5 rounded-2xl bg-[#EFECE6]/80 border border-[#E5DFD7] text-xs text-[#3E2340]/80 space-y-1">
            <p className="font-semibold text-[#B8873B] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Tipp zur Sparrate
            </p>
            <p>
              Anlegerinnen starten oft schon mit 50 € oder 100 € monatlich. Der
              wichtigste Hebel ist der frühe Beginn und die Disziplin der
              monatlichen Ausführung, nicht die Anfangshöhe.
            </p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            id="question-8-submit-btn"
            className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Weiter</span>
            <ArrowRight className="w-5 h-5 text-[#B8873B]" />
          </button>
        </div>
      </form>
    </div>
  );
}
