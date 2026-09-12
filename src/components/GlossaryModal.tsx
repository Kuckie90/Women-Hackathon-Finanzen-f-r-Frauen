import { X, BookOpen } from "lucide-react";
import { GLOSSAR, GlossaryItem } from "../data/questionsData";

interface GlossaryModalProps {
  glossaryKey: string | null;
  onClose: () => void;
}

export function GlossaryModal({ glossaryKey, onClose }: GlossaryModalProps) {
  if (!glossaryKey) return null;

  const item: GlossaryItem | undefined = GLOSSAR[glossaryKey];
  if (!item) return null;

  return (
    <div
      id="glossary-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-3 transition-opacity"
      onClick={onClose}
    >
      <div
        id="glossary-modal-card"
        className="w-full max-w-[400px] bg-[#F7F4F0] border border-[#E5DFD7] rounded-2xl p-6 shadow-xl text-[#3E2340] max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5DFD7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#3E2340]">
              {item.term}
            </h3>
          </div>
          <button
            id="close-glossary-btn"
            onClick={onClose}
            aria-label="Schließen"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E5DFD7] text-[#3E2340]/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-[#B8873B] leading-snug">
            {item.shortExplain}
          </p>
          <p className="text-sm leading-relaxed text-[#3E2340]/85 whitespace-pre-line">
            {item.detail}
          </p>
        </div>

        <div className="mt-6 pt-3">
          <button
            id="glossary-verstanden-btn"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-xl bg-[#3E2340] text-[#F7F4F0] font-medium text-sm hover:bg-[#3E2340]/90 transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
