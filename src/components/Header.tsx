import { ChevronLeft, RotateCcw } from "lucide-react";

interface HeaderProps {
  stepTitle?: string;
  stepNumber?: number;
  totalSteps?: number;
  onBack?: () => void;
  onReset?: () => void;
  isExplainMode?: boolean;
  onOpenArchitecture?: () => void;
  isQuestionSlide?: boolean;
}

export function Header({
  stepTitle,
  stepNumber,
  totalSteps,
  onBack,
  onReset,
  isQuestionSlide,
}: HeaderProps) {
  const showProgress = stepNumber !== undefined && totalSteps !== undefined;
  const isQuestion = isQuestionSlide ?? showProgress;
  const progressPercent = showProgress ? Math.min(100, Math.round((stepNumber / totalSteps) * 100)) : 0;

  return (
    <header id="topfgeld-header" className="w-full pt-3 pb-2.5 px-4 bg-[#F7F4F0] border-b border-[#E5DFD7]/50 shrink-0">
      <div className="flex items-center justify-between min-h-[36px]">
        <div className="w-10 flex items-center justify-start">
          {onBack && (
            <button
              id="header-back-button"
              onClick={onBack}
              aria-label="Zurück"
              className="w-9 h-9 -ml-1.5 rounded-xl flex items-center justify-center text-[#3E2340] hover:bg-[#E5DFD7]/60 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Auf Frageslides ist hier ALLES gelöscht (kein Logo, kein Angelegt, kein MVP, kein Erklär-Modus) */}
        <div className="flex-1 flex justify-center items-center">
          {!isQuestion && stepTitle && (
            <span className="font-serif text-base font-bold text-[#3E2340] tracking-tight">
              {stepTitle}
            </span>
          )}
        </div>

        <div className="w-10 flex items-center justify-end">
          {onReset && (
            <button
              id="header-reset-button"
              onClick={onReset}
              aria-label="Neu starten"
              title="Neu starten"
              className="w-9 h-9 -mr-1.5 rounded-xl flex items-center justify-center text-[#3E2340]/60 hover:text-[#3E2340] hover:bg-[#E5DFD7]/60 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showProgress ? (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-[#3E2340]/70 mb-1 font-medium">
            <span>{stepTitle || `Frage ${stepNumber} von ${totalSteps}`}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E5DFD7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B8873B] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}

