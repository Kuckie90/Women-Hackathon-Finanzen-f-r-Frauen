import { useState, useMemo } from "react";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PiggyBank,
  Sliders,
  Printer,
  ChevronRight,
  RotateCcw,
  Target,
  Home,
  Info,
  Coins,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { Answers, IstBestand, PotAllocation, ProfileType } from "../types";
import {
  ZIELALLOKATION,
  ZIELALLOKATION_SPANNEN,
  calculateProfile,
  formatEuro,
} from "../constants/rules";

interface SparrateAllokationScreenProps {
  answers: Answers;
  istBestand: IstBestand;
  onUpdateMonatsrate: (rate: number) => void;
  onOpenFullResult: () => void;
  onRestart: () => void;
  onOpenGlossary?: (termKey: string) => void;
}

export function SparrateAllokationScreen({
  answers,
  istBestand,
  onUpdateMonatsrate,
  onOpenFullResult,
  onRestart,
  onOpenGlossary,
}: SparrateAllokationScreenProps) {
  const breakdown = calculateProfile(answers);
  const profile: ProfileType = breakdown.finalProfile;
  const activeAllocation: PotAllocation =
    answers.customAllocation || ZIELALLOKATION[profile];

  // Rentenlücke Rate & Haushalts-Rate
  const rentenRate = answers.lebensziele?.rentenluecke.monatlicheSparrateFuerRente || 0;
  const nettoeinkommen = answers.nettoeinkommen || 2500;

  // Initiale Monatsrate: entweder bereits gewählt, aus Rentenlücke oder Standard 250 €
  const [monatsrate, setMonatsrate] = useState<number>(
    answers.monatsrate > 0
      ? answers.monatsrate
      : rentenRate > 0
      ? Math.round(rentenRate)
      : 250
  );

  // Optionaler Einmalbetrag (z. B. Ersparnisse, Bonus, Steuerrückzahlung)
  const [einmalbetrag, setEinmalbetrag] = useState<number>(answers.einmalbetrag || 0);
  const [showEinmalInput, setShowEinmalInput] = useState<boolean>(answers.einmalbetrag > 0);

  const handleRateChange = (val: number) => {
    const safeVal = Math.max(0, val);
    setMonatsrate(safeVal);
    onUpdateMonatsrate(safeVal);
  };

  // 1. Priorisierung: Sicherheits-Zielgröße berechnen
  // Faustformel: 3 Monatsausgaben/Nettogehälter bzw. 6 bei geplanter Unterbrechung
  const pufferMonate =
    answers.unterbrechung === "aktuell" || answers.unterbrechung === "ja"
      ? 6
      : 3;
  const targetSicherheit = pufferMonate * nettoeinkommen;

  // Aktueller Stand im Sicherheitsbucket
  const istSicherheit = istBestand.sicherheit;

  // Lücke im Sicherheitsbucket
  const sicherheitsLuecke = Math.max(0, targetSicherheit - istSicherheit);

  // 2. Aufteilung der anderen Buckets (Wachstum & Träume)
  // Sobald Sicherheit voll ist, teilen sich die anderen beiden Töpfe die 100 % der Sparrate
  const summeAndere = activeAllocation.wachstum + activeAllocation.spielgeld;
  const quoteWachstum = summeAndere > 0 ? activeAllocation.wachstum / summeAndere : 1;
  const quoteSpielgeld = summeAndere > 0 ? activeAllocation.spielgeld / summeAndere : 0;

  // Berechnung für Einmalbetrag (falls vorhanden)
  const einmalInSicherheit = Math.min(einmalbetrag, sicherheitsLuecke);
  const einmalRest = Math.max(0, einmalbetrag - einmalInSicherheit);
  const einmalInWachstum = Math.round(einmalRest * quoteWachstum);
  const einmalInSpielgeld = einmalRest - einmalInWachstum;

  // Verbleibende Lücke NACH Einmalbetrag
  const verbleibendeLuecke = Math.max(0, sicherheitsLuecke - einmalInSicherheit);
  const isSicherheitVoll = verbleibendeLuecke === 0;

  // Berechnen der Monate bis zur Auffüllung bei aktueller Sparrate
  const dauerMonate =
    monatsrate > 0 && verbleibendeLuecke > 0
      ? Math.ceil(verbleibendeLuecke / monatsrate)
      : 0;

  const sparrateWachstum = Math.round(monatsrate * quoteWachstum);
  const sparrateSpielgeld = monatsrate - sparrateWachstum;

  // Target-Datum für Phase 2 (sofern Topf 1 noch gefüllt werden muss)
  const zielDatum = useMemo(() => {
    if (dauerMonate === 0) return null;
    const d = new Date();
    d.setMonth(d.getMonth() + dauerMonate);
    return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  }, [dauerMonate]);

  return (
    <div id="sparrate-allokation-screen" className="flex flex-col flex-1 px-4 pt-3 pb-8 space-y-5">
      {/* Header Banner */}
      <div className="space-y-1.5 text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8873B]/10 text-[#B8873B] text-[11px] font-semibold tracking-wide">
          <Sliders className="w-3.5 h-3.5" />
          <span>Schritt 3: Deine Sparrate & Priorisierte Allokation</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#3E2340]">
          Wohin fließt dein Geld?
        </h1>
        <p className="text-xs text-[#3E2340]/75 max-w-[400px] mx-auto leading-relaxed">
          Je nachdem welche Lücken bestehen, gilt das eiserne Finanzprinzip:
          <strong> Immer erst der Sicherheitsbucket voll, danach füllen sich prozentual auch die anderen Buckets.</strong>
        </p>
      </div>

      {/* Sparraten-Eingabe & Schieberegler */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#3E2340] flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-[#B8873B]" />
            <span>Deine weitere monatliche Sparrate:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              step="25"
              value={monatsrate}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                handleRateChange(isNaN(val) ? 0 : val);
              }}
              className="w-24 px-2 py-1 text-right text-xs font-bold text-[#3E2340] bg-[#F7F4F0] border border-[#E5DFD7] rounded-lg outline-hidden focus:border-[#B8873B]"
            />
            <span className="text-xs font-semibold text-[#3E2340]/60">€ / Mon.</span>
          </div>
        </div>

        <input
          type="range"
          min="25"
          max="2000"
          step="25"
          value={monatsrate}
          onChange={(e) => handleRateChange(parseInt(e.target.value, 10))}
          className="w-full accent-[#B8873B] cursor-pointer"
        />

        {/* Quick Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {[100, 250, 500, 750, 1000].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-0.5 text-[11px] rounded-md border transition-all cursor-pointer ${
                monatsrate === rate
                  ? "bg-[#3E2340] text-white border-[#3E2340]"
                  : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
              }`}
            >
              {rate} €
            </button>
          ))}

          {rentenRate > 0 && (
            <button
              type="button"
              onClick={() => handleRateChange(Math.round(rentenRate))}
              className={`px-2 py-0.5 text-[11px] rounded-md border font-semibold transition-all cursor-pointer ${
                monatsrate === Math.round(rentenRate)
                  ? "bg-[#2E7D32] text-white border-[#2E7D32]"
                  : "bg-[#2E7D32]/10 text-[#1B5E20] border-[#2E7D32]/30 hover:bg-[#2E7D32]/20"
              }`}
            >
              🎯 Rentenlücken-Rate ({Math.round(rentenRate)} €)
            </button>
          )}
        </div>

        {/* Optionaler Einmalbetrag Toggle & Input */}
        <div className="pt-2 border-t border-[#E5DFD7]/70">
          {!showEinmalInput ? (
            <button
              type="button"
              onClick={() => setShowEinmalInput(true)}
              className="text-[11px] font-semibold text-[#B8873B] hover:text-[#3E2340] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>+ Zusätzlichen Einmalbetrag anlegen (z. B. Bonus, Erbschaft, Barvermögen)?</span>
            </button>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3E2340] flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#B8873B]" />
                  <span>Zusätzlicher Einmalbetrag:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={einmalbetrag || ""}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setEinmalbetrag(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="w-24 px-2 py-1 text-right text-xs font-bold text-[#3E2340] bg-[#F7F4F0] border border-[#E5DFD7] rounded-lg outline-hidden focus:border-[#B8873B]"
                  />
                  <span className="text-xs font-semibold text-[#3E2340]/60">€</span>
                </div>
              </div>

              {/* Quick Buttons for Einmalbetrag */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setEinmalbetrag(amt)}
                    className={`px-2 py-0.5 text-[10px] rounded-md border transition-all cursor-pointer ${
                      einmalbetrag === amt
                        ? "bg-[#3E2340] text-white border-[#3E2340]"
                        : "bg-[#F7F4F0] text-[#3E2340]/80 border-[#E5DFD7] hover:border-[#B8873B]"
                    }`}
                  >
                    +{formatEuro(amt)}
                  </button>
                ))}
                {einmalbetrag > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setEinmalbetrag(0);
                      setShowEinmalInput(false);
                    }}
                    className="px-2 py-0.5 text-[10px] text-[#3E2340]/50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Entfernen
                  </button>
                )}
              </div>

              {/* Live Einmalbetrag Wasserfall-Aufteilung */}
              {einmalbetrag > 0 && (
                <div className="p-2.5 rounded-xl bg-[#F7F4F0] border border-[#B8873B]/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-[11px] text-[#3E2340]">
                    <span>Priorisierte Allokation deines Einmalbetrags:</span>
                    <span className="text-[#B8873B]">{formatEuro(einmalbetrag)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-white border border-[#E5DFD7]">
                      <span className="text-[#3E2340]/60 block">1. In Sicherheit</span>
                      <span className="font-bold text-[#2E7D32]">{formatEuro(einmalInSicherheit)}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#E5DFD7]">
                      <span className="text-[#3E2340]/60 block">2. In Wachstum</span>
                      <span className="font-bold text-[#3E2340]">{formatEuro(einmalInWachstum)}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#E5DFD7]">
                      <span className="text-[#3E2340]/60 block">3. In Träume</span>
                      <span className="font-bold text-[#8A5E1E]">{formatEuro(einmalInSpielgeld)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PRIORISIERUNGS-LOGIK: DIE WASSERFALL-STRATEGIE */}
      <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/40 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[#B8873B]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8873B] block">
              Priorisierungs-Status
            </span>
            <h3 className="font-serif font-bold text-base text-[#3E2340]">
              {!isSicherheitVoll
                ? "Priorität 1: Erst Sicherheitsbucket auffüllen"
                : "Sicherheitsbucket voll – 100 % in Wachstum & Träume"}
            </h3>
          </div>
        </div>

        {/* Status-Vergleich Topf 1 */}
        <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#3E2340]">Zielgröße Sicherheitsbucket (Topf 1):</span>
            <span className="font-bold text-[#3E2340]">{formatEuro(targetSicherheit)}</span>
          </div>
          <div className="flex items-center justify-between text-[#3E2340]/75">
            <span>Aktueller Ist-Stand (Tagesgeld & Puffer):</span>
            <span>{formatEuro(istSicherheit)}</span>
          </div>
          {einmalInSicherheit > 0 && (
            <div className="flex items-center justify-between text-[#2E7D32] font-medium">
              <span>+ Sofortige Zuführung aus Einmalbetrag:</span>
              <span>+{formatEuro(einmalInSicherheit)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-[#E5DFD7] font-bold">
            <span className={isSicherheitVoll ? "text-[#2E7D32]" : "text-[#B8873B]"}>
              {isSicherheitVoll ? "Status: Vollständig abgesichert" : "Verbleibende monatliche Sicherheits-Lücke:"}
            </span>
            <span className={isSicherheitVoll ? "text-[#2E7D32]" : "text-[#B8873B]"}>
              {isSicherheitVoll ? "0 € (Gedeckt)" : formatEuro(verbleibendeLuecke)}
            </span>
          </div>
        </div>

        {/* Phase 1 & Phase 2 Wasserfall-Karten */}
        {!isSicherheitVoll ? (
          <div className="space-y-3">
            {/* Phase 1: AKTIV */}
            <div className="p-3.5 rounded-xl bg-[#2E7D32]/10 border-2 border-[#2E7D32] space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2E7D32] text-white text-[10px] font-bold">
                  <span>JETZT AKTIV: Phase 1</span>
                </span>
                <span className="font-bold text-xs text-[#1B5E20]">
                  Monat 1 bis {dauerMonate} ({zielDatum})
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#1B5E20]">
                100 % deiner Sparrate ({formatEuro(monatsrate)} / Monat) fließen in Topf 1 (Sicherheit)
              </h4>
              <p className="text-[11px] text-[#1B5E20]/90 leading-relaxed">
                Bevor Geld in schwankungsanfällige Aktien oder Träume fließt, wird dein Notgroschen
                vollständig aufgebaut. In genau <strong>{dauerMonate} Monaten</strong> erreichst du deine Zielgröße von {formatEuro(targetSicherheit)}.
              </p>
            </div>

            {/* Phase 2: VORSCHAU */}
            <div className="p-3.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2 opacity-90">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#3E2340]/15 text-[#3E2340] text-[10px] font-bold">
                  <span>DANACH: Phase 2 (ab {zielDatum})</span>
                </span>
                <span className="text-[10px] text-[#3E2340]/60 font-medium">Automatische Umschaltung</span>
              </div>
              <h4 className="font-bold text-xs text-[#3E2340]">
                100 % der Sparrate verteilen sich prozentual auf die anderen Buckets:
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-[#E5DFD7] text-center">
                  <span className="text-[10px] text-[#3E2340]/60 block font-bold">
                    Topf 2: Wachstum ({Math.round(quoteWachstum * 100)} %)
                  </span>
                  <span className="font-serif font-bold text-sm text-[#3E2340] block pt-0.5">
                    {formatEuro(sparrateWachstum)} / Monat
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">Welt-ETFs</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#E5DFD7] text-center">
                  <span className="text-[10px] text-[#8A5E1E] block font-bold">
                    Topf 3: Träume ({Math.round(quoteSpielgeld * 100)} %)
                  </span>
                  <span className="font-serif font-bold text-sm text-[#8A5E1E] block pt-0.5">
                    {formatEuro(sparrateSpielgeld)} / Monat
                  </span>
                  <span className="text-[10px] text-[#3E2340]/60">Wünsche & Freiheit</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Sicherheitsbucket ist bereits VOLL */
          <div className="p-3.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/30 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[#1B5E20] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Dein Sicherheits-Fundament steht bereits lückenlos!</span>
            </div>
            <p className="text-[11px] text-[#1B5E20]/90 leading-relaxed">
              Weil dein Notgroschen voll ist, muss kein Cent mehr in Topf 1 fließen.
              Deine monatliche Sparrate von <strong>{formatEuro(monatsrate)}</strong> teilt sich ab sofort <strong>zu 100 % prozentual auf deine beiden Rendite- und Freiheits-Buckets</strong> auf:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#2E7D32]/30 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E2340] block">
                  Topf 2: Wachstum ({Math.round(quoteWachstum * 100)} %)
                </span>
                <span className="font-serif font-bold text-base text-[#3E2340] block pt-0.5">
                  {formatEuro(sparrateWachstum)} / Monat
                </span>
                <span className="text-[10px] text-[#3E2340]/60">in weltweite Produktiv-ETFs</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#2E7D32]/30 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5E1E] block">
                  Topf 3: Träume ({Math.round(quoteSpielgeld * 100)} %)
                </span>
                <span className="font-serif font-bold text-base text-[#8A5E1E] block pt-0.5">
                  {formatEuro(sparrateSpielgeld)} / Monat
                </span>
                <span className="text-[10px] text-[#3E2340]/60">für Wünsche, Reisen & Krypto</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Konkreter Aktionsplan zur Umsetzung */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 text-xs shadow-xs">
        <h4 className="font-bold text-[#3E2340] flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          <span>Dein 3-Schritte-Aktionsplan</span>
        </h4>
        <div className="space-y-2 text-[11px] text-[#3E2340]/80">
          {!isSicherheitVoll ? (
            <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-1">
              <span className="font-bold text-[#3E2340] block">
                1. Dauerauftrag auf Tagesgeldkonto: {formatEuro(monatsrate)} / Monat
              </span>
              <p>
                Richte einen Dauerauftrag direkt am Tag nach deinem Gehaltseingang ein. In {dauerMonate} Monaten ist dieser Schritt abgeschlossen.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-1">
              <span className="font-bold text-[#3E2340] block">
                1. Sicherheitsbucket halten
              </span>
              <p>
                Dein Notgroschen auf dem Tagesgeld bleibt unberührt liegen. Zinserträge werden wieder angelegt.
              </p>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-1">
            <span className="font-bold text-[#3E2340] block">
              2. Wertpapiersparplan einrichten ({formatEuro(sparrateWachstum)} / Monat)
            </span>
            <p>
              Richte einen automatischen ETF-Sparplan auf einen breit gestreuten Welt-Aktien-Index (z. B. MSCI World oder FTSE All-World) ein.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-1">
            <span className="font-bold text-[#8A5E1E] block">
              3. Träume-Budget reservieren ({formatEuro(sparrateSpielgeld)} / Monat)
            </span>
            <p>
              Dieses Geld gehört dir für persönliche Wünsche, freie Chancen oder Krypto-Experimente – ohne schlechtes Gewissen.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons zur Gesamtauswertung / Drucken */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          id="goto-full-auswertung-btn"
          onClick={onOpenFullResult}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#3E2340] hover:bg-[#2D192E] active:scale-[0.99] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Layers className="w-4 h-4 text-[#B8873B]" />
          <span>Vollständigen Portfolio-Audit & Rebalancing-Bericht ansehen</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-white border border-[#E5DFD7] hover:bg-[#F7F4F0] text-[#3E2340] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-[#B8873B]" />
          <span>Strategie drucken / als PDF sichern</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-2 text-[#3E2340]/60 hover:text-[#3E2340] text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Neu starten</span>
        </button>
      </div>
    </div>
  );
}
