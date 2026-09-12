import { useState } from "react";
import { HelpCircle, Check, ArrowRight, Calendar, Clock, Briefcase } from "lucide-react";
import { QuestionDef } from "../data/questionsData";
import {
  UnterbrechungDetails,
  UnterbrechungWann,
  UnterbrechungDauer,
  UnterbrechungUmfang,
} from "../types";

interface QuestionScreenProps {
  question: QuestionDef;
  selectedValue?: string;
  onSelect: (val: string, extraDetails?: UnterbrechungDetails) => void;
  initialDetails?: UnterbrechungDetails;
  isExplainMode: boolean;
  onOpenGlossary: (termKey: string) => void;
}

export function QuestionScreen({
  question,
  selectedValue,
  onSelect,
  initialDetails,
  isExplainMode,
  onOpenGlossary,
}: QuestionScreenProps) {
  const [currentChoice, setCurrentChoice] = useState<string | undefined>(selectedValue);

  // Details for Auszeit / Stundenreduktion
  const [wann, setWann] = useState<UnterbrechungWann>(
    initialDetails?.wann || (selectedValue === "aktuell" ? "sofort" : "in_6_monaten")
  );
  const [dauer, setDauer] = useState<UnterbrechungDauer>(
    initialDetails?.dauer || "6_bis_12_monate"
  );
  const [umfang, setUmfang] = useState<UnterbrechungUmfang>(
    initialDetails?.umfang || "teilzeit_50"
  );

  const handleChoose = (val: string) => {
    setCurrentChoice(val);
    if (val === "aktuell" && wann !== "sofort") {
      setWann("sofort");
    }
  };

  const handleConfirm = () => {
    if (currentChoice) {
      if (
        question.key === "unterbrechung" &&
        (currentChoice === "ja" || currentChoice === "aktuell")
      ) {
        onSelect(currentChoice, { wann, dauer, umfang });
      } else {
        onSelect(currentChoice);
      }
    }
  };

  return (
    <div
      id={`question-screen-${question.id}`}
      className="flex flex-col flex-1 px-5 pt-2 pb-4"
    >
      <div className="space-y-4 my-auto py-2">
        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] leading-snug">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-sm text-[#3E2340]/70 font-normal">
              {question.subtitle}
            </p>
          )}
        </div>

        {/* Optional glossary pill for quick term explanation */}
        {isExplainMode && question.glossaryKey && (
          <button
            type="button"
            onClick={() => onOpenGlossary(question.glossaryKey!)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8873B]/10 hover:bg-[#B8873B]/20 text-[#B8873B] text-xs font-semibold transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Begriff erklären: {question.glossaryKey}</span>
          </button>
        )}

        {/* Options List - No default pre-selection */}
        <div className="space-y-2.5 pt-2">
          {question.options.map((opt) => {
            const isSelected = currentChoice === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                id={`option-${question.key}-${opt.value}`}
                onClick={() => handleChoose(opt.value)}
                className={`w-full min-h-[56px] px-4 py-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 active:scale-[0.99] transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340] shadow-md ring-2 ring-[#B8873B]/50"
                    : "bg-white text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]/60 hover:shadow-xs"
                }`}
              >
                <div className="flex-1 min-w-0 pr-1">
                  {opt.badge && (
                    <div className="mb-1">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isSelected
                            ? "bg-[#F7F4F0]/20 text-[#F7F4F0]"
                            : opt.badgeColor === "gold"
                            ? "bg-[#B8873B]/15 text-[#8A5E1E]"
                            : opt.badgeColor === "red"
                            ? "bg-[#C44D34]/15 text-[#9A341E]"
                            : opt.badgeColor === "green"
                            ? "bg-[#2E7D32]/15 text-[#1B5E20]"
                            : "bg-[#3E2340]/10 text-[#3E2340]"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                  )}
                  <div
                    className={`font-semibold text-base leading-snug ${
                      isSelected ? "text-[#F7F4F0]" : "text-[#3E2340]"
                    }`}
                  >
                    {opt.label}
                  </div>
                  {opt.description && (
                    <div
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-[#F7F4F0]/80" : "text-[#3E2340]/65"
                      }`}
                    >
                      {opt.description}
                    </div>
                  )}
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#B8873B] text-[#3E2340]"
                      : "border border-[#E5DFD7] text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Details zu Auszeit / Stundenreduktion, falls Ja oder Aktuell gewählt */}
        {question.key === "unterbrechung" &&
          (currentChoice === "ja" || currentChoice === "aktuell") && (
            <div
              id="unterbrechung-details-box"
              className="mt-4 p-4 rounded-2xl bg-[#F7F4F0] border border-[#B8873B]/40 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#3E2340] uppercase tracking-wider">
                    Details zu deiner Auszeit / Reduktion
                  </h4>
                  <p className="text-[11px] text-[#3E2340]/70">
                    Wichtig für Notgroschen-Größe und flexible Sparraten
                  </p>
                </div>
              </div>

              {/* 1. Wann */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E2340]">
                  <Clock className="w-3.5 h-3.5 text-[#B8873B]" />
                  <span>Wann steht die Veränderung an?</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "sofort", label: "Bereits jetzt / sofort" },
                    { value: "in_6_monaten", label: "In nächsten 6 Monaten" },
                    { value: "in_1_jahr", label: "In ca. 1 Jahr" },
                    { value: "in_2_bis_5_jahren", label: "In 2–5 Jahren" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setWann(item.value as UnterbrechungWann)}
                      className={`px-3 py-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                        wann === item.value
                          ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340] font-semibold shadow-xs"
                          : "bg-white text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Dauer */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E2340]">
                  <Calendar className="w-3.5 h-3.5 text-[#B8873B]" />
                  <span>Wie lange dauert die Phase voraussichtlich?</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "3_bis_6_monate", label: "3–6 Monate" },
                    { value: "6_bis_12_monate", label: "6–12 Monate (z. B. Elternzeit)" },
                    { value: "1_bis_2_jahre", label: "1–2 Jahre" },
                    { value: "dauerhaft", label: "Dauerhafte Teilzeit / länger" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDauer(item.value as UnterbrechungDauer)}
                      className={`px-3 py-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                        dauer === item.value
                          ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340] font-semibold shadow-xs"
                          : "bg-white text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Umfang / Art der Reduktion */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E2340]">
                  <Briefcase className="w-3.5 h-3.5 text-[#B8873B]" />
                  <span>Welche Reduktion steht an?</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "voll", label: "Vollständige Pause (100 %)" },
                    { value: "teilzeit_50", label: "Teilzeit (ca. 50 %)" },
                    { value: "teilzeit_75", label: "Teilzeit (ca. 75–80 %)" },
                    { value: "flexibel", label: "Noch offen / flexibel" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setUmfang(item.value as UnterbrechungUmfang)}
                      className={`px-3 py-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                        umfang === item.value
                          ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340] font-semibold shadow-xs"
                          : "bg-white text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Erklär-Modus info card under the question */}
        {isExplainMode && question.explanationText && (
          <div className="mt-3 p-4 rounded-2xl bg-[#EFECE6]/80 border border-[#E5DFD7] space-y-1.5">
            {question.explanationTitle && (
              <p className="text-xs font-semibold text-[#B8873B]">
                {question.explanationTitle}
              </p>
            )}
            <p className="text-xs leading-relaxed text-[#3E2340]/80">
              {question.explanationText}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Continue Button */}
      <div className="pt-3">
        <button
          type="button"
          id={`confirm-question-${question.id}-btn`}
          onClick={handleConfirm}
          disabled={!currentChoice}
          className={`w-full min-h-[52px] rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-md transition-all ${
            currentChoice
              ? "bg-[#3E2340] text-[#F7F4F0] hover:bg-[#3E2340]/90 active:scale-[0.99] cursor-pointer"
              : "bg-[#E5DFD7] text-[#3E2340]/40 cursor-not-allowed shadow-none"
          }`}
        >
          <span>Weiter</span>
          <ArrowRight className={`w-5 h-5 ${currentChoice ? "text-[#B8873B]" : "text-[#3E2340]/30"}`} />
        </button>
      </div>
    </div>
  );
}
