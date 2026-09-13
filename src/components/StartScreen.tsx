import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";

interface StartScreenProps {
  onStart: () => void;
  onOpenArchitecture?: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div id="start-screen" className="flex flex-col flex-1 px-5 pt-3 pb-4">
      {/* Visual Three Pots teaser */}
      <div className="my-auto py-3 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#3E2340]">
            AnGelegt
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
          {/* Topf 1: Sichere Anlagen */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                <BuddhaIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-xs text-[#3E2340]">
                  1. Sichere Anlagen
                </h2>
                <p className="text-[11px] text-[#3E2340]/75 leading-tight mt-0.5">
                  Tagesgeld, Festgeld, Geldmarkt. Absolute Stabilität, garantierte Liquidität und null Kursrisiko für unvorhergesehene Ausgaben.
                </p>
              </div>
            </div>
          </div>

          {/* Topf 2: Risikoaffiner & Wachstumsstärker */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] shadow-xs space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-[#3E2340]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-xs text-[#3E2340]">
                  2. Risikoaffiner & Wachstumsstärker
                </h2>
                <p className="text-[11px] text-[#3E2340]/75 leading-tight mt-0.5">
                  Breit gestreute Welt-Aktien & Gold. Höhere Schwankung, dafür substanziell wachstumsstärker – der Motor für langfristigen Vermögensaufbau & Rente.
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
                  Kann bei Gelingen für Träume genutzt werden – <strong>das Geld darf man aber niemals brauchen müssen!</strong> Bis zum Totalverlust verkraftbar, für freie Chancen & Krypto.
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
