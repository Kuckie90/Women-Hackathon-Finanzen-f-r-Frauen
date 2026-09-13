import {
  PieChart,
  Clock,
  Calculator,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export type StartModule = "assetanalyse" | "rentenluecke" | "haushaltsrechnung" | "sparplaner";

interface StartScreenProps {
  onSelectModule: (module: StartModule) => void;
}

export function StartScreen({ onSelectModule }: StartScreenProps) {
  const modules: {
    id: StartModule;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    badgeColor: "gold" | "green" | "purple" | "neutral";
    icon: typeof PieChart;
  }[] = [
    {
      id: "assetanalyse",
      title: "Assetanalyse",
      subtitle: "Drei-Töpfe-Strategie",
      description:
        "Wissenschaftlich fundierte Aufteilung deines Geldes auf Sicherheit, Wachstum & freie Chancen – abgestimmt auf deine Lebenslage.",
      badge: "Empfohlener Einstieg",
      badgeColor: "gold",
      icon: PieChart,
    },
    {
      id: "rentenluecke",
      title: "Rentenlücke",
      subtitle: "Gender Pension Gap schließen",
      description:
        "Berechne deine monatliche Versorgungslücke im Alter und die nötige Sparrate, um deinen heutigen Lebensstandard im Ruhestand zu sichern.",
      badge: "Altersvorsorge",
      badgeColor: "purple",
      icon: Clock,
    },
    {
      id: "haushaltsrechnung",
      title: "Haushaltsrechnung",
      subtitle: "50/30/20 Monatsbudget",
      description:
        "Einnahmen & Fixkosten gegenüberstellen, Sparpotenziale aufdecken und deinen monatlich freien Überschuss ermitteln.",
      badge: "Cashflow & Budget",
      badgeColor: "green",
      icon: Calculator,
    },
    {
      id: "sparplaner",
      title: "Sparplaner",
      subtitle: "Zinseszinseffekt visualisieren",
      description:
        "Erlebe, wie aus regelmäßigen monatlichen ETF-Sparraten über 5, 10, 20 oder 30 Jahre ein signifikantes Vermögen entsteht.",
      badge: "Zinseszinsrechner",
      badgeColor: "neutral",
      icon: TrendingUp,
    },
  ];

  return (
    <div id="start-screen" className="flex flex-col flex-1 px-5 pt-4 pb-6 space-y-5">
      {/* 1. Oben: Original Eulen-Logo (nicht verändert) & Titel */}
      <div className="text-center space-y-2 pt-1">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Angelegt Eule Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-3xl drop-shadow-sm"
          />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#3E2340]">
          Angelegt
        </h1>
        <div className="space-y-0.5">
          <p className="font-serif text-base sm:text-lg font-bold text-[#3E2340]">
            Leg an. Mit Plan.
          </p>
          <p className="text-xs text-[#3E2340]/75 max-w-xs mx-auto">
            Finanzielle Orientierung und Vermögensaufbau für Frauen.
          </p>
        </div>
      </div>

      {/* 2. Darunter 4 Modul-Karten mit Icons */}
      <div className="space-y-2.5 pt-1">
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
              <div className="w-11 h-11 rounded-xl bg-[#3E2340]/10 text-[#3E2340] group-hover:bg-[#3E2340] group-hover:text-[#F7F4F0] transition-colors flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0 pr-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
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

      {/* Fußnote */}
      <div className="pt-2 text-center">
        <p className="text-[11px] text-[#3E2340]/60">
          Unabhängig, werbefrei & wissenschaftlich fundiert. 100 % unverbindlich.
        </p>
      </div>
    </div>
  );
}
