import { useState } from "react";
import { HelpCircle, Check, ArrowRight } from "lucide-react";
import { QuestionDef } from "../data/questionsData";

interface QuestionScreenProps {
  question: QuestionDef;
  selectedValue?: string;
  onSelect: (val: string) => void;
  isExplainMode: boolean;
  onOpenGlossary: (termKey: string) => void;
}

export function QuestionScreen({
  question,
  selectedValue,
  onSelect,
  isExplainMode,
  onOpenGlossary,
}: QuestionScreenProps) {
  const [currentChoice, setCurrentChoice] = useState<string | undefined>(selectedValue);

  const handleChoose = (val: string) => {
    setCurrentChoice(val);
  };

  const handleConfirm = () => {
    if (currentChoice) {
      onSelect(currentChoice);
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
