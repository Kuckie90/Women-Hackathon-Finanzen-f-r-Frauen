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
    initialNettoeinkommen ? initialNettoeinkommen.toString() : ""
  );
  const [einmal, setEinmal] = useState<string>(
    initialEinmalbetrag > 0 ? initialEinmalbetrag.toString() : ""
  );

  // Initial monthly rate: no prepopulated default, user inputs own values
  const [monat, setMonat] = useState<string>(() => {
    if (initialMonatsrate > 0) return initialMonatsrate.toString();
    if (monatlicheSparrateFuerRente && monatlicheSparrateFuerRente > 0) {
      return monatlicheSparrateFuerRente.toString();
    }
    return "";
  });

  // Track which basis is selected in rechner mode
  const [rechnerTarget, setRechnerTarget] = useState<"quote" | "rente">(
    monatlicheSparrateFuerRente && monatlicheSparrateFuerRente > 0 ? "rente" : "quote"
  );

  const handleCleanNumberInput = (raw: string, setter: (val: string) => void) => {
    if (raw === "") {
      setter("");
      return;
    }
    const digits = raw.replace(/\D/g, "");
    const cleaned = digits.replace(/^0+(?=\d)/, "");
    setter(cleaned);
  };

  // Suggested calculation based on 15% rule of thumb
  const calcNetto = parseFloat(nettoInput.replace(",", ".")) || 0;
  const suggestedRate = Math.max(50, Math.round((calcNetto * 0.15) / 10) * 10);
  const rentenRate = monatlicheSparrateFuerRente ? Math.round(monatlicheSparrateFuerRente) : 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const einmalNum = Math.max(0, parseFloat(einmal.replace(",", ".")) || 0);
    const monatNum = Math.max(0, parseFloat(monat.replace(",", ".")) || 0);

    onSubmit(einmalNum, monatNum, calcNetto > 0 ? calcNetto : undefined);
  };

  const quickMonatRates = [50, 100, 200, 350, 500, 750, 1000, 1500];

  return (
    <div id="question-8-screen" className="flex flex-col flex-1 px-5 pt-2 pb-4">
      <form onSubmit={handleSubmit} className="space-y-4 my-auto py-2">
        <div className="space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-[#B8873B] font-bold">
            Dein Startkapital • Sparrate & Beträge
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Womit startest du?
          </h2>
          <p className="text-xs text-[#3E2340]/70">
            Trage ein, was du jetzt einmalig anlegen kannst oder monatlich zur Seite legen möchtest.
          </p>
        </div>

        {/* Mode Switcher: Rechner vs. Manuell */}
        <div className="grid grid-cols-2 p-1 bg-[#EFECE6] rounded-xl border border-[#E5DFD7] text-xs font-semibold">
          <button
            type="button"
            id="mode-rechner-btn"
            onClick={() => {
              setMode("rechner");
              if (rechnerTarget === "rente" && rentenRate > 0) {
                setMonat(rentenRate.toString());
              } else {
                setMonat(suggestedRate.toString());
              }
            }}
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
            className={`min-h-[38px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
          {/* Rechner-Option */}
          {mode === "rechner" ? (
            <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 space-y-3.5 shadow-xs">
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
                    type="text"
                    inputMode="numeric"
                    value={nettoInput}
                    placeholder="2500"
                    onChange={(e) => {
                      handleCleanNumberInput(e.target.value, setNettoInput);
                      const n = parseFloat(e.target.value.replace(/\D/g, "")) || 0;
                      const newSuggested = Math.max(50, Math.round((n * 0.15) / 10) * 10);
                      if (rechnerTarget === "quote") {
                        setMonat(newSuggested.toString());
                      }
                    }}
                    className="w-full min-h-[48px] pl-3.5 pr-12 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                  />
                  <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                    € Netto
                  </span>
                </div>
              </div>

              {/* Zwei klare Berechnungsvarianten: 15% Faustformel vs. Rentenlücke */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#3E2340]/70 block">
                  Wähle deine Ziel-Sparrate:
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {/* Option 1: 15% Faustformel */}
                  <button
                    type="button"
                    onClick={() => {
                      setRechnerTarget("quote");
                      setMonat(suggestedRate.toString());
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      rechnerTarget === "quote"
                        ? "bg-[#B8873B]/10 border-[#B8873B] ring-1 ring-[#B8873B]"
                        : "bg-[#F7F4F0] border-[#E5DFD7] hover:border-[#B8873B]/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#3E2340]">
                          15 % Faustformel
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#B8873B]/20 text-[#8F6526] font-semibold">
                          Empfohlen
                        </span>
                      </div>
                      <span className="text-[11px] text-[#3E2340]/70 block pt-0.5">
                        Gesunder Vermögensaufbau ohne Verzicht im Alltag
                      </span>
                    </div>
                    <span className="text-lg font-serif font-bold text-[#3E2340]">
                      {formatEuro(suggestedRate)} / Mon.
                    </span>
                  </button>

                  {/* Option 2: 10% Basis-Sparrate */}
                  <button
                    type="button"
                    onClick={() => {
                      setRechnerTarget("rente");
                      const rate10 = Math.max(25, Math.round((calcNetto * 0.10) / 10) * 10);
                      setMonat(rate10.toString());
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      rechnerTarget === "rente"
                        ? "bg-[#3E2340]/10 border-[#3E2340] ring-1 ring-[#3E2340]"
                        : "bg-[#F7F4F0] border-[#E5DFD7] hover:border-[#3E2340]/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#3E2340]">
                          10 % Basis-Quote
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3E2340]/10 text-[#3E2340] font-semibold">
                          Schonend
                        </span>
                      </div>
                      <span className="text-[11px] text-[#3E2340]/70 block pt-0.5">
                        Geringere Belastung bei höheren Fixkosten
                      </span>
                    </div>
                    <span className="text-lg font-serif font-bold text-[#3E2340]">
                      {formatEuro(Math.max(25, Math.round((calcNetto * 0.10) / 10) * 10))} / Mon.
                    </span>
                  </button>

                  {/* Hinweis auf das verknüpfte Altersvorsorge-Modul */}
                  <div className="p-2.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[11px] text-[#3E2340]/75 flex items-start gap-2 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8873B] shrink-0 mt-0.5" />
                    <span>
                      <strong>Modul-Verbindung:</strong> Deine exakte Rentenlücke und geförderte Altersvorsorge werden im separaten Modul <em>Altersvorsorge & Rentenlücke</em> berechnet (siehe Teaser in der Auswertung).
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1 pt-1 text-[#3E2340]/80">
                <span>Aktuell ausgewählte Sparrate:</span>
                <span className="text-sm font-bold text-[#3E2340]">
                  {formatEuro(parseFloat(monat) || 0)} / Monat
                </span>
              </div>
            </div>
          ) : (
            /* Manuelle Eingabe: Monatliche Sparrate */
            <div className="space-y-2 p-4 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-monatsrate"
                  className="block text-xs font-semibold text-[#3E2340]"
                >
                  Monatliche Sparrate
                </label>
                {rentenRate > 0 && (
                  <button
                    type="button"
                    onClick={() => setMonat(rentenRate.toString())}
                    className="text-[11px] font-bold text-[#2E7D32] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Rentenlücke ({formatEuro(rentenRate)}) übernehmen</span>
                  </button>
                )}
              </div>

              <div className="relative flex items-center">
                <input
                  id="input-monatsrate"
                  type="text"
                  inputMode="numeric"
                  placeholder="z. B. 250"
                  value={monat}
                  onChange={(e) => handleCleanNumberInput(e.target.value, setMonat)}
                  className="w-full min-h-[48px] pl-3.5 pr-14 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] focus:border-[#B8873B] text-[#3E2340] text-base font-medium outline-hidden"
                />
                <span className="absolute right-3.5 text-[#3E2340]/50 font-semibold pointer-events-none text-sm">
                  € / Mon.
                </span>
              </div>

              {/* Quick selectors bis zu hohen Sparraten */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase font-bold text-[#3E2340]/50 block">
                  Schnellauswahl:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickMonatRates.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setMonat(rate.toString())}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                        monat === rate.toString()
                          ? "bg-[#3E2340] text-white border-[#3E2340]"
                          : "bg-[#F7F4F0] text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
                      }`}
                    >
                      {rate} €
                    </button>
                  ))}
                  {rentenRate > 0 && (
                    <button
                      type="button"
                      onClick={() => setMonat(rentenRate.toString())}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-semibold transition-all cursor-pointer ${
                        monat === rentenRate.toString()
                          ? "bg-[#2E7D32] text-white border-[#2E7D32]"
                          : "bg-[#2E7D32]/10 text-[#1B5E20] border-[#2E7D32]/30 hover:bg-[#2E7D32]/20"
                      }`}
                    >
                      🎯 Rentenlücke ({rentenRate} €)
                    </button>
                  )}
                </div>
              </div>

              {rentenRate > 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-xs text-[#1B5E20] flex items-center justify-between">
                  <span>Zur vollständigen Deckung deiner Rentenlücke:</span>
                  <span className="font-bold text-sm">{formatEuro(rentenRate)} / Mon.</span>
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
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={einmal}
                onChange={(e) => handleCleanNumberInput(e.target.value, setEinmal)}
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
