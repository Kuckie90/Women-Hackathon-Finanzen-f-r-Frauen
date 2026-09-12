import { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Building,
  Info,
  Layers,
  Target,
  Clock,
  PiggyBank,
} from "lucide-react";
import { Answers, IstBestand, ProfileType, PotAllocation } from "../types";
import {
  ZIELALLOKATION,
  calculateProfile,
  calculateSparraten,
  getPotExamples,
  formatEuro,
} from "../constants/rules";
import { DEFAULT_LEBENSZIELE, computeGoalProgress } from "../utils/goalsAndPension";
import { PotCustomizer } from "./PotCustomizer";
import { GoalProgressChart } from "./GoalProgressChart";

interface ResultScreenProps {
  answers: Answers;
  istBestand: IstBestand;
  hasGateWarning: boolean;
  onRestart: () => void;
  onOpenGlossary?: (termKey: string) => void;
}

export function ResultScreen({
  answers,
  istBestand,
  hasGateWarning,
  onRestart,
  onOpenGlossary,
}: ResultScreenProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showImmoDetails, setShowImmoDetails] = useState(false);

  // 1. Profil & Allokation (mit händischer Anpassungsmöglichkeit)
  const breakdown = calculateProfile(answers);
  const profile: ProfileType = breakdown.finalProfile;
  const sollAllocation: PotAllocation = ZIELALLOKATION[profile];

  const [customAllocation, setCustomAllocation] = useState<PotAllocation | null>(
    answers.customAllocation || null
  );

  const activeAllocation: PotAllocation = customAllocation || sollAllocation;

  // 2. Sparraten & Monatsaufteilung
  const sparratenInfo = calculateSparraten(
    answers.monatsrate,
    answers.unterbrechung,
    answers.nettoeinkommen
  );

  // Interactive slider for testing rates
  const [interactiveRate, setInteractiveRate] = useState<number>(
    sparratenInfo.effektiveRate > 0 ? sparratenInfo.effektiveRate : 150
  );

  const monthlySicherheit = Math.round((interactiveRate * activeAllocation.sicherheit) / 100);
  const monthlyWachstum = Math.round((interactiveRate * activeAllocation.wachstum) / 100);
  const monthlySpielgeld = interactiveRate - monthlySicherheit - monthlyWachstum;

  // 3. Gesamtvermögen & Ist-Soll-Berechnung
  const totalIst = istBestand.sicherheit + istBestand.wachstum + istBestand.spielgeld;
  const gesamtStart = totalIst + answers.einmalbetrag;

  const istProzent = {
    sicherheit: totalIst > 0 ? Math.round((istBestand.sicherheit / totalIst) * 100) : 0,
    wachstum: totalIst > 0 ? Math.round((istBestand.wachstum / totalIst) * 100) : 0,
    spielgeld: totalIst > 0 ? Math.round((istBestand.spielgeld / totalIst) * 100) : 0,
  };

  const sollEuro = {
    sicherheit: Math.round((gesamtStart * activeAllocation.sicherheit) / 100),
    wachstum: Math.round((gesamtStart * activeAllocation.wachstum) / 100),
    spielgeld: Math.round((gesamtStart * activeAllocation.spielgeld) / 100),
  };

  const diffEuro = {
    sicherheit: sollEuro.sicherheit - istBestand.sicherheit,
    wachstum: sollEuro.wachstum - istBestand.wachstum,
    spielgeld: sollEuro.spielgeld - istBestand.spielgeld,
  };

  const getMeasure = (d: number) => {
    if (Math.abs(d) <= 100) return "Ausgewogen halten";
    if (d > 0) return `${formatEuro(d)} zuführen`;
    return `${formatEuro(Math.abs(d))} umschichten`;
  };

  const hasSales = diffEuro.sicherheit < -100 || diffEuro.wachstum < -100 || diffEuro.spielgeld < -100;

  // 4. Lebensziele & Zielerreichungs-Berechnung
  const lebensziele = answers.lebensziele || DEFAULT_LEBENSZIELE;
  const goalProgress = computeGoalProgress(
    lebensziele,
    istBestand,
    activeAllocation,
    interactiveRate
  );

  return (
    <div id="result-screen" className="flex flex-col flex-1 px-4 pt-3 pb-8 space-y-5">
      {/* Permanent Gate Warning Banner if user bypassed */}
      {hasGateWarning && (
        <div
          id="gate-warning-banner"
          className="p-3.5 rounded-2xl bg-[#3E2340] text-[#F7F4F0] flex items-start gap-2.5 text-xs shadow-md border-l-4 border-[#B8873B]"
        >
          <AlertTriangle className="w-5 h-5 text-[#B8873B] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-sm">Vorschau, kein Plan.</p>
            <p className="text-[#F7F4F0]/80 leading-relaxed">
              Ohne ausreichenden Puffer oder mit teuren Schulden ist dieses Ergebnis eine Orientierung für die Zukunft. Baue zuerst dein Sicherheitsnetz auf.
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Header */}
      <div className="text-center space-y-1 pt-1">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#B8873B]">
          Deine Zielaufteilung
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#3E2340]">
          Profil: {profile}
        </h1>
        <p className="text-xs text-[#3E2340]/75 max-w-[340px] mx-auto leading-relaxed">
          Anleger:innen mit diesem Profil halten typischerweise folgende Aufteilung im Drei-Töpfe-Modell:
        </p>
      </div>

      {/* Die 3 Töpfe: Übersichtskarten */}
      <div className="grid grid-cols-3 gap-2">
        {/* Topf 1: Sicherheit */}
        <div className="p-3 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1 shadow-xs">
          <div className="w-7 h-7 mx-auto rounded-full bg-[#B8873B]/10 text-[#B8873B] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
            Sicherheit
          </span>
          <span className="font-serif text-2xl font-bold text-[#3E2340] block">
            {activeAllocation.sicherheit} %
          </span>
          <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
            Notgroschen & Festgeld
          </span>
        </div>

        {/* Topf 2: Wachstum */}
        <div className="p-3 rounded-2xl bg-white border border-[#E5DFD7] text-center space-y-1 shadow-xs">
          <div className="w-7 h-7 mx-auto rounded-full bg-[#3E2340]/10 text-[#3E2340] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#3E2340]" />
          </div>
          <span className="text-[10px] font-bold text-[#3E2340]/60 uppercase tracking-wider block">
            Wachstum
          </span>
          <span className="font-serif text-2xl font-bold text-[#3E2340] block">
            {activeAllocation.wachstum} %
          </span>
          <span className="text-[10px] text-[#3E2340]/60 block leading-tight">
            Welt-Aktien & Rente
          </span>
        </div>

        {/* Topf 3: Spaßgeld */}
        <div className="p-3 rounded-2xl bg-[#B8873B]/10 border border-[#B8873B]/30 text-center space-y-1 shadow-xs">
          <div className="w-7 h-7 mx-auto rounded-full bg-[#B8873B] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-[#B8873B] uppercase tracking-wider block">
            Spaßgeld
          </span>
          <span className="font-serif text-2xl font-bold text-[#3E2340] block">
            {activeAllocation.spielgeld} %
          </span>
          <span className="text-[10px] text-[#3E2340]/70 block leading-tight">
            Freie Freude & Krypto
          </span>
        </div>
      </div>

      {/* Händische Anpassung der Töpfe */}
      <PotCustomizer
        recommendedAllocation={sollAllocation}
        currentAllocation={activeAllocation}
        profileName={profile}
        onChangeAllocation={setCustomAllocation}
      />

      {/* Ausführliche Definition & Psychologische Freiheit von Spaßgeld */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 text-xs shadow-xs">
        <div className="flex items-center gap-2 font-bold text-[#3E2340]">
          <Sparkles className="w-4 h-4 text-[#B8873B]" />
          <span>Topf 3: Das Spaßgeld-Prinzip (Freiheit ohne Reue)</span>
        </div>
        <p className="text-[#3E2340]/80 leading-relaxed">
          Das <strong>Spaßgeld-Bucket</strong> ist für Dinge, die dir pure Freude bereiten. Hier bist du völlig frei in deiner Entscheidung. Dieses Geld wird weder jetzt noch in Zukunft zwingend gebraucht — ein Verlust darf dir leidtun, gefährdet aber niemals deine Existenz.
        </p>
      </div>

      {/* LEBENSZIELE & ZIELERREICHUNGS-GRAFIK */}
      <GoalProgressChart
        goals={goalProgress.items}
        overallPensionCoveragePercent={goalProgress.overallPensionCoveragePercent}
        projectedPensionCapital={goalProgress.projectedPensionCapital}
        jahreBisRente={lebensziele.rentenluecke.rentenAlter - lebensziele.rentenluecke.aktuellesAlter}
        monatsrate={interactiveRate}
        monthlyWachstum={monthlyWachstum}
        onOpenGlossary={onOpenGlossary}
      />

      {/* LEBENSZIELE ZUORDNUNGS-GUIDE */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 text-xs shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-[#3E2340] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#B8873B]" />
            <span>Welcher Topf bedient welches Lebensziel?</span>
          </h3>
          {onOpenGlossary && (
            <button
              type="button"
              onClick={() => onOpenGlossary("Lebensziele")}
              className="text-[11px] font-semibold text-[#B8873B] hover:underline cursor-pointer"
            >
              Zeithorizonte
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-[#F7F4F0] border-l-3 border-[#2E7D32] space-y-1">
            <div className="flex items-center justify-between font-bold text-[#3E2340]">
              <span>1. Kurzfristig (&lt; 3 Jahre): {lebensziele.kurzfristZiel.titel}</span>
              <span className="text-[11px] text-[#2E7D32]">Topf 1 (Sicherheit)</span>
            </div>
            <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
              Bedarf: {formatEuro(lebensziele.kurzfristZiel.zielbetrag)}. Muss zu 100 % sicher auf dem Tagesgeld liegen. Niemals am Aktienmarkt anlegen, da Kursdellen kurzfristig nicht ausgesessen werden können.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F7F4F0] border-l-3 border-[#B8873B] space-y-1">
            <div className="flex items-center justify-between font-bold text-[#3E2340]">
              <span>2. Mittelfristig (3–10 Jahre): {lebensziele.mittelfristZiel.titel}</span>
              <span className="text-[11px] text-[#B8873B]">Topf 1 & 2 (Planbar)</span>
            </div>
            <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
              Bedarf: {formatEuro(lebensziele.mittelfristZiel.zielbetrag)} in ca. {lebensziele.mittelfristZiel.jahre} Jahren. Wird durch defensive Bausteine (Festgeldleiter) und solide Sparraten gedeckt.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F7F4F0] border-l-3 border-[#3E2340] space-y-1">
            <div className="flex items-center justify-between font-bold text-[#3E2340]">
              <span>3. Langfristig (&gt; 10 Jahre): Rentenlücke & Altersvorsorge</span>
              <span className="text-[11px] text-[#3E2340]">Topf 2 (Wachstum)</span>
            </div>
            <p className="text-[11px] text-[#3E2340]/80 leading-relaxed">
              Monatliche Lücke: {formatEuro(lebensziele.rentenluecke.rentenlueckeMonatlich)} • Kapitalstock: {formatEuro(lebensziele.rentenluecke.benoetigtesKapital)}. Gehört zwingend in Topf 2 (Welt-ETFs). Über 20–35 Jahre schlägt die Weltwirtschaft jede Inflation und generiert exponentielles Zinseszins-Vermögen.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Bar Chart: Ist vs. Soll */}
      {totalIst > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs">
          <h3 className="font-semibold text-xs text-[#3E2340] uppercase tracking-wider">
            Verteilung im Vergleich (Ist vs. Soll)
          </h3>

          {/* Ist-Balken */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#3E2340]/70">
              <span className="font-medium">Aktueller Ist-Stand</span>
              <span className="font-bold">{formatEuro(totalIst)}</span>
            </div>
            <div className="h-5 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${istProzent.sicherheit}%` }}
                className="bg-[#3E2340] h-full transition-all"
                title={`Sicherheit: ${istProzent.sicherheit}%`}
              />
              <div
                style={{ width: `${istProzent.wachstum}%` }}
                className="bg-[#B8873B] h-full transition-all"
                title={`Wachstum: ${istProzent.wachstum}%`}
              />
              <div
                style={{ width: `${istProzent.spielgeld}%` }}
                className="bg-[#8E5B8F] h-full transition-all"
                title={`Spaßgeld: ${istProzent.spielgeld}%`}
              />
            </div>
          </div>

          {/* Soll-Balken */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#3E2340]/70">
              <span className="font-medium">
                {customAllocation ? "Angepasstes Soll-Profil" : `Empfohlenes Soll-Profil (${profile})`}
              </span>
              <span className="font-bold">
                {activeAllocation.sicherheit}/{activeAllocation.wachstum}/{activeAllocation.spielgeld}
              </span>
            </div>
            <div className="h-5 w-full bg-[#E5DFD7] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${activeAllocation.sicherheit}%` }}
                className="bg-[#3E2340] h-full transition-all"
                title={`Sicherheit: ${activeAllocation.sicherheit}%`}
              />
              <div
                style={{ width: `${activeAllocation.wachstum}%` }}
                className="bg-[#B8873B] h-full transition-all"
                title={`Wachstum: ${activeAllocation.wachstum}%`}
              />
              <div
                style={{ width: `${activeAllocation.spielgeld}%` }}
                className="bg-[#8E5B8F] h-full transition-all"
                title={`Spaßgeld: ${activeAllocation.spielgeld}%`}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-[#3E2340]/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E2340]" />
              <span>Sicherheit ({activeAllocation.sicherheit}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8873B]" />
              <span>Wachstum ({activeAllocation.wachstum}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8E5B8F]" />
              <span>Spaßgeld ({activeAllocation.spielgeld}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* MONATLICHE SPARRATEN-AUFTEILUNG & RECHNER */}
      <div className="p-4 rounded-2xl bg-white border border-[#B8873B]/30 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#3E2340]">
            <Sliders className="w-4 h-4 text-[#B8873B]" />
            <span>Monatliche Sparraten-Aufteilung</span>
          </div>
          <span className="font-serif font-bold text-base text-[#3E2340]">
            {formatEuro(interactiveRate)} / Monat
          </span>
        </div>

        <p className="text-xs text-[#3E2340]/75">
          Jeden Monat teilt sich deine Sparrate nach deinem Profil automatisch so auf:
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-[#F7F4F0] text-center">
            <span className="text-[10px] text-[#3E2340]/60 block font-semibold">
              Topf 1 (Sicherheit)
            </span>
            <span className="font-serif font-bold text-base text-[#3E2340] block">
              {formatEuro(monthlySicherheit)}
            </span>
            <span className="text-[10px] text-[#3E2340]/60">Tagesgeld</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F7F4F0] text-center">
            <span className="text-[10px] text-[#3E2340]/60 block font-semibold">
              Topf 2 (Wachstum)
            </span>
            <span className="font-serif font-bold text-base text-[#3E2340] block">
              {formatEuro(monthlyWachstum)}
            </span>
            <span className="text-[10px] text-[#3E2340]/60">Welt-ETF / Tilgung</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F7F4F0] text-center">
            <span className="text-[10px] text-[#3E2340]/60 block font-semibold">
              Topf 3 (Spaßgeld)
            </span>
            <span className="font-serif font-bold text-base text-[#3E2340] block">
              {formatEuro(monthlySpielgeld)}
            </span>
            <span className="text-[10px] text-[#3E2340]/60">Freie Freude</span>
          </div>
        </div>

        {/* Dynamic Überlauf-Regel */}
        <div className="p-3 rounded-xl bg-[#EFECE6] text-xs text-[#3E2340]/80 space-y-1">
          <p className="font-semibold text-[#B8873B] flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Die Überlauf-Regel für deinen Puffer
          </p>
          <p className="text-[11px] leading-relaxed">
            Sobald dein Sicherheits-Glas die empfohlenen {sparratenInfo.pufferMonate} Monatsausgaben Notgroschen erreicht hat, ist dieser Topf voll. Ab diesem Moment fließen 100 % deiner Monatsrate in Topf 2 (Wachstum) und Topf 3 (Spaßgeld)!
          </p>
        </div>

        {/* Sparrate mit Schieberegler simulieren */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-[#3E2340]/65">
            <span>Andere Sparrate simulieren:</span>
            <span className="font-semibold text-[#3E2340]">{interactiveRate} €</span>
          </div>
          <input
            type="range"
            min="25"
            max="1000"
            step="25"
            value={interactiveRate}
            onChange={(e) => setInteractiveRate(parseInt(e.target.value, 10))}
            className="w-full accent-[#B8873B] cursor-pointer"
          />
        </div>
      </div>

      {/* IMMOBILIEN-INTEGRATION & RATGEBER */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2 shadow-xs">
        <button
          type="button"
          onClick={() => setShowImmoDetails(!showImmoDetails)}
          className="w-full flex items-center justify-between text-left font-bold text-xs text-[#3E2340] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#B8873B]" />
            <span>Wie werden Immobilien & Eigenheim eingerechnet?</span>
          </div>
          {showImmoDetails ? (
            <ChevronUp className="w-4 h-4 text-[#3E2340]/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#3E2340]/60" />
          )}
        </button>

        {showImmoDetails && (
          <div className="space-y-2 pt-2 border-t border-[#E5DFD7] text-xs text-[#3E2340]/80">
            <p className="leading-relaxed">
              Immobilien sind ein wesentlicher Vermögensbaustein, teilen sich im Drei-Töpfe-Modell jedoch auf:
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
              <li>
                <strong>Monatliche Kredittilgung & Eigenkapital:</strong> Gehören zu <strong>Topf 2 (Wachstum)</strong>. Mit jeder Tilgungsrate wächst dein Sachvermögen, allerdings gebunden im Gebäude.
              </li>
              <li>
                <strong>Instandhaltungsrücklage:</strong> Gehört zwingend zu <strong>Topf 1 (Sicherheit)</strong>. Geld für eine neue Heizung oder Reparaturen muss jederzeit auf einem Tagesgeldkonto liquide bereitstehen.
              </li>
              <li>
                <strong>Vermietete Immobilien:</strong> Gehören zu <strong>Topf 2 (Wachstum)</strong> als renditeorientierter Sachwert.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* SCHULDEN-BEWERTUNG: IMMOBILIENSCHULDEN VS. KONSUMSCHULDEN */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {answers.schulden === "nur_immobilie" ? (
              <div className="w-7 h-7 rounded-xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
            ) : answers.schulden === "konsum_ueber5" || answers.schulden === "ueber5" ? (
              <div className="w-7 h-7 rounded-xl bg-[#C44D34]/15 text-[#C44D34] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-xl bg-[#2E7D32]/15 text-[#2E7D32] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8873B] block">
                Schuldensituation im Detail
              </span>
              <h4 className="font-bold text-xs text-[#3E2340]">
                {answers.schulden === "nur_immobilie"
                  ? "Immobilienschulden: Sachwertaufbau statt Konsumschuld"
                  : answers.schulden === "konsum_ueber5" || answers.schulden === "ueber5"
                  ? "Teure Konsumschulden: Erst tilgen, dann investieren"
                  : answers.schulden === "konsum_unter5" || answers.schulden === "unter5"
                  ? "Günstige Kredite (< 5 %): Planmäßig tilgen & parallel anlegen"
                  : "Schuldenfrei: Optimale Ausgangslage"}
              </h4>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#3E2340]/80 leading-relaxed">
          {answers.schulden === "nur_immobilie" ? (
            <>
              Dein Baukredit ist <strong>kein Grund für einen Anlagestopp</strong>! Jede monatliche Rate enthält einen <strong>Tilgungsanteil</strong>, mit dem du aktiv Nettovermögen in <strong>Topf 2 (Wachstum)</strong> aufbaust. Da eine Baufinanzierung 20 bis 30 Jahre läuft, würdest du ohne parallelen Sparplan wertvolle Jahrzehnte des Zinseszinses verpassen. Wichtig: Halte in <strong>Topf 1 (Sicherheit)</strong> eine eigene Instandhaltungsrücklage (1–2 €/qm) vor, damit Reparaturen nie in den Dispo führen.
            </>
          ) : answers.schulden === "konsum_ueber5" || answers.schulden === "ueber5" ? (
            <>
              Dispo, Kreditkarten oder Ratenkredite kosten garantiert 8 % bis 15 % Zinsen pro Jahr. Das frisst jeden Kapitalmarktertrag sofort auf. Die Tilgung von Konsumschulden bringt dir eine <strong>garantierte, steuerfreie 'Rendite'</strong> in Höhe deines Kreditzinses. Priorisiere das Schließen dieser Kredite!
            </>
          ) : answers.schulden === "konsum_unter5" || answers.schulden === "unter5" ? (
            <>
              Deine Kredite (z. B. KfW-, Studien- oder Autokredit) haben niedrige Zinsen. Du kannst sie geordnet weiter bedienen und parallel bereits mit deinem Drei-Töpfe-Sparplan starten, da die langfristige Rendite an den Aktienmärkten historisch höher liegt.
            </>
          ) : (
            <>
              Du hast weder Immobilienschulden noch teure Konsumschulden. Deine monatlichen Ersparnisse fließen direkt und ungeschmälert in den Aufbau deiner drei Töpfe.
            </>
          )}
        </p>

        {onOpenGlossary && (
          <button
            type="button"
            onClick={() => onOpenGlossary("Schuldenarten")}
            className="text-[11px] font-semibold text-[#B8873B] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
          >
            <span>Mehr erfahren: Warum Baukredite anders bewertet werden als Konsumschulden</span>
          </button>
        )}
      </div>

      {/* Detaillierte Auswertungstabelle (Ist vs. Soll) */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-[#3E2340] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#B8873B]" />
            <span>Bestand & Rebalancing-Schritte</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E5DFD7] text-[#3E2340]/60">
                <th className="pb-2 font-medium">Topf</th>
                <th className="pb-2 font-medium text-right">Ist</th>
                <th className="pb-2 font-medium text-right">Soll</th>
                <th className="pb-2 font-medium text-right">Differenz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD7]/60">
              <tr>
                <td className="py-2.5 font-semibold text-[#3E2340]">1. Sicherheit</td>
                <td className="py-2.5 text-right">{formatEuro(istBestand.sicherheit)}</td>
                <td className="py-2.5 text-right font-medium">{formatEuro(sollEuro.sicherheit)}</td>
                <td className="py-2.5 text-right font-bold text-[#3E2340]">
                  {getMeasure(diffEuro.sicherheit)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-[#3E2340]">2. Wachstum</td>
                <td className="py-2.5 text-right">{formatEuro(istBestand.wachstum)}</td>
                <td className="py-2.5 text-right font-medium">{formatEuro(sollEuro.wachstum)}</td>
                <td className="py-2.5 text-right font-bold text-[#3E2340]">
                  {getMeasure(diffEuro.wachstum)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-[#3E2340]">3. Spaßgeld</td>
                <td className="py-2.5 text-right">{formatEuro(istBestand.spielgeld)}</td>
                <td className="py-2.5 text-right font-medium">{formatEuro(sollEuro.spielgeld)}</td>
                <td className="py-2.5 text-right font-bold text-[#3E2340]">
                  {getMeasure(diffEuro.spielgeld)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {hasSales && (
          <div className="p-3 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] text-[11px] text-[#3E2340]/75 leading-relaxed">
            <strong>Hinweis zum Umschichten:</strong> Beim Verkauf von Wertpapieren können Steuern anfallen. Nutze den jährlichen Sparer-Pauschbetrag von 1.000 € (bzw. 2.000 € bei Verheirateten) und beachte die 30 % Teilfreistellung bei Aktienfonds.
          </div>
        )}
      </div>

      {/* Konkrete Anlagebeispiele für die Töpfe */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-3 text-xs shadow-xs">
        <h3 className="font-semibold text-[#3E2340] uppercase tracking-wider text-xs">
          Konkrete Anlageformen für deine Töpfe
        </h3>

        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-1">
            <span className="font-semibold text-[#3E2340] block">
              1. Für das Sicherheits-Glas:
            </span>
            <p className="text-[#3E2340]/75 leading-relaxed text-[11px]">
              {getPotExamples("sicherheit", answers)}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-1">
            <span className="font-semibold text-[#3E2340] block">
              2. Für das Wachstums-Glas:
            </span>
            <p className="text-[#3E2340]/75 leading-relaxed text-[11px]">
              {getPotExamples("wachstum", answers)}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F7F4F0] space-y-1">
            <span className="font-semibold text-[#3E2340] block">
              3. Für das Spaßgeld-Glas:
            </span>
            <p className="text-[#3E2340]/75 leading-relaxed text-[11px]">
              {getPotExamples("spielgeld", answers)}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible: "Warum dieses Ergebnis?" */}
      <div className="p-4 rounded-2xl bg-[#EFECE6] border border-[#E5DFD7] space-y-2 text-xs">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between text-left font-bold text-[#3E2340] cursor-pointer"
        >
          <span>Warum dieses Ergebnis? (Punkte & Regeln)</span>
          {showExplanation ? (
            <ChevronUp className="w-4 h-4 text-[#3E2340]/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#3E2340]/60" />
          )}
        </button>

        {showExplanation && (
          <div className="space-y-3 pt-2 text-[#3E2340]/80">
            <div className="space-y-1.5">
              <span className="font-semibold block text-[#3E2340]">Punkteverteilung:</span>
              <ul className="space-y-1 text-[11px]">
                {breakdown.items.map((it) => (
                  <li key={it.key} className="flex justify-between border-b border-[#E5DFD7] pb-1">
                    <span>
                      {it.label} ({it.valueLabel})
                    </span>
                    <span className="font-semibold">{it.points} Pkt.</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold pt-1 text-xs text-[#3E2340]">
                <span>Gesamtpunktzahl:</span>
                <span>{breakdown.totalScore} Punkte (Basis: {breakdown.baseProfile})</span>
              </div>
            </div>

            {breakdown.appliedOverride && (
              <div className="p-2.5 rounded-xl bg-white border border-[#B8873B]/30 space-y-1">
                <span className="font-semibold text-[#B8873B] block">
                  Angewandte Schutzregel:
                </span>
                <p className="text-[11px] leading-relaxed">
                  {breakdown.appliedOverride}
                </p>
              </div>
            )}

            <div className="text-[10px] text-[#3E2340]/60 space-y-0.5">
              <p>• 0–4 Pkt. = Vorsichtig (70/30/0)</p>
              <p>• 5–9 Pkt. = Ausgewogen (40/55/5)</p>
              <p>• 10–13 Pkt. = Offensiv (20/70/10)</p>
              <p className="pt-1">
                Deine Angaben auf den Skalen für Nachhaltigkeit ({answers.nachhaltigkeitScale}/10) und haptische Sachwerte ({answers.greifbarScale}/10) passen die Produktbeispiele gezielt an, berühren jedoch nicht die Kernquote.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alert Box: "Dein Vermögen, dein Name." */}
      <div className="p-4 rounded-2xl bg-[#3E2340] text-[#F7F4F0] space-y-2 text-xs shadow-md">
        <h4 className="font-serif text-lg font-bold text-[#F7F4F0] flex items-center gap-1.5">
          <span>Dein Vermögen, dein Name.</span>
        </h4>
        <p className="text-[#F7F4F0]/85 leading-relaxed">
          Führe Depot und Sparplan immer auf deinen eigenen Namen, nicht nur über
          ein gemeinsames Konto. Der Gender Pension Gap in Deutschland liegt je
          nach Berechnung zwischen 26 und 37 Prozent. Eigenes Vermögen ist
          deine persönliche Unabhängigkeit.
        </p>
      </div>

      {/* Restart Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="w-full min-h-[48px] rounded-2xl bg-white border border-[#E5DFD7] text-[#3E2340] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F7F4F0] active:scale-[0.99] transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-4 h-4 text-[#B8873B]" />
          <span>Neu berechnen oder anpassen</span>
        </button>
      </div>
    </div>
  );
}
