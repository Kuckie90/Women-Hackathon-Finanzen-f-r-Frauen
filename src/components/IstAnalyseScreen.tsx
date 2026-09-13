import { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Building,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { Answers, IstBestand, PotAllocation, ProfileType } from "../types";
import {
  ZIELALLOKATION,
  ZIELALLOKATION_SPANNEN,
  calculateProfile,
  formatEuro,
} from "../constants/rules";

interface IstAnalyseScreenProps {
  answers: Answers;
  istBestand: IstBestand;
  onContinueToSparrate: () => void;
  onOpenGlossary?: (termKey: string) => void;
}

export function IstAnalyseScreen({
  answers,
  istBestand,
  onContinueToSparrate,
  onOpenGlossary,
}: IstAnalyseScreenProps) {
  const breakdown = calculateProfile(answers);
  const profile: ProfileType = breakdown.finalProfile;
  const activeAllocation: PotAllocation =
    answers.customAllocation || ZIELALLOKATION[profile];
  const sollSpannen = ZIELALLOKATION_SPANNEN[profile];

  const totalIst = istBestand.sicherheit + istBestand.wachstum + istBestand.spielgeld;

  // Prozentuale Verteilung des aktuellen Bestands
  const istProzent = {
    sicherheit: totalIst > 0 ? Math.round((istBestand.sicherheit / totalIst) * 100) : 0,
    wachstum: totalIst > 0 ? Math.round((istBestand.wachstum / totalIst) * 100) : 0,
    spielgeld: totalIst > 0 ? Math.round((istBestand.spielgeld / totalIst) * 100) : 0,
  };

  // Differenz zur Zielallokation
  const diffProzent = {
    sicherheit: istProzent.sicherheit - activeAllocation.sicherheit,
    wachstum: istProzent.wachstum - activeAllocation.wachstum,
    spielgeld: istProzent.spielgeld - activeAllocation.spielgeld,
  };

  // Details der Bausteine
  const details = istBestand.details;
  const vorsorge = istBestand.vorsorge;

  // Topf 1 Details
  const tagesgeldGiro = details?.tagesgeldGiro || (istBestand.sicherheit > 0 && !details ? istBestand.sicherheit : 0);
  const festgeld = details?.festgeldBauspar || 0;
  const klassischeVorsorge =
    (vorsorge?.riesterGuthaben || details?.riesterKlassisch || 0) +
    (vorsorge?.ruerupGuthaben || 0) +
    (vorsorge?.lebensversicherung || 0);

  // Topf 2 Details
  const weltEtf = details?.weltEtf || (istBestand.wachstum > 0 && !details ? istBestand.wachstum : 0);
  const einzelaktien = details?.einzelaktien || 0;
  const gold = details?.goldRohstoffe || 0;
  const fondsVorsorge = vorsorge?.privateRenteGuthaben || 0;

  // Topf 3 Details
  const krypto = details?.kryptoTrends || 0;
  const sonstigesTräume = istBestand.spielgeld > krypto ? istBestand.spielgeld - krypto : 0;

  return (
    <div id="ist-analyse-screen" className="flex flex-col flex-1 px-4 pt-3 pb-8 space-y-5">
      {/* Header Banner */}
      <div className="space-y-1.5 text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3E2340]/10 text-[#3E2340] text-[11px] font-semibold tracking-wide">
          <Layers className="w-3.5 h-3.5 text-[#B8873B]" />
          <span>Schritt 2: Analyse deiner aktuellen Anlagen</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#3E2340]">
          Deine Topf-Zuordnung
        </h1>
        <p className="text-xs text-[#3E2340]/75 max-w-[400px] mx-auto leading-relaxed">
          {totalIst > 0
            ? "Hier siehst du, in welche Töpfe deine aktuellen Anlagen verteilt sind und wie sie im Vergleich zu deiner Ziel-Allokation dastehen."
            : "Du hast angegeben, dass du noch keine bestehenden Anlagen besitzt. Perfekt für einen sauberen Neustart!"}
        </p>
      </div>

      {totalIst > 0 ? (
        <>
          {/* Gegenüberstellung Ist-Balken vs Soll-Balken */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#3E2340] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#B8873B]" />
                <span>Wie sind deine Anlagen aktuell verteilt?</span>
              </span>
              <span className="font-serif font-bold text-sm text-[#3E2340]">
                Gesamt: {formatEuro(totalIst)}
              </span>
            </div>

            {/* Balken 1: Dein Ist-Stand */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#3E2340]/75 font-semibold">
                <span>Aktueller Ist-Stand</span>
                <span>
                  {istProzent.sicherheit}% / {istProzent.wachstum}% / {istProzent.spielgeld}%
                </span>
              </div>
              <div className="h-4 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${istProzent.sicherheit}%` }}
                  className="bg-[#2E7D32] h-full transition-all"
                  title={`Topf 1 (Sicherheit): ${istProzent.sicherheit}%`}
                />
                <div
                  style={{ width: `${istProzent.wachstum}%` }}
                  className="bg-[#3E2340] h-full transition-all"
                  title={`Topf 2 (Wachstum): ${istProzent.wachstum}%`}
                />
                <div
                  style={{ width: `${istProzent.spielgeld}%` }}
                  className="bg-[#B8873B] h-full transition-all"
                  title={`Topf 3 (Träume): ${istProzent.spielgeld}%`}
                />
              </div>
            </div>

            {/* Balken 2: Dein Soll-Ziel */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#3E2340]/75 font-semibold">
                <span>Deine Ziel-Zuteilung</span>
                <span>
                  {activeAllocation.sicherheit}% / {activeAllocation.wachstum}% / {activeAllocation.spielgeld}%
                </span>
              </div>
              <div className="h-4 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${activeAllocation.sicherheit}%` }}
                  className="bg-[#2E7D32] h-full transition-all"
                  title={`Topf 1 (Sicherheit Ziel): ${activeAllocation.sicherheit}%`}
                />
                <div
                  style={{ width: `${activeAllocation.wachstum}%` }}
                  className="bg-[#3E2340] h-full transition-all"
                  title={`Topf 2 (Wachstum Ziel): ${activeAllocation.wachstum}%`}
                />
                <div
                  style={{ width: `${activeAllocation.spielgeld}%` }}
                  className="bg-[#B8873B] h-full transition-all"
                  title={`Topf 3 (Träume Ziel): ${activeAllocation.spielgeld}%`}
                />
              </div>
            </div>

            {/* Legende */}
            <div className="flex items-center justify-between text-[10px] text-[#3E2340]/70 pt-1">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] inline-block" />
                <span>1. Sicherheit</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3E2340] inline-block" />
                <span>2. Wachstum</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8873B] inline-block" />
                <span>3. Träume</span>
              </div>
            </div>
          </div>

          {/* Detaillierte Topf-Zuordnung (In welche Töpfe deine Anlagen fallen) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3E2340]/70 px-1">
              In welche Töpfe deine Anlagen fließen:
            </h3>

            {/* Topf 1: Sicherheit Detail */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                    <BuddhaIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider block">
                      Topf 1: Sicherheit ({istProzent.sicherheit} % des Ist-Bestands)
                    </span>
                    <h4 className="font-bold text-sm text-[#3E2340]">
                      Notgroschen, Tagesgeld & Garantien
                    </h4>
                  </div>
                </div>
                <span className="font-serif font-bold text-base text-[#2E7D32]">
                  {formatEuro(istBestand.sicherheit)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-xl bg-[#F7F4F0]">
                  <span className="text-[10px] text-[#3E2340]/60 block">Giro- & Tagesgeld</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(tagesgeldGiro)}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F7F4F0]">
                  <span className="text-[10px] text-[#3E2340]/60 block">Festgeld & Bausparer</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(festgeld)}</span>
                </div>
                {klassischeVorsorge > 0 && (
                  <div className="p-2 rounded-xl bg-[#F7F4F0] col-span-2">
                    <span className="text-[10px] text-[#3E2340]/60 block">Garantierte Verträge (Riester/Rürup/LV)</span>
                    <span className="font-bold text-[#3E2340]">{formatEuro(klassischeVorsorge)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Topf 2: Wachstum Detail */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#3E2340]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3E2340] uppercase tracking-wider block">
                      Topf 2: Wachstum ({istProzent.wachstum} % des Ist-Bestands)
                    </span>
                    <h4 className="font-bold text-sm text-[#3E2340]">
                      Welt-ETFs, Aktien & Sachwerte
                    </h4>
                  </div>
                </div>
                <span className="font-serif font-bold text-base text-[#3E2340]">
                  {formatEuro(istBestand.wachstum)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-xl bg-[#F7F4F0]">
                  <span className="text-[10px] text-[#3E2340]/60 block">Welt-Aktien-ETFs</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(weltEtf)}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F7F4F0]">
                  <span className="text-[10px] text-[#3E2340]/60 block">Einzelaktien</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(einzelaktien)}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F7F4F0]">
                  <span className="text-[10px] text-[#3E2340]/60 block">Gold & Sachwerte</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(gold)}</span>
                </div>
              </div>
            </div>

            {/* Topf 3: Träume Detail */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#B8873B]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8A5E1E] uppercase tracking-wider block">
                      Topf 3: Träume ({istProzent.spielgeld} % des Ist-Bestands)
                    </span>
                    <h4 className="font-bold text-sm text-[#3E2340]">
                      Wünsche, Krypto & freie Chancen
                    </h4>
                  </div>
                </div>
                <span className="font-serif font-bold text-base text-[#8A5E1E]">
                  {formatEuro(istBestand.spielgeld)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-xl bg-[#F7F4F0]">
                  <span className="text-[10px] text-[#3E2340]/60 block">Kryptowährungen</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(krypto)}</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F7F4F0]">
                  <span className="text-[10px] text-[#3E2340]/60 block">Freies Budget & Wünsche</span>
                  <span className="font-bold text-[#3E2340]">{formatEuro(sonstigesTräume)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lücken & Rebalancing-Erkenntnisse */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 text-xs shadow-xs">
            <h4 className="font-bold text-[#3E2340] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Erkenntnisse aus deiner aktuellen Verteilung:</span>
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-[#3E2340]/80 text-[11px] leading-relaxed">
              {diffProzent.sicherheit > 15 && (
                <li>
                  <strong>Hoher Sicherheitsanteil:</strong> Du hast aktuell {istProzent.sicherheit} % in Topf 1 (Ziel: {activeAllocation.sicherheit} %). Dein Geld ist sehr sicher, verliert durch die Inflation jedoch schleichend an Kaufkraft.
                </li>
              )}
              {diffProzent.sicherheit < -10 && (
                <li>
                  <strong>Sicherheits-Lücke:</strong> Dein Topf 1 liegt mit {istProzent.sicherheit} % unter deiner Ziel-Vorgabe von {activeAllocation.sicherheit} %. Wir priorisieren im nächsten Schritt das Schließen dieser Lücke.
                </li>
              )}
              {diffProzent.wachstum < -10 && (
                <li>
                  <strong>Wachstums-Potenzial ungenutzt:</strong> Im Wachstums-Topf fehlen dir aktuell {Math.abs(diffProzent.wachstum)} % gegenüber deinem Ziel. Hier kann der Zinseszins noch stärker für dich arbeiten.
                </li>
              )}
              {Math.abs(diffProzent.sicherheit) <= 10 && Math.abs(diffProzent.wachstum) <= 10 && (
                <li>
                  <strong>Sehr gut ausbalanciert:</strong> Deine bestehende Verteilung liegt bereits nahe an deiner wissenschaftlichen Ziel-Allokation!
                </li>
              )}
            </ul>
          </div>
        </>
      ) : (
        /* Frischer Start / 0 € */
        <div className="p-6 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#3E2340]">
              Frischer Start: Keine Altlasten
            </h3>
            <p className="text-xs text-[#3E2340]/75 max-w-[340px] mx-auto leading-relaxed">
              Du startest ohne bestehende Verträge oder Depots. Das ist ein großer Vorteil: Dein Portfolio wird ab dem ersten Euro exakt nach deiner Ziel-Allokation aufgebaut.
            </p>
          </div>
        </div>
      )}

      {/* Überleitung zu Schritt 4: Sparraten-Allokation */}
      <div className="p-4 rounded-2xl bg-[#3E2340] text-[#F7F4F0] space-y-3 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8873B]">
            Nächster Schritt
          </span>
          <h2 className="font-serif text-lg font-bold text-[#F7F4F0]">
            Deine monatliche Sparrate & Allokation
          </h2>
          <p className="text-xs text-[#F7F4F0]/80 leading-relaxed">
            Nun legen wir fest, wie deine weitere Sparrate fließt. Die feste Regel lautet: <strong>Immer erst der Sicherheitsbucket voll, danach füllen sich prozentual auch die anderen Buckets.</strong>
          </p>
        </div>

        <button
          type="button"
          id="goto-sparrate-allokation-btn"
          onClick={onContinueToSparrate}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#B8873B] hover:bg-[#A37530] active:scale-[0.99] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Weiter zur Sparraten-Allokation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
