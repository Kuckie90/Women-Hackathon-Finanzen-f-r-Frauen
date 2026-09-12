import { Lock, Sparkles, TrendingUp, Shield, ArrowRight, ExternalLink } from "lucide-react";
import { formatEuro } from "../constants/rules";

interface PensionModuleTeaserProps {
  onOpenGlossary?: (term: string) => void;
}

export function PensionModuleTeaser({ onOpenGlossary }: PensionModuleTeaserProps) {
  return (
    <div
      id="pension-module-teaser-card"
      className="p-4 rounded-2xl bg-white border border-[#B8873B]/35 space-y-3.5 shadow-xs relative overflow-hidden"
    >
      {/* Subtle background decorative watermark */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#B8873B]/5 rounded-full blur-xl pointer-events-none" />

      {/* Header with module badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#8F6526]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F6526] bg-[#B8873B]/15 px-2 py-0.5 rounded-full">
                Modul-Verknüpfung • Mockup
              </span>
            </div>
            <h3 className="font-serif font-bold text-sm text-[#3E2340] pt-0.5">
              Modul: Altersvorsorge & Rentenlücke
            </h3>
          </div>
        </div>

        {onOpenGlossary && (
          <button
            type="button"
            onClick={() => onOpenGlossary("Rentenlücke")}
            className="text-[11px] font-semibold text-[#8F6526] hover:underline cursor-pointer shrink-0"
          >
            Glossar
          </button>
        )}
      </div>

      <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
        Die Assetanalyse liefert dir die ideale Allokation deiner Töpfe. Deine exakte persönliche 
        Rentenlücke (Wunschrente minus gesetzliche Rente, Gender Pension Gap) sowie die Optimierung mit dem 
        staatlichen <strong>Altersvorsorgedepot (Reform 2026)</strong> werden in diesem eigenständigen 
        Spezialmodul berechnet.
      </p>

      {/* Mockup Preview Visualizer (Demodarstellung des Zielmoduls) */}
      <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#3E2340]">
          <span className="flex items-center gap-1 text-[#8F6526]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Vorschau: Geplante Modul-Funktionen</span>
          </span>
          <span className="text-[10px] text-[#3E2340]/60 bg-white px-2 py-0.5 rounded-md border border-[#E5DFD7]">
            Demo-Entwurf
          </span>
        </div>

        {/* 3 Mockup feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
          <div className="p-2 rounded-lg bg-white border border-[#E5DFD7]/80 text-[10px] space-y-1">
            <span className="font-bold text-[#3E2340] block">1. Rentenlücke</span>
            <span className="text-[#3E2340]/70 block leading-tight">
              Berechnung der Nettolücke im Alter inkl. Inflation & Gender Pension Gap.
            </span>
            <span className="text-[#2E7D32] font-semibold block text-[9px]">
              Schnittstelle: Zielrate für Topf 2
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white border border-[#E5DFD7]/80 text-[10px] space-y-1">
            <span className="font-bold text-[#3E2340] block">2. Altersvorsorgedepot 2026</span>
            <span className="text-[#3E2340]/70 block leading-tight">
              Staatliche Förderung & steuerfreies Rebalancing ohne teure Beitragsgarantien.
            </span>
            <span className="text-[#8F6526] font-semibold block text-[9px]">
              Fokus: Welt-ETFs ab 2026
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white border border-[#E5DFD7]/80 text-[10px] space-y-1">
            <span className="font-bold text-[#3E2340] block">3. Frühstart-Rente</span>
            <span className="text-[#3E2340]/70 block leading-tight">
              Bundeszuschüsse für Kinder ab Alter 6 zur frühzeitigen Zinseszins-Nutzung.
            </span>
            <span className="text-[#3E2340]/60 font-semibold block text-[9px]">
              Familien-Vorsorge
            </span>
          </div>
        </div>
      </div>

      {/* Disabled / Ausgegrauter Button zur Demo-Verknüpfung wie gewünscht */}
      <div className="pt-1 space-y-1.5">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full min-h-[44px] rounded-xl bg-[#E5DFD7]/60 text-[#3E2340]/40 border border-[#D5CFC5] font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-70 shadow-none"
        >
          <Lock className="w-3.5 h-3.5 text-[#3E2340]/40" />
          <span>Modul öffnen: Rentenlücke & Altersvorsorge berechnen (In Vorbereitung)</span>
        </button>

        <p className="text-[10px] text-[#3E2340]/55 text-center leading-normal">
          🔒 Dieses Modul wird als eigenständige Plattform-Komponente bereitgestellt. Zur Demonstration der Modul-Verbindung hier ausgegraut dargestellt.
        </p>
      </div>
    </div>
  );
}
