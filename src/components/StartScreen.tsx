import { TrendingUp, Sparkles, ArrowRight, Lock, Layers } from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";

interface StartScreenProps {
  onStart: () => void;
  onOpenArchitecture?: () => void;
}

export function StartScreen({ onStart, onOpenArchitecture }: StartScreenProps) {
  return (
    <div id="start-screen" className="flex flex-col flex-1 px-5 pt-3 pb-4">
      {/* Top badges */}
      <div className="flex items-center justify-between pt-1">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B8873B]/10 text-[#B8873B] text-[10px] font-semibold tracking-wide">
          <Lock className="w-3 h-3" />
          <span>100 % lokal & privat</span>
        </div>
        {onOpenArchitecture && (
          <button
            type="button"
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#1B5E20] text-[10px] font-semibold border border-[#2E7D32]/25 hover:bg-[#2E7D32]/15 cursor-pointer transition-colors"
          >
            <Layers className="w-3 h-3 text-[#2E7D32]" />
            <span>MVP: Asset Tool & Vision</span>
          </button>
        )}
      </div>

      {/* Visual Three Pots teaser */}
      <div className="my-auto py-3 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#3E2340]">
            FinWise
          </h1>
          <p className="text-sm md:text-base leading-snug text-[#3E2340]/85 font-normal max-w-xs mx-auto">
            Drei Töpfe. Wissenschaftlich fundierte Asset-Analyse & Beratung für dein Vermögen.
          </p>
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
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs text-[#3E2340]">
                    1. Sichere Anlagen
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#1B5E20]">
                    Fundament & Notgroschen
                  </span>
                </div>
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
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs text-[#3E2340]">
                    2. Risikoaffiner & Wachstumsstärker
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3E2340]/10 text-[#3E2340]">
                    Das Beet
                  </span>
                </div>
                <p className="text-[11px] text-[#3E2340]/75 leading-tight mt-0.5">
                  Breit gestreute Welt-Aktien & Gold. Höhere Schwankung, dafür substanziell wachstumsstärker – der Motor für langfristigen Vermögensaufbau & Rente.
                </p>
              </div>
            </div>
          </div>

          {/* Topf 3: Träume & Chancen */}
          <div className="p-3.5 rounded-2xl bg-[#B8873B]/10 border border-[#B8873B]/30 shadow-xs space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8873B] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs text-[#3E2340]">
                    3. Träume & Chancen
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#8A5E1E] border border-[#B8873B]/30">
                    Freiheit ohne Reue
                  </span>
                </div>
                <p className="text-[11px] text-[#3E2340]/85 leading-tight mt-0.5">
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
