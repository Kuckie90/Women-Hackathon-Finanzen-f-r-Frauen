import { ShieldCheck, TrendingUp, Sparkles, ArrowRight, Lock } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div id="start-screen" className="flex flex-col flex-1 px-5 pt-4 pb-4">
      {/* Visual Three Pots teaser */}
      <div className="my-auto py-4 space-y-7">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8873B]/10 text-[#B8873B] text-xs font-semibold tracking-wide">
            <Lock className="w-3.5 h-3.5" />
            <span>100% lokal & privat</span>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#3E2340]">
            Topfgeld
          </h1>
          <p className="text-lg leading-snug text-[#3E2340]/80 font-normal max-w-xs mx-auto">
            Drei Töpfe. Acht Fragen. Dann weißt du, wie du dein Geld aufteilst.
          </p>
        </div>

        {/* Three Pots visual cards */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-[#E5DFD7] shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-[#3E2340]">1. Sicherheit</h2>
                <span className="text-[11px] text-[#3E2340]/60">Notgroschen</span>
              </div>
              <p className="text-xs text-[#3E2340]/70 truncate mt-0.5">
                Tagesgeld, Festgeld, Geldmarkt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-[#E5DFD7] shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-[#3E2340]">2. Wachstum</h2>
                <span className="text-[11px] text-[#B8873B] font-medium">Das Beet</span>
              </div>
              <p className="text-xs text-[#3E2340]/70 truncate mt-0.5">
                Breit gestreute Welt-Aktien & Gold
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-[#E5DFD7] shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#3E2340]/5 text-[#3E2340]/80 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-[#3E2340]">3. Spielgeld</h2>
                <span className="text-[11px] text-[#3E2340]/60">Experimente</span>
              </div>
              <p className="text-xs text-[#3E2340]/70 truncate mt-0.5">
                Krypto, Einzelwerte & Themen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button & Note */}
      <div className="pt-3 pb-2 space-y-2 text-center">
        <button
          id="start-button"
          onClick={onStart}
          className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all"
        >
          <span>Los geht&apos;s</span>
          <ArrowRight className="w-5 h-5 text-[#B8873B]" />
        </button>
        <p className="text-xs text-[#3E2340]/65">
          Dauert zwei Minuten. Nichts wird gespeichert.
        </p>
      </div>
    </div>
  );
}
