import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { AngelegtLogo } from "./AngelegtLogo";

interface StartScreenProps {
  onStart: () => void;
  onOpenArchitecture?: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div id="start-screen" className="flex flex-col flex-1 px-5 pt-3 pb-4">
      {/* Visual Three Pots teaser */}
      <div className="my-auto py-3 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AngelegtLogo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-sm" />
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#3E2340]">
            Angelegt
          </h1>
          <div className="space-y-1">
            <p className="font-serif text-lg sm:text-xl font-bold text-[#3E2340]">
              Leg an. Mit Plan.
            </p>
            <p className="text-xs sm:text-sm leading-snug text-[#3E2340]/80 font-normal max-w-xs mx-auto">
              Asset Analyse & Orientierung für dein Vermögen
            </p>
          </div>
        </div>

        {/* Three Pots visual cards with crystal clear descriptions */}
        <div className="space-y-2.5">
          {/* Topf 1: Sicherheit */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                <BuddhaIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-xs text-[#3E2340]">
                  1. Sicherheit
                </h2>
                <p className="text-[11px] text-[#3E2340]/75 leading-tight mt-0.5">
                  Absolute Stabilität, garantierte Liquidität und null Kursrisiko für den Notfall und planbare Ausgaben – z. B. Tagesgeld, Festgeld und Geldmarkt.
                </p>
              </div>
            </div>
          </div>

          {/* Topf 2: Wachstum */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-[#3E2340]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-xs text-[#3E2340]">
                  2. Wachstum
                </h2>
                <p className="text-[11px] text-[#3E2340]/75 leading-tight mt-0.5">
                  Höhere Wertschwankungen, dafür langfristig die stärkste Rendite als Motor für Vermögensaufbau & Rente – z. B. breit gestreute Welt-Aktien und Gold.
                </p>
              </div>
            </div>
          </div>

          {/* Topf 3: Träume & Chancen */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#B8873B]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-xs text-[#3E2340]">
                  3. Träume & Chancen
                </h2>
                <p className="text-[11px] text-[#3E2340]/75 leading-tight mt-0.5">
                  Freies Risikokapital: Ein Verlust gefährdet weder Alltag noch Rente, bringt dir bei Erfolg aber maximale Freiheit für große Lebensziele – z. B. Zukunftstrends, Einzelaktien, Krypto oder Start-ups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button & Note */}
      <div className="pt-2 pb-2 space-y-2 text-center">
        <button
          id="start-button"
          onClick={onStart}
          className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Asset-Analyse starten</span>
          <ArrowRight className="w-5 h-5 text-[#B8873B]" />
        </button>
        <p className="text-xs text-[#3E2340]/65">
          Dauert ca. 2 Minuten. Keine Registrierung, 100 % unverbindlich.
        </p>
      </div>
    </div>
  );
}
