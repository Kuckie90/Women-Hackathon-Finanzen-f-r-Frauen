import React from "react";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  Clock,
  PiggyBank,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { BuddhaIcon } from "./BuddhaIcon";
import { Answers, PotAllocation, PotAllocationRanges, ProfileType } from "../types";
import {
  ZIELALLOKATION,
  ZIELALLOKATION_SPANNEN,
  calculateProfile,
  calculateSparraten,
  formatEuro,
} from "../constants/rules";

interface SollStandScreenProps {
  answers: Answers;
  onContinueToIst: () => void;
  onSkipToAuswertung: () => void;
  onOpenGlossary?: (termKey: string) => void;
}

export function SollStandScreen({
  answers,
  onContinueToIst,
  onSkipToAuswertung,
  onOpenGlossary,
}: SollStandScreenProps) {
  // 1. Profil & Soll-Allokation berechnen
  const breakdown = calculateProfile(answers);
  const profile: ProfileType = breakdown.finalProfile;
  const sollAllocation: PotAllocation = ZIELALLOKATION[profile];
  const sollSpannen: PotAllocationRanges = ZIELALLOKATION_SPANNEN[profile];

  // 2. Sparraten & Monatsaufteilung
  const sparratenInfo = calculateSparraten(
    answers.monatsrate,
    answers.unterbrechung,
    answers.nettoeinkommen,
    answers.unterbrechungDetails
  );

  const effektiveRate = sparratenInfo.effektiveRate;
  const monthlySicherheit = Math.round((effektiveRate * sollAllocation.sicherheit) / 100);
  const monthlyWachstum = Math.round((effektiveRate * sollAllocation.wachstum) / 100);
  const monthlySpielgeld = effektiveRate - monthlySicherheit - monthlyWachstum;

  return (
    <div
      id="soll-stand-screen"
      className="flex flex-col flex-1 px-4 pt-3 pb-8 space-y-5"
    >
      {/* Header Banner */}
      <div className="space-y-1.5 text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8873B]/10 text-[#B8873B] text-[11px] font-semibold tracking-wide">
          <Layers className="w-3.5 h-3.5" />
          <span>Ergebnis Teil 1: Dein Soll-Stand</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#3E2340]">
          Profil: {profile}
        </h1>
        <p className="text-xs text-[#3E2340]/75 max-w-[380px] mx-auto leading-relaxed">
          Aus deinen Antworten haben wir deine <strong>wissenschaftliche Soll-Allokation</strong> und deine optimale Drei-Töpfe-Verteilung ermittelt.
        </p>
      </div>

      {/* Soll-Allokations-Karten (Die 3 Töpfe) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Topf 1: Sicherheit */}
        <div
          id="soll-topf-1"
          className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
              <BuddhaIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
              Topf 1: Sicherheit
            </span>
            <span className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] block">
              {sollAllocation.sicherheit} %
            </span>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] font-semibold text-[#B8873B]">
              Spannbreite: {sollSpannen.sicherheit.min}–{sollSpannen.sicherheit.max} %
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5DFD7]/60 text-[10px] text-[#3E2340]/70 leading-tight">
            Notgroschen & Tagesgeld
            {effektiveRate > 0 && (
              <span className="font-semibold text-[#3E2340] block pt-0.5">
                {formatEuro(monthlySicherheit)} / Mt.
              </span>
            )}
          </div>
        </div>

        {/* Topf 2: Wachstum */}
        <div
          id="soll-topf-2"
          className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#3E2340]" />
            </div>
            <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
              Topf 2: Wachstum
            </span>
            <span className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] block">
              {sollAllocation.wachstum} %
            </span>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] font-semibold text-[#3E2340]">
              Spannbreite: {sollSpannen.wachstum.min}–{sollSpannen.wachstum.max} %
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5DFD7]/60 text-[10px] text-[#3E2340]/70 leading-tight">
            Welt-ETFs & Sachwerte
            {effektiveRate > 0 && (
              <span className="font-semibold text-[#3E2340] block pt-0.5">
                {formatEuro(monthlyWachstum)} / Mt.
              </span>
            )}
          </div>
        </div>

        {/* Topf 3: Träume */}
        <div
          id="soll-topf-3"
          className="p-3.5 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1.5 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#B8873B]" />
            </div>
            <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
              Topf 3: Träume
            </span>
            <span className="font-serif text-2xl md:text-3xl font-bold text-[#3E2340] block">
              {sollAllocation.spielgeld} %
            </span>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#F7F4F0] border border-[#E5DFD7] text-[10px] font-semibold text-[#8A5E1E]">
              Spannbreite: {sollSpannen.spielgeld.min}–{sollSpannen.spielgeld.max} %
            </div>
          </div>
          <div className="pt-2 border-t border-[#E5DFD7]/60 text-[10px] text-[#3E2340]/70 leading-tight">
            Freiheit & Wünsche
            {effektiveRate > 0 && (
              <span className="font-semibold text-[#3E2340] block pt-0.5">
                {formatEuro(monthlySpielgeld)} / Mt.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visueller Soll-Balken */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#3E2340]">
          <span className="font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#B8873B]" />
            <span>Zielverteilung deines Gesamtportfolios</span>
          </span>
          <span className="text-[11px] text-[#3E2340]/70 font-semibold">100 %</span>
        </div>
        <div className="h-4 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${sollAllocation.sicherheit}%` }}
            className="bg-[#2E7D32] h-full transition-all"
            title={`Topf 1 (Sicherheit): ${sollAllocation.sicherheit}%`}
          />
          <div
            style={{ width: `${sollAllocation.wachstum}%` }}
            className="bg-[#3E2340] h-full transition-all"
            title={`Topf 2 (Wachstum): ${sollAllocation.wachstum}%`}
          />
          <div
            style={{ width: `${sollAllocation.spielgeld}%` }}
            className="bg-[#B8873B] h-full transition-all"
            title={`Topf 3 (Träume): ${sollAllocation.spielgeld}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#3E2340]/70 pt-0.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] inline-block" />
            <span>Topf 1 ({sollAllocation.sicherheit}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3E2340] inline-block" />
            <span>Topf 2 ({sollAllocation.wachstum}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8873B] inline-block" />
            <span>Topf 3 ({sollAllocation.spielgeld}%)</span>
          </div>
        </div>
      </div>

      {/* Begründung & Herleitung des Soll-Stands */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 text-xs shadow-xs">
        <h3 className="font-bold text-[#3E2340] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
          <span>Warum ist das dein optimaler Soll-Stand?</span>
        </h3>
        <p className="text-[#3E2340]/80 leading-relaxed">
          Dein ermitteltes Profil <strong>„{profile}“</strong> balanciert deinen gewünschten Sicherheitsbedarf mit den Renditechancen der weltweiten Produktivwirtschaft. 
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-0.5">
            <span className="font-semibold text-[#3E2340] block">
              1. Notgroschen schützt
            </span>
            <span className="text-[#3E2340]/70">
              Topf 1 verhindert Notverkäufe bei unvorhergesehenen Kosten.
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-0.5">
            <span className="font-semibold text-[#3E2340] block">
              2. Zinseszins arbeitet
            </span>
            <span className="text-[#3E2340]/70">
              Topf 2 wächst in weltweiten ETFs ungestört über Krisen hinweg.
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-0.5">
            <span className="font-semibold text-[#3E2340] block">
              3. Freiheit ohne Reue
            </span>
            <span className="text-[#3E2340]/70">
              Topf 3 erlaubt Herzenswünsche, ohne die Existenz zu gefährden.
            </span>
          </div>
        </div>
      </div>

      {/* Überleitung / Call to Action für den Ist-Vergleich */}
      <div className="p-4 rounded-2xl bg-[#3E2340] text-[#F7F4F0] space-y-3.5 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8873B]">
            Nächster Schritt: Ist versus Soll
          </span>
          <h2 className="font-serif text-lg font-bold text-[#F7F4F0]">
            Wie passen deine bestehenden Anlagen dazu?
          </h2>
          <p className="text-xs text-[#F7F4F0]/80 leading-relaxed">
            Füttere die App jetzt mit deinen <strong>Ist-Daten</strong> (Girokonto, Tagesgeld, Depots, Wertpapiere und optional bestehende Vorsorgeverträge). Anschließend legen wir <strong>Ist gegen Soll</strong> und prüfen, ob deine Anlagen maximal unkorreliert sind.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onContinueToIst}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#B8873B] hover:bg-[#A37530] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Jetzt Ist-Stand & Portfolio eingeben</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onSkipToAuswertung}
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-medium transition-all flex items-center justify-center cursor-pointer"
          >
            Direkt zur Auswertung (ohne Ist-Vergleich)
          </button>
        </div>
      </div>
    </div>
  );
}
