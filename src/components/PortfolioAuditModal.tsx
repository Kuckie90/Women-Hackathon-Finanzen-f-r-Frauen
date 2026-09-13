import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Building2,
  TrendingUp,
  HelpCircle,
  X,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PortfolioAuditResult, AuditFinding, AuditBlockScore } from "../types";
import { AUDIT_CONFIG } from "../constants/auditRulesConfig";

interface PortfolioAuditModalProps {
  auditResult: PortfolioAuditResult;
  onClose: () => void;
  onOpenGlossary?: () => void;
}

export const PortfolioAuditModal: React.FC<PortfolioAuditModalProps> = ({
  auditResult,
  onClose,
  onOpenGlossary,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "warnings" | "positive" | "rebalancing">("all");
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

  const { totalScore, blockScores, findings, positiveFindings, swedroeRebalancing } = auditResult;

  // Score Klassifikation
  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: "Exzellent aufgestellt", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    if (score >= 70) return { label: "Solide mit Optimierungspotenzial", bg: "bg-amber-50 text-amber-800 border-amber-200" };
    return { label: "Erhöhter Handlungsbedarf", bg: "bg-rose-50 text-rose-800 border-rose-200" };
  };

  const badge = getScoreBadge(totalScore);

  const allFilteredFindings: AuditFinding[] = (() => {
    if (activeFilter === "warnings") {
      return findings.filter((f) => f.level === "yellow" || f.level === "red");
    }
    if (activeFilter === "positive") {
      return positiveFindings;
    }
    if (activeFilter === "rebalancing") {
      return findings.filter((f) => f.block === "rebalancing");
    }
    return [...findings, ...positiveFindings];
  })();

  const toggleExpand = (id: string) => {
    setExpandedFindingId(expandedFindingId === id ? null : id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-[#FBF9F5] border border-[#E5DFD7] rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#E5DFD7] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center font-serif text-lg font-bold">
              <Scale className="w-6 h-6 text-[#B8873B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#3E2340]">
                  Portfolio-Health-Check & Audit
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#3E2340]/5 text-[#3E2340]/80 border border-[#3E2340]/10">
                  {AUDIT_CONFIG.meta.version}
                </span>
              </div>
              <p className="text-xs text-[#3E2340]/60">
                Wissenschaftlicher Audit nach 28 Prüfregeln & MSCI World Benchmark per 08/2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F7F4F0] hover:bg-[#E5DFD7] text-[#3E2340] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Overall Score Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5DFD7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${
                    totalScore >= 85
                      ? "border-emerald-500 bg-emerald-50/50 text-emerald-950"
                      : totalScore >= 70
                      ? "border-amber-500 bg-amber-50/50 text-amber-950"
                      : "border-rose-500 bg-rose-50/50 text-rose-950"
                  }`}
                >
                  <span className="text-3xl font-serif font-bold leading-none">{totalScore}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">von 100</span>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1 justify-center sm:justify-start">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-[#3E2340]/60">
                    {findings.length} Hinweis{findings.length === 1 ? "" : "e"} • {positiveFindings.length} Stärken
                  </span>
                </div>
                <h3 className="font-serif font-bold text-[#3E2340] text-base sm:text-lg">
                  Finanzielle Robustheit & Allokations-Qualität
                </h3>
                <p className="text-xs text-[#3E2340]/70 mt-1 max-w-md">
                  Geprüft gegen gesetzliche Normen (§ 8 EinSiG, § 255 KAGB) und bewährte Praxis-Konventionen (Swedroe 5/25, Markowitz, Dalio).
                </p>
              </div>
            </div>

            {/* Benchmark Pill */}
            <div className="w-full sm:w-auto p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-left text-xs space-y-1">
              <div className="font-semibold text-[#3E2340] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#B8873B]" />
                <span>Referenz-Index</span>
              </div>
              <div className="text-[11px] text-[#3E2340]/70">
                MSCI World (1.280 Titel, Top 10 = 26,6 %)
              </div>
              <div className="text-[11px] text-[#3E2340]/70">
                Einlagensicherung: 100.000 € (§ 8 EinSiG)
              </div>
            </div>
          </div>

          {/* 5-Block Aufschlüsselung */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E2340]/60 px-1">
              Ergebnis nach Prüfblöcken (Max. 100 Punkte)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {(Object.values(blockScores) as AuditBlockScore[]).map((b) => (
                <div
                  key={b.key}
                  className="p-3.5 rounded-xl bg-white border border-[#E5DFD7] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#3E2340] truncate">{b.label}</span>
                    <span className="font-bold font-serif text-sm text-[#3E2340]">
                      {b.score}/{b.maxScore}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#E5DFD7] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.score === b.maxScore
                          ? "bg-emerald-500"
                          : b.score / b.maxScore >= 0.7
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${(b.score / b.maxScore) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#3E2340]/60 mt-2">
                    <span>
                      {b.redCount > 0 ? (
                        <span className="text-rose-600 font-bold">{b.redCount} Kritisch</span>
                      ) : b.yellowCount > 0 ? (
                        <span className="text-amber-700 font-semibold">{b.yellowCount} Optimierung</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Keine Auffälligkeiten</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swedroe 5/25 Rebalancing Monitor */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#B8873B]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#3E2340]">
                  Rebalancing-Monitor (Swedroe 5/25-Standard)
                </h4>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  swedroeRebalancing.needsRebalancing
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                {swedroeRebalancing.needsRebalancing ? "Rebalancing ratsam" : "Im Zielkorridor"}
              </span>
            </div>

            <p className="text-xs text-[#3E2340]/80 leading-relaxed">
              {swedroeRebalancing.summaryText}
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7]">
                <span className="text-[10px] text-[#3E2340]/60 block">Sicherheit</span>
                <span className="font-serif font-bold text-[#3E2340]">
                  {swedroeRebalancing.sicherheitDrift.absolutePP > 0 ? "+" : ""}
                  {swedroeRebalancing.sicherheitDrift.absolutePP} %-Punkte
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7]">
                <span className="text-[10px] text-[#3E2340]/60 block">Wachstum</span>
                <span className="font-serif font-bold text-[#3E2340]">
                  {swedroeRebalancing.wachstumDrift.absolutePP > 0 ? "+" : ""}
                  {swedroeRebalancing.wachstumDrift.absolutePP} %-Punkte
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7]">
                <span className="text-[10px] text-[#3E2340]/60 block">Träume / Spielgeld</span>
                <span className="font-serif font-bold text-[#3E2340]">
                  {swedroeRebalancing.spielgeldDrift.absolutePP > 0 ? "+" : ""}
                  {swedroeRebalancing.spielgeldDrift.absolutePP} %-Punkte
                </span>
              </div>
            </div>
          </div>

          {/* Findings Filter Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeFilter === "all"
                      ? "bg-[#3E2340] text-white"
                      : "text-[#3E2340]/70 hover:bg-[#E5DFD7]"
                  }`}
                >
                  Alle ({findings.length + positiveFindings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("warnings")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeFilter === "warnings"
                      ? "bg-[#3E2340] text-white"
                      : "text-[#3E2340]/70 hover:bg-[#E5DFD7]"
                  }`}
                >
                  Handlungsbedarf ({findings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("positive")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    activeFilter === "positive"
                      ? "bg-[#3E2340] text-white"
                      : "text-[#3E2340]/70 hover:bg-[#E5DFD7]"
                  }`}
                >
                  Stärken ({positiveFindings.length})
                </button>
              </div>

              {onOpenGlossary && (
                <button
                  type="button"
                  onClick={onOpenGlossary}
                  className="text-xs font-semibold text-[#B8873B] hover:text-[#8A5E1E] flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Finanzlexikon</span>
                </button>
              )}
            </div>

            {/* Findings List according to Phrasing Guardrails */}
            <div className="space-y-3">
              {allFilteredFindings.map((finding) => {
                const isExpanded = expandedFindingId === finding.id;
                return (
                  <div
                    key={finding.id}
                    className={`rounded-2xl border transition-all overflow-hidden bg-white ${
                      finding.level === "red"
                        ? "border-rose-200"
                        : finding.level === "yellow"
                        ? "border-amber-200"
                        : "border-emerald-200"
                    }`}
                  >
                    {/* Finding Header */}
                    <div
                      onClick={() => toggleExpand(finding.id)}
                      className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-[#FAF8F5]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {finding.level === "red" ? (
                            <ShieldAlert className="w-5 h-5 text-rose-600" />
                          ) : finding.level === "yellow" ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              Regel {finding.ruleId}
                            </span>
                            {finding.isLaw ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                                Gesetz
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F7F4F0] text-[#3E2340]/80">
                                Konvention
                              </span>
                            )}
                            <span className="text-[10px] text-[#3E2340]/60 capitalize">
                              Block: {finding.block}
                            </span>
                          </div>
                          <h5 className="font-bold text-sm text-[#3E2340] leading-snug">
                            {finding.title}
                          </h5>
                          <p className="text-xs text-[#3E2340]/80 mt-1 leading-relaxed">
                            {finding.findingText}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#3E2340]/60" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#3E2340]/60" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Vierklang-Details */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-[#E5DFD7]/60 bg-[#FBF9F5] space-y-2.5 text-xs">
                        {/* 2. Referenz / Benchmark */}
                        <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD7] space-y-1">
                          <span className="font-bold text-[#3E2340] block flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-[#B8873B]" />
                            Fachliche Referenz & Benchmark
                          </span>
                          <p className="text-[#3E2340]/80 leading-relaxed">
                            {finding.referenceText}
                          </p>
                          <span className="text-[10px] text-[#3E2340]/50 block">
                            Quelle: {finding.source}
                          </span>
                        </div>

                        {/* 3. Stressfall / Szenario */}
                        {finding.stressText && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-amber-900">
                            <span className="font-bold block flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                              Was bedeutet das im Stressfall?
                            </span>
                            <p className="leading-relaxed text-amber-950">
                              {finding.stressText}
                            </p>
                          </div>
                        )}

                        {/* 4. Reflektierende Frage */}
                        {finding.questionText && (
                          <div className="p-2.5 rounded-xl bg-[#3E2340]/5 border border-[#3E2340]/10 space-y-1 text-[#3E2340]">
                            <span className="font-bold block flex items-center gap-1 text-[#B8873B]">
                              <HelpCircle className="w-3.5 h-3.5" />
                              Reflexionsfrage für deine Entscheidung
                            </span>
                            <p className="italic leading-relaxed font-medium">
                              „{finding.questionText}“
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E5DFD7] flex items-center justify-between">
          <p className="text-[11px] text-[#3E2340]/60 hidden sm:block">
            Hinweis: Konventionen der Beraterpraxis stellen keine Rechts- oder Anlageberatung dar.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3E2340] text-white font-semibold text-xs hover:bg-[#2A182C] cursor-pointer ml-auto"
          >
            Schließen & zurück zur Übersicht
          </button>
        </div>
      </div>
    </div>
  );
};
