import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { PufferChoice, SchuldenChoice } from "../types";

interface GateScreenProps {
  puffer: PufferChoice;
  schulden: SchuldenChoice;
  onProceed: () => void;
  onBackToAdjust: () => void;
}

export function GateScreen({
  puffer,
  schulden,
  onProceed,
  onBackToAdjust,
}: GateScreenProps) {
  const isPufferUnder3 = puffer === "unter3";
  const isSchuldenOver5 = schulden === "konsum_ueber5" || schulden === "ueber5";

  return (
    <div id="gate-screen" className="flex flex-col flex-1 px-5 pt-3 pb-4">
      <div className="space-y-5 my-auto py-2">
        <div className="w-14 h-14 rounded-2xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2 text-center">
          <span className="text-xs uppercase tracking-wider text-[#B8873B] font-bold">
            Sicherheit zuerst
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            Erst der Boden, dann der Aufbau
          </h2>
          <p className="text-xs text-[#3E2340]/70 max-w-xs mx-auto">
            Bevor du Geld anlegst, muss deine finanzielle Basis tragfähig sein.
          </p>
        </div>

        {/* The Mandated Gate Messages */}
        <div className="space-y-3 pt-1">
          {isPufferUnder3 && (
            <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#B8873B]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Zu kleiner Notgroschen</span>
              </div>
              <p className="text-sm leading-relaxed text-[#3E2340] font-medium">
                Bevor du anlegst, gehören 3 Monatsausgaben auf ein
                Tagesgeldkonto. Sonst musst du im schlechtesten Moment verkaufen.
              </p>
            </div>
          )}

          {isSchuldenOver5 && (
            <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#B8873B]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Teure Konsumschulden vorhanden</span>
              </div>
              <p className="text-sm leading-relaxed text-[#3E2340] font-medium">
                Ein Konsumkredit oder Dispo über 5 % Zinsen kostet dich sicher,
                was ein Depot nur vielleicht bringt. Erst Konsumschulden tilgen,
                dann anlegen. (Planmäßige Baukredite für Immobilien sind hiervon
                nicht betroffen.)
              </p>
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-[#EFECE6] border border-[#E5DFD7] text-xs text-[#3E2340]/80">
          <p className="leading-relaxed">
            Wir empfehlen, die ersten monatlichen Raten vollständig in den
            Sicherheits-Puffer oder die Kredittilgung zu stecken, bevor das
            Wachstums-Glas befüllt wird.
          </p>
        </div>
      </div>

      <div className="pt-3 space-y-2">
        <button
          type="button"
          id="gate-proceed-btn"
          onClick={onProceed}
          className="w-full min-h-[52px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Trotzdem weiterschauen</span>
          <ArrowRight className="w-4 h-4 text-[#B8873B]" />
        </button>

        <button
          type="button"
          id="gate-adjust-btn"
          onClick={onBackToAdjust}
          className="w-full min-h-[44px] text-center text-xs font-medium text-[#3E2340]/70 hover:text-[#3E2340] transition-colors cursor-pointer"
        >
          Antworten anpassen
        </button>
      </div>
    </div>
  );
}
