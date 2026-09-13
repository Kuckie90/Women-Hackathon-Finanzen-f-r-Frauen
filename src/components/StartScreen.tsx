import { useState } from "react";
import {
  PieChart,
  Clock,
  Calculator,
  TrendingUp,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";

export type StartModule = "assetanalyse" | "rentenluecke" | "haushaltsrechnung" | "sparplaner";

interface StartScreenProps {
  onSelectModule: (module: StartModule) => void;
}

export function StartScreen({ onSelectModule }: StartScreenProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const modules = [
    {
      id: "assetanalyse" as const,
      number: "01",
      title: "Assetanalyse",
      subtitle: "Drei-Töpfe-Strategie",
      description:
        "Wissenschaftlich fundierte Aufteilung deines Geldes auf Sicherheit, Wachstum & freie Chancen – abgestimmt auf deine Lebenslage.",
      badge: "Empfohlener Einstieg",
      badgeColor: "gold" as const,
      icon: PieChart,
    },
    {
      id: "rentenluecke" as const,
      number: "02",
      title: "Rentenlücke",
      subtitle: "Gender Pension Gap",
      description:
        "Berechne deine monatliche Versorgungslücke im Alter und die nötige Sparrate, um deinen Lebensstandard im Ruhestand zu sichern.",
      badge: "Altersvorsorge",
      badgeColor: "purple" as const,
      icon: Clock,
    },
    {
      id: "haushaltsrechnung" as const,
      number: "03",
      title: "Haushaltsrechnung",
      subtitle: "50/30/20 Monatsbudget",
      description:
        "Einnahmen & Fixkosten gegenüberstellen, Sparpotenziale aufdecken und deinen monatlich freien Überschuss ermitteln.",
      badge: "Cashflow & Budget",
      badgeColor: "green" as const,
      icon: Calculator,
    },
    {
      id: "sparplaner" as const,
      number: "04",
      title: "Sparplaner",
      subtitle: "Zinseszinseffekt",
      description:
        "Erlebe, wie aus regelmäßigen monatlichen ETF-Sparraten über 5, 10, 20 oder 30 Jahre ein signifikantes Vermögen entsteht.",
      badge: "Zinseszinsrechner",
      badgeColor: "neutral" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div id="start-screen" className="flex flex-col flex-1 px-4 sm:px-5 pt-3 pb-6 space-y-4">
      {/* 1. Oben: Original Eulen-Logo (unverändert) & Titel */}
      <div className="text-center space-y-2 pt-2 pb-1">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Angelegt Eule Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl shadow-xs"
          />
        </div>
        <div className="space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#3E2340]">
            Angelegt
          </h1>
          <p className="text-xs sm:text-sm text-[#3E2340]/80 font-medium max-w-xs mx-auto leading-snug">
            Fundierte Finanzorientierung & Vermögensaufbau für Frauen
          </p>
        </div>
      </div>

      {/* 2. Darunter: 4 Module mit Icons */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3E2340]/70">
            Module wählen
          </span>
          <div className="flex items-center gap-1 bg-[#EFECE6] p-0.5 rounded-lg border border-[#E5DFD7]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#3E2340] shadow-2xs font-semibold"
                  : "text-[#3E2340]/60 hover:text-[#3E2340]"
              }`}
              title="Kachelansicht (4 Icons)"
              aria-label="Kachelansicht"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#3E2340] shadow-2xs font-semibold"
                  : "text-[#3E2340]/60 hover:text-[#3E2340]"
              }`}
              title="Listenansicht"
              aria-label="Listenansicht"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          /* 4 Icons im 2x2-Raster */
          <div className="grid grid-cols-2 gap-3">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  id={`module-btn-${mod.id}`}
                  onClick={() => onSelectModule(mod.id)}
                  className="p-4 rounded-2xl bg-white border border-[#E5DFD7] hover:border-[#B8873B] text-left transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.98] cursor-pointer group flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#3E2340]/10 text-[#3E2340] group-hover:bg-[#3E2340] group-hover:text-[#DDBB76] transition-colors flex items-center justify-center">
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className="text-[11px] font-bold text-[#3E2340]/35 group-hover:text-[#B8873B] transition-colors">
                        {mod.number}
                      </span>
                    </div>

                    <h2 className="font-serif text-base font-bold text-[#3E2340] group-hover:text-[#3E2340] transition-colors mt-3 leading-snug">
                      {mod.title}
                    </h2>
                    <p className="text-[11px] font-medium text-[#B8873B] mt-0.5 leading-tight">
                      {mod.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#3E2340]/60 group-hover:text-[#3E2340] pt-2 border-t border-[#E5DFD7]/60 mt-3 transition-colors">
                    <span>Öffnen</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#3E2340]/40 group-hover:text-[#B8873B] transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Listenansicht mit 4 Icons */
          <div className="space-y-2.5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  id={`module-btn-${mod.id}`}
                  onClick={() => onSelectModule(mod.id)}
                  className="w-full p-4 rounded-2xl bg-white border border-[#E5DFD7] hover:border-[#B8873B] text-left transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.99] cursor-pointer group flex items-start gap-3.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#3E2340]/10 text-[#3E2340] group-hover:bg-[#3E2340] group-hover:text-[#DDBB76] transition-colors flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0 pr-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#3E2340]/40">
                          {mod.number}
                        </span>
                        <h2 className="font-serif text-base font-bold text-[#3E2340] group-hover:text-[#3E2340] transition-colors">
                          {mod.title}
                        </h2>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          mod.badgeColor === "gold"
                            ? "bg-[#B8873B]/15 text-[#8A5E1E]"
                            : mod.badgeColor === "green"
                            ? "bg-[#2E7D32]/15 text-[#1B5E20]"
                            : mod.badgeColor === "purple"
                            ? "bg-[#3E2340]/15 text-[#3E2340]"
                            : "bg-[#3E2340]/10 text-[#3E2340]"
                        }`}
                      >
                        {mod.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#3E2340]/75 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-[#3E2340]/30 group-hover:text-[#B8873B] shrink-0 self-center transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fußnote */}
      <div className="pt-2 text-center">
        <p className="text-[11px] text-[#3E2340]/60">
          Unabhängig, werbefrei & wissenschaftlich fundiert. 100 % unverbindlich.
        </p>
      </div>
    </div>
  );
}
