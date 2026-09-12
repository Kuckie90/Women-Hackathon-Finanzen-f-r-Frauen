import { ChevronLeft, RotateCcw } from "lucide-react";

interface HeaderProps {
  stepTitle?: string;
  stepNumber?: number;
  totalSteps?: number;
  onBack?: () => void;
  onReset?: () => void;
  isExplainMode?: boolean;
}

export function Header({
  stepTitle,
  stepNumber,
  totalSteps,
  onBack,
  onReset,
  isExplainMode,
}: HeaderProps) {
  const showProgress = stepNumber !== undefined && totalSteps !== undefined;
  const progressPercent = showProgress ? Math.min(100, Math.round((stepNumber / totalSteps) * 100)) : 0;

  return (
    <header id="topfgeld-header" className="w-full pt-4 pb-3 px-4">
      <div className="flex items-center justify-between min-h-[44px]">
        <div className="w-10 flex items-center justify-start">
          {onBack && (
            <button
              id="header-back-button"
              onClick={onBack}
              aria-label="Zurück"
              className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#3E2340] hover:bg-[#E5DFD7]/60 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center">
          <span className="font-serif text-xl font-bold tracking-tight text-[#3E2340]">
            Topfgeld
          </span>
          {isExplainMode !== undefined && (
            <span className="text-[10px] uppercase tracking-wider text-[#B8873B] font-semibold">
              {isExplainMode ? "Erklär-Modus" : "Kurzmodus"}
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
              className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center text-[#3E2340]/60 hover:text-[#3E2340] hover:bg-[#E5DFD7]/60 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[#3E2340]/70 mb-1.5 font-medium">
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
      )}
    </header>
  );
}
