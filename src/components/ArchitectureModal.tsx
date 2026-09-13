import { X, Layers, ArrowRight, CheckCircle2, Sparkles, Shield, Database, Smartphone } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="architecture-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="architecture-modal-dialog"
        className="w-full max-w-md bg-[#F7F4F0] rounded-3xl border border-[#E5DFD7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#E5DFD7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2E7D32] block">
                Systemarchitektur & Vision
              </span>
              <h2 className="font-serif text-base font-bold text-[#3E2340]">
                Unser Asset Tool im Gesamtsystem
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#3E2340]/60 hover:text-[#3E2340] hover:bg-[#E5DFD7]/60 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#3E2340]/80 leading-relaxed">
          {/* Visual Architecture Diagram corresponding to architektur-mvp-vision.svg */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-4 shadow-xs">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-[#B8873B] uppercase tracking-wider block">
                Architekturmodell Angelegt
              </span>
              <p className="text-xs font-semibold text-[#3E2340]">
                Modulare Aufteilung: MVP vs. Gesamtlösung
              </p>
            </div>

            {/* Architecture Flow SVG / Layout */}
            <div className="space-y-3 pt-1">
              {/* Row 1: The two input modules */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Box 1 (Green): Our MVP Asset Tool */}
                <div className="p-3 rounded-2xl bg-[#E8F5E9] border-2 border-[#2E7D32] text-center space-y-1 shadow-xs relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#2E7D32] text-white text-[9px] font-bold tracking-wide uppercase shadow-xs">
                    Unser MVP (Live)
                  </div>
                  <div className="pt-1.5">
                    <span className="font-bold text-[#1B5E20] text-xs block">
                      Asset Tool
                    </span>
                    <span className="text-[10px] text-[#2E7D32] font-medium block">
                      Analyse & Orientierung
                    </span>
                  </div>
                  <p className="text-[9px] text-[#1B5E20]/80 leading-tight pt-1">
                    Drei-Töpfe-Allokation, Risikoprofil, Rebalancing & Sparraten
                  </p>
                </div>

                {/* Box 2 (Light Purple): Budget & Liquiditäts-Profil */}
                <div className="p-3 rounded-2xl bg-[#F3E5F5] border border-[#7B1FA2]/30 text-center space-y-1 opacity-90">
                  <div className="pt-1.5">
                    <span className="font-bold text-[#4A148C] text-xs block">
                      Finanzprofil & Budget
                    </span>
                    <span className="text-[10px] text-[#7B1FA2] font-medium block">
                      Zukunft / Nachbarmodul
                    </span>
                  </div>
                  <p className="text-[9px] text-[#4A148C]/70 leading-tight pt-1">
                    Cashflow, Haushaltsbuch, Open Banking & automatischer Notgroschen
                  </p>
                </div>
              </div>

              {/* Connecting Arrows Down */}
              <div className="flex justify-around text-[#3E2340]/40 py-0.5">
                <span className="text-xs">↓</span>
                <span className="text-xs">↓</span>
              </div>

              {/* Center Box (Grey/Beige): Platform Core */}
              <div className="p-3 rounded-2xl bg-[#EFECE6] border border-[#D5CEC4] text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-[#3E2340]">
                  <Database className="w-3.5 h-3.5 text-[#B8873B]" />
                  <span>Angelegt Core Plattform & Datenschnittstelle</span>
                </div>
                <p className="text-[10px] text-[#3E2340]/70">
                  Schnittstelle zur Zusammenführung von Asset-Allokation, Haushaltsbudget & Risikoparametern
                </p>
              </div>

              {/* Connecting Arrow Down */}
              <div className="text-center text-[#3E2340]/40 py-0.5 text-xs">
                ↓
              </div>

              {/* Bottom Box (Light Purple): Execution & Depot-Partner */}
              <div className="p-3 rounded-2xl bg-[#EDE7F6] border border-[#512DA8]/30 text-center space-y-1 opacity-90">
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-[#311B92]">
                  <Smartphone className="w-3.5 h-3.5 text-[#512DA8]" />
                  <span>Depot-Umsetzung & Altersvorsorgedepot</span>
                </div>
                <p className="text-[10px] text-[#311B92]/70 leading-tight">
                  Automatisierte Weitergabe an zertifizierte Neobroker, Banken & Altersvorsorgedepot-Partner
                </p>
              </div>

              {/* Legend matching architektur-mvp-vision.svg */}
              <div className="pt-2 border-t border-[#E5DFD7] flex items-center justify-between text-[10px] text-[#3E2340]/70">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#2E7D32] shrink-0" />
                  <span className="font-semibold text-[#1B5E20]">Unser MVP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#7B1FA2]/40 shrink-0" />
                  <span>Zukünftige Module</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#D5CEC4] shrink-0" />
                  <span>Plattform-Core</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#3E2340]">
              Warum der MVP-Fokus auf Asset Analyse & Orientierung?
            </h3>
            <p>
              Unser aktuelles <strong>Asset Tool (MVP)</strong> konzentriert sich bewusst auf die Kernherausforderung: Frauen in Deutschland bei der <strong>wissenschaftlich fundierten Anlageaufteilung und Portfolio-Analyse</strong> zu unterstützen.
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white border border-[#E5DFD7] space-y-1">
                <div className="font-semibold text-xs text-[#1B5E20] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reines Frontend ohne Hürden</span>
                </div>
                <p className="text-[11px] text-[#3E2340]/75">
                  Keine sensiblen Bank-Zugangsdaten oder Logins nötig. Alle Berechnungen laufen 100 % lokal und DSGVO-konform direkt im Browser.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5DFD7] space-y-1">
                <div className="font-semibold text-xs text-[#1B5E20] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Klare Trennung der Aufgaben</span>
                </div>
                <p className="text-[11px] text-[#3E2340]/75">
                  Das Asset Tool analysiert die Risikotragfähigkeit, definiert die drei Töpfe und errechnet Rebalancing-Maßnahmen. Budgetierung und Bank-Anbindung werden in der Gesamtlösung als eigene, spezialisierte Module angedockt.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5DFD7] space-y-1">
                <div className="font-semibold text-xs text-[#1B5E20] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Schutz vor Fehlentscheidungen (Gates)</span>
                </div>
                <p className="text-[11px] text-[#3E2340]/75">
                  Wer keine Notgroschen-Basis hat oder teure Konsumschulden bedient, wird sofort gewarnt: „Erst der Boden, dann der Aufbau“.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-4 bg-white border-t border-[#E5DFD7] shrink-0">
          <button
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#3E2340]/90 transition-all cursor-pointer"
          >
            <span>Verstanden</span>
            <ArrowRight className="w-4 h-4 text-[#B8873B]" />
          </button>
        </div>
      </div>
    </div>
  );
}
