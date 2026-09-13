import { useState } from "react";
import { ArrowRight, Sparkles, HelpCircle, CheckCircle2 } from "lucide-react";

interface VorfrageScreenProps {
  onSelectMode: (erfahren: boolean) => void;
}

export function VorfrageScreen({ onSelectMode }: VorfrageScreenProps) {
  // If user selected "Noch nicht", show the Erklär-Modus introduction card with the literal quote
  const [showExplainIntro, setShowExplainIntro] = useState(false);

  const handleChoice = (isExperienced: boolean) => {
    if (!isExperienced) {
      setShowExplainIntro(true);
    } else {
      onSelectMode(true);
    }
  };

  if (showExplainIntro) {
    return (
      <div
        id="explain-mode-intro-screen"
        className="flex flex-col flex-1 px-5 pt-3 pb-4"
      >
        <div className="my-auto py-2 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8873B]/15 text-[#B8873B] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Erklär-Modus aktiviert</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#3E2340] leading-snug">
            Die drei Gläser auf deinem Küchentisch
          </h2>

          {/* Literal Mandated Quote with updated clear pot definitions */}
          <div className="p-5 rounded-2xl bg-white/90 border border-[#B8873B]/30 shadow-xs space-y-3.5">
            <p className="text-sm md:text-base leading-relaxed text-[#3E2340]">
              Stell dir drei Gläser auf dem Küchentisch vor. Im{" "}
              <strong className="text-[#1B5E20] font-semibold">
                Sicherheits-Glas (Sichere Anlagen)
              </strong>{" "}
              liegt das Geld, das da sein muss, wenn morgen die Waschmaschine
              kaputtgeht – absolut risikofrei und sofort verfügbar. Das{" "}
              <strong className="text-[#3E2340] font-semibold">
                Wachstums-Glas (Risikoaffiner & Wachstumsstärker)
              </strong>{" "}
              ist dein Beet: Du säst heute, gießt regelmäßig und erntest in zehn
              oder zwanzig Jahren; Kursschwankungen werden durch die Zeit geglättet. Das{" "}
              <strong className="text-[#8A5E1E] font-semibold">
                Träume-Glas (Träume & Chancen)
              </strong>{" "}
              kann bei Gelingen für große Träume und Herzenswünsche genutzt werden — aber die eiserne Regel lautet:{" "}
              <strong className="text-[#3E2340]">
                Dieses Geld darf man unter keinen Umständen brauchen müssen!
              </strong>{" "}
              Ein Verlust bis zum Totalausfall darf dir wehtun, darf aber niemals deine Existenz gefährden. AnGelegt sagt dir, wie groß jedes Glas bei dir sein sollte.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EFECE6] border border-[#E5DFD7] text-xs text-[#3E2340]/80 space-y-1">
            <p className="font-semibold text-[#3E2340]">Was dich erwartet:</p>
            <p>
              Wir führen dich Schritt für Schritt durch die Fragen. Zu
              jedem Schritt findest du verständliche Erklärungen und kannst
              Fachbegriffe jederzeit antippen.
            </p>
          </div>
        </div>

        <div className="pt-3 pb-2">
          <button
            id="start-questions-explain-mode-btn"
            onClick={() => onSelectMode(false)}
            className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all"
          >
            <span>Weiter zu Frage 1</span>
            <ArrowRight className="w-5 h-5 text-[#B8873B]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="vorfrage-screen" className="flex flex-col flex-1 px-5 pt-4 pb-4">
      <div className="my-auto py-4 space-y-6">
        <div className="space-y-2 text-center">
          <span className="text-xs uppercase tracking-wider text-[#B8873B] font-bold">
            Vorfrage
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#3E2340]">
            Investierst du schon?
          </h2>
          <p className="text-sm text-[#3E2340]/75 max-w-xs mx-auto">
            Das steuert nur den Begleit-Ton und Erklärungen, niemals deine
            Zahlen oder die spätere Aufteilung.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            id="vorfrage-ja-btn"
            onClick={() => handleChoice(true)}
            className="w-full min-h-[64px] p-4 rounded-2xl bg-white border border-[#E5DFD7] hover:border-[#B8873B] hover:shadow-sm text-left flex items-center justify-between gap-3 active:scale-[0.99] transition-all group"
          >
            <div>
              <div className="font-semibold text-[#3E2340] text-base group-hover:text-[#B8873B] transition-colors">
                Ja, ich investiere bereits
              </div>
              <div className="text-xs text-[#3E2340]/60 mt-0.5">
                Kurzmodus: direkt durch die Fragen, ohne Grundlagen-Erklärungen.
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#3E2340]/40 group-hover:text-[#B8873B] shrink-0" />
          </button>

          <button
            id="vorfrage-nein-btn"
            onClick={() => handleChoice(false)}
            className="w-full min-h-[64px] p-4 rounded-2xl bg-white border border-[#E5DFD7] hover:border-[#B8873B] hover:shadow-sm text-left flex items-center justify-between gap-3 active:scale-[0.99] transition-all group"
          >
            <div>
              <div className="font-semibold text-[#3E2340] text-base group-hover:text-[#B8873B] transition-colors">
                Noch nicht
              </div>
              <div className="text-xs text-[#3E2340]/60 mt-0.5">
                Erklär-Modus: verständliche Hilfetexte und Antipp-Erklärungen für
                Begriffe.
              </div>
            </div>
            <HelpCircle className="w-5 h-5 text-[#3E2340]/40 group-hover:text-[#B8873B] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
