import { ChevronLeft, RotateCcw, Layers } from "lucide-react";

interface HeaderProps {
  stepTitle?: string;
  stepNumber?: number;
  totalSteps?: number;
  onBack?: () => void;
  onReset?: () => void;
  isExplainMode?: boolean;
  onOpenArchitecture?: () => void;
}

export function Header({
  stepTitle,
  stepNumber,
  totalSteps,
  onBack,
  onReset,
  isExplainMode,
  onOpenArchitecture,
}: HeaderProps) {
  const showProgress = stepNumber !== undefined && totalSteps !== undefined;
  const progressPercent = showProgress ? Math.min(100, Math.round((stepNumber / totalSteps) * 100)) : 0;

  return (
    <header id="topfgeld-header" className="w-full pt-3 pb-2.5 px-4 bg-[#F7F4F0] border-b border-[#E5DFD7]/50 shrink-0">
      <div className="flex items-center justify-between min-h-[40px]">
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

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-lg font-bold tracking-tight text-[#3E2340]">
              AnGelegt
            </span>
            {onOpenArchitecture && (
              <button
                type="button"
                onClick={onOpenArchitecture}
                title="Systemarchitektur: Unser MVP im Gesamtsystem anzeigen"
                className="px-1.5 py-0.5 rounded-md bg-[#2E7D32]/10 text-[#1B5E20] text-[9px] font-bold tracking-wide border border-[#2E7D32]/20 hover:bg-[#2E7D32]/20 transition-all cursor-pointer flex items-center gap-0.5"
              >
                <Layers className="w-2.5 h-2.5 text-[#2E7D32]" />
                <span>MVP</span>
              </button>
            )}
          </div>
          {isExplainMode !== undefined && (
            <span className="text-[9px] uppercase tracking-wider text-[#B8873B] font-semibold">
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
              className="w-9 h-9 -mr-1.5 rounded-xl flex items-center justify-center text-[#3E2340]/60 hover:text-[#3E2340] hover:bg-[#E5DFD7]/60 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showProgress ? (
        <div className="mt-2.5">
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
      ) : stepTitle ? (
        <div className="mt-2 text-center">
          <span className="inline-block text-[11px] font-semibold text-[#3E2340]/75 bg-[#EFECE6] px-2.5 py-0.5 rounded-full border border-[#E5DFD7]">
            {stepTitle}
          </span>
        </div>
      ) : null}
    </header>
  );
}
