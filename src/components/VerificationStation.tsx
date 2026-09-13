import { useState } from "react";
import {
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  RotateCcw,
  Shield,
  FileText,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  Building,
  Image as ImageIcon,
} from "lucide-react";
import { ParsedPosition, UploadedReport } from "../types";
import { formatEuro } from "../constants/rules";
import { parseFinancialNumber } from "../utils/documentParser";

interface VerificationStationProps {
  report: UploadedReport;
  onConfirm: (verifiedPositions: ParsedPosition[]) => void;
  onCancel: () => void;
  onOpenGlossary?: (term: string) => void;
}

export function VerificationStation({
  report,
  onConfirm,
  onCancel,
  onOpenGlossary,
}: VerificationStationProps) {
  const [positions, setPositions] = useState<ParsedPosition[]>(() =>
    report.positions.map((p) => ({ ...p }))
  );

  // Aktualisiere Feldwerte einer Position
  const handleUpdate = (
    id: string,
    field: keyof ParsedPosition,
    value: string | number
  ) => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.id !== id) return pos;
        if (field === "amount") {
          const parsed = typeof value === "number" ? value : parseFinancialNumber(String(value));
          return { ...pos, amount: parsed !== null && !isNaN(parsed) ? parsed : 0 };
        }
        return { ...pos, [field]: value };
      })
    );
  };

  // Position entfernen
  const handleRemove = (id: string) => {
    setPositions((prev) => prev.filter((pos) => pos.id !== id));
  };

  // Neue Zeile hinzufügen
  const handleAdd = () => {
    const newPos: ParsedPosition = {
      id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: "Weitere Position",
      amount: 1000,
      category: "wachstum",
    };
    setPositions((prev) => [...prev, newPos]);
  };

  // Live berechnete Summen je Topf
  const totals = positions.reduce(
    (acc, pos) => {
      const amt = Number(pos.amount) || 0;
      if (pos.category === "sicherheit") acc.sicherheit += amt;
      else if (pos.category === "wachstum") acc.wachstum += amt;
      else if (pos.category === "spielgeld") acc.spielgeld += amt;
      else if (pos.category === "immobilien") acc.immobilien += amt;
      acc.gesamt += amt;
      return acc;
    },
    { sicherheit: 0, wachstum: 0, spielgeld: 0, immobilien: 0, gesamt: 0 }
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Station Header */}
      <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#3E2340] text-[#B8873B] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#3E2340]">
                Prüfstation: Ausgelesene Angaben bestätigen
              </h3>
              <p className="text-[11px] text-[#3E2340]/70 flex items-center gap-1.5 mt-0.5">
                <FileText className="w-3 h-3 text-[#B8873B]" />
                <span className="font-medium text-[#3E2340]">{report.fileName}</span>
                {report.detectedBroker && (
                  <span className="text-[#3E2340]/60 font-semibold">• {report.detectedBroker}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {report.extractionMethod === "ai" ? (
              <span className="text-[10px] font-semibold text-purple-900 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-700" />
                <span>KI-Vision erkannt</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                100 % lokal geprüft
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-[#3E2340]/80 leading-relaxed pt-1">
          Überprüfe die erkannten Positionen, passe Beträge bei Bedarf an oder weise sie dem passenden Topf zu.
        </p>

        {report.previewImageUrl && (
          <div className="pt-2 border-t border-[#E5DFD7]">
            <details className="group">
              <summary className="text-[11px] font-semibold text-[#B8873B] hover:text-[#8A5E1E] cursor-pointer flex items-center gap-1.5 select-none">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Original-Screenshot / PDF-Vorschau anzeigen</span>
                <span className="text-[10px] text-[#3E2340]/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2 p-2 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] max-h-64 overflow-auto flex justify-center">
                <img
                  src={report.previewImageUrl}
                  alt="Vorschau Auszug"
                  className="max-h-56 rounded-lg object-contain shadow-xs"
                />
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Positionen-Liste */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-[#3E2340]/70 uppercase tracking-wide">
            Erkannte Positionen ({positions.length})
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className="text-xs font-bold text-[#B8873B] hover:text-[#8A5E1E] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Position ergänzen</span>
          </button>
        </div>

        {positions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-[#E5DFD7] text-center space-y-3">
            <p className="text-xs text-[#3E2340]/70">
              Es sind derzeit keine Positionen in der Liste.
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3E2340] text-[#F7F4F0] text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Erste Position anlegen</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {positions.map((pos, idx) => (
              <div
                key={pos.id}
                className="p-3 rounded-xl bg-white border border-[#E5DFD7] hover:border-[#B8873B]/40 transition-colors space-y-2 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#F7F4F0] text-[#3E2340]/60 font-semibold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {/* Name Input */}
                  <input
                    type="text"
                    value={pos.name}
                    onChange={(e) => handleUpdate(pos.id, "name", e.target.value)}
                    placeholder="Bezeichnung (z. B. MSCI World, Festgeld)"
                    className="flex-1 min-h-[36px] px-2.5 rounded-lg bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] font-medium outline-hidden focus:border-[#B8873B]"
                  />

                  {/* Betrag Input */}
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      step="any"
                      value={pos.amount || ""}
                      onChange={(e) => handleUpdate(pos.id, "amount", e.target.value)}
                      placeholder="0"
                      className="w-full min-h-[36px] pl-2 pr-6 rounded-lg bg-[#F7F4F0] border border-[#E5DFD7] text-[#3E2340] font-bold text-right outline-hidden focus:border-[#B8873B]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3E2340]/50 font-semibold text-[11px] pointer-events-none">
                      €
                    </span>
                  </div>

                  {/* Löschen */}
                  <button
                    type="button"
                    onClick={() => handleRemove(pos.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3E2340]/40 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Zeile entfernen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Topf-Zuweisung Toggle */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-[#3E2340]/60 font-medium shrink-0">Topf:</span>
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    <button
                      type="button"
                      onClick={() => handleUpdate(pos.id, "category", "sicherheit")}
                      className={`py-1 px-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        pos.category === "sicherheit"
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-[#F7F4F0] text-[#3E2340]/70 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <Shield className="w-3 h-3 shrink-0" />
                      <span className="truncate">Sicherheit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdate(pos.id, "category", "wachstum")}
                      className={`py-1 px-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        pos.category === "wachstum"
                          ? "bg-[#3E2340] text-white shadow-2xs"
                          : "bg-[#F7F4F0] text-[#3E2340]/70 hover:bg-purple-50 hover:text-[#3E2340]"
                      }`}
                    >
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span className="truncate">Wachstum</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdate(pos.id, "category", "spielgeld")}
                      className={`py-1 px-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        pos.category === "spielgeld"
                          ? "bg-[#B8873B] text-white shadow-2xs"
                          : "bg-[#F7F4F0] text-[#3E2340]/70 hover:bg-amber-50 hover:text-[#B8873B]"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span className="truncate">Träume</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdate(pos.id, "category", "immobilien")}
                      className={`py-1 px-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        pos.category === "immobilien"
                          ? "bg-[#665445] text-white shadow-2xs"
                          : "bg-[#F7F4F0] text-[#3E2340]/70 hover:bg-stone-100"
                      }`}
                    >
                      <Building className="w-3 h-3 shrink-0" />
                      <span className="truncate">Immobilie</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Berechnete Summen der Prüfstation */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#3E2340]">
          <span>Berechnete Töpfe nach deiner Bestätigung:</span>
          <span className="font-bold text-[#3E2340]">{formatEuro(totals.gesamt)} gesamt</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs">
          <div className="p-2 rounded-xl bg-[#F7F4F0]">
            <span className="text-[10px] text-emerald-800 block font-semibold">1. Sicherheit</span>
            <span className="font-serif font-bold text-xs text-[#3E2340]">
              {formatEuro(totals.sicherheit)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#F7F4F0]">
            <span className="text-[10px] text-[#3E2340] block font-semibold">2. Wachstum</span>
            <span className="font-serif font-bold text-xs text-[#3E2340]">
              {formatEuro(totals.wachstum)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#F7F4F0]">
            <span className="text-[10px] text-[#B8873B] block font-semibold">3. Träume</span>
            <span className="font-serif font-bold text-xs text-[#B8873B]">
              {formatEuro(totals.spielgeld)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#F7F4F0]">
            <span className="text-[10px] text-[#665445] block font-semibold">Immobilien</span>
            <span className="font-serif font-bold text-xs text-[#3E2340]">
              {formatEuro(totals.immobilien)}
            </span>
          </div>
        </div>
      </div>

      {/* Bestätigungs-Aktionen */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => onConfirm(positions)}
          className="w-full min-h-[50px] rounded-2xl bg-[#3E2340] text-[#F7F4F0] font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#3E2340]/90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Bestätigen & in Töpfe übernehmen</span>
          <ArrowRight className="w-4 h-4 text-[#B8873B]" />
        </button>

        <div className="flex items-center justify-between text-xs px-1">
          <button
            type="button"
            onClick={onCancel}
            className="text-[#3E2340]/60 hover:text-[#3E2340] flex items-center gap-1 cursor-pointer underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Andere Datei hochladen</span>
          </button>

          {onOpenGlossary && (
            <button
              type="button"
              onClick={() => onOpenGlossary("DSGVO")}
              className="text-[#B8873B] hover:underline cursor-pointer"
            >
              Datenschutz-Hinweis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
