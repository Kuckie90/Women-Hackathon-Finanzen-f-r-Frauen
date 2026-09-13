/**
 * Angelegt – Drei-Töpfe-Anlageaufteilung für Frauen
 */

import { useState } from "react";
import {
  Answers,
  IstBestand,
  AppStep,
  PufferChoice,
  SchuldenChoice,
  EinkommenChoice,
  UnterbrechungChoice,
  UnterbrechungDetails,
  HorizontChoice,
  ReaktionChoice,
  RenditeFokusChoice,
  VerlustToleranzChoice,
  ErfahrungChoice,
  ZielChoice,
  NachhaltigkeitChoice,
  GreifbarChoice,
  EntscheidungsStilChoice,
  MarkenPraeferenzChoice,
  TechAffinitaetChoice,
  LebenszieleConfig,
} from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { StartScreen, StartModule } from "./components/StartScreen";
import { HaushaltsrechnungScreen } from "./components/HaushaltsrechnungScreen";
import { SparplanerScreen } from "./components/SparplanerScreen";
import { VorfrageScreen } from "./components/VorfrageScreen";
import { QuestionScreen } from "./components/QuestionScreen";
import { Question8Betraege } from "./components/Question8Betraege";
import { OptionalQuestionsScreen } from "./components/OptionalQuestionsScreen";
import { IstBestandScreen } from "./components/IstBestandScreen";
import { LebenszieleScreen } from "./components/LebenszieleScreen";
import { GateScreen } from "./components/GateScreen";
import { SollStandScreen } from "./components/SollStandScreen";
import { IstAnalyseScreen } from "./components/IstAnalyseScreen";
import { SparrateAllokationScreen } from "./components/SparrateAllokationScreen";
import { ResultScreen } from "./components/ResultScreen";
import { GlossaryModal } from "./components/GlossaryModal";
import { ArchitectureModal } from "./components/ArchitectureModal";
import { QUESTIONS } from "./data/questionsData";
import { DEFAULT_LEBENSZIELE } from "./utils/goalsAndPension";

// Initial state with NO pre-selected choices for questions or prepopulated profile
const INITIAL_ANSWERS: Answers = {
  erfahren: false,
  puffer: undefined,
  schulden: undefined,
  einkommen: undefined,
  unterbrechung: undefined,
  unterbrechungDetails: undefined,
  horizont: undefined,
  reaktion: undefined,
  renditeFokus: undefined,
  verlustToleranz: undefined,
  erfahrungLevel: undefined,
  ziel: undefined,
  nachhaltigkeitScale: undefined,
  greifbarScale: undefined,
  nachhaltigkeit: undefined,
  greifbar: undefined,
  einmalbetrag: 0,
  monatsrate: 0,
  nettoeinkommen: undefined,
  hasCalculatedRentenluecke: false,
  lebensziele: DEFAULT_LEBENSZIELE,
};

const INITIAL_IST_BESTAND: IstBestand = {
  sicherheit: 0,
  wachstum: 0,
  spielgeld: 0,
  immobilien: undefined,
};

export default function App() {
  const [step, setStep] = useState<AppStep>("start");
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [istBestand, setIstBestand] = useState<IstBestand>(INITIAL_IST_BESTAND);
  const [hasGateBypassed, setHasGateBypassed] = useState<boolean>(false);
  const [activeGlossaryKey, setActiveGlossaryKey] = useState<string | null>(null);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [returnStepAfterLebensziele, setReturnStepAfterLebensziele] = useState<AppStep | null>(null);

  // Reset to initial state
  const handleReset = () => {
    setStep("start");
    setAnswers(INITIAL_ANSWERS);
    setIstBestand(INITIAL_IST_BESTAND);
    setHasGateBypassed(false);
    setReturnStepAfterLebensziele(null);
  };

  // Handler for Start Screen 4 Modules
  const handleSelectStartModule = (module: StartModule) => {
    if (module === "assetanalyse") {
      setStep("vorfrage");
    } else if (module === "rentenluecke") {
      setReturnStepAfterLebensziele("start");
      setStep("q_lebensziele");
    } else if (module === "haushaltsrechnung") {
      setStep("haushaltsrechnung");
    } else if (module === "sparplaner") {
      setStep("sparplaner");
    }
  };

  // Vorfrage Mode selection
  const handleSelectMode = (erfahren: boolean) => {
    setAnswers((prev) => ({ ...prev, erfahren }));
    setStep("q1_puffer");
  };

  // Question 1 to 6 handlers
  const handleSelectQ1 = (val: string) => {
    setAnswers((prev) => ({ ...prev, puffer: val as PufferChoice }));
    setStep("q2_schulden");
  };

  const handleSelectQ2 = (val: string) => {
    setAnswers((prev) => ({ ...prev, schulden: val as SchuldenChoice }));
    setStep("q3_einkommen");
  };

  const handleSelectQ3 = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      einkommen: val as EinkommenChoice,
      // If user selected planned sabbatical/break in Q3, pre-fill Q4 as "ja" if not already set
      ...(val === "auszeit_geplant" && !prev.unterbrechung ? { unterbrechung: "ja" } : {}),
    }));
    setStep("q4_unterbrechung");
  };

  const handleSelectQ4 = (val: string, extraDetails?: UnterbrechungDetails) => {
    setAnswers((prev) => ({
      ...prev,
      unterbrechung: val as UnterbrechungChoice,
      unterbrechungDetails: extraDetails,
    }));
    setStep("q5_horizont");
  };

  const handleSelectQ5 = (val: string) => {
    setAnswers((prev) => ({ ...prev, horizont: val as HorizontChoice }));
    setStep("q6_renditefokus");
  };

  const handleSelectQ6 = (val: string) => {
    setAnswers((prev) => ({ ...prev, renditeFokus: val as RenditeFokusChoice }));
    setStep("q7_verlusttoleranz");
  };

  const handleSelectQ7 = (val: string) => {
    setAnswers((prev) => ({ ...prev, verlustToleranz: val as VerlustToleranzChoice }));
    setStep("q8_erfahrung");
  };

  const handleSelectQ8 = (val: string) => {
    setAnswers((prev) => ({ ...prev, erfahrungLevel: val as ErfahrungChoice }));
    setStep("q9_ziel");
  };

  const handleSelectQ9 = (val: string) => {
    setAnswers((prev) => ({ ...prev, ziel: val as ZielChoice }));
    setStep("q10_reaktion");
  };

  // Q10: Reaktion bei 30% Minus im Depot (Anlegerinnenpersönlichkeit)
  const handleSelectQ10 = (val: string) => {
    setAnswers((prev) => ({ ...prev, reaktion: val as ReaktionChoice }));
    setStep("q11_entscheidungsstil");
  };

  // Q11: Entscheidungs- und Kontrollstil (Anlegerinnenpersönlichkeit)
  const handleSelectQ11 = (val: string) => {
    setAnswers((prev) => ({ ...prev, entscheidungsStil: val as EntscheidungsStilChoice }));
    setStep("q12_greifbar");
  };

  // Q12: Greifbare Sachwerte (Anlegerinnenpersönlichkeit)
  const handleSelectQ12 = (val: string) => {
    const scale = val === "physisch" ? 8 : val === "ausgewogen" ? 5 : 2;
    const choice: GreifbarChoice = val === "physisch" ? "greifbar" : "egal";
    setAnswers((prev) => ({
      ...prev,
      greifbar: choice,
      greifbarScale: scale,
    }));
    setStep("q13_nachhaltigkeit");
  };

  // Q13: Nachhaltigkeit & Ethik (Anlegerinnenpersönlichkeit) -> Directly to Topfverteilungsvorschlag!
  const handleSelectQ13 = (val: string) => {
    const scale = val === "strikt" ? 9 : val === "wichtig" ? 7 : 3;
    const choice: NachhaltigkeitChoice = val === "pragmatisch" ? "egal" : "wichtig";
    setAnswers((prev) => ({
      ...prev,
      nachhaltigkeit: choice,
      nachhaltigkeitScale: scale,
    }));
    // All questions finished -> first step is the proposed pot allocation (Soll-Stand)
    setStep("soll_stand");
  };

  // Lebensziele & Rentenlücke handler
  const handleSubmitLebensziele = (lebensziele: LebenszieleConfig) => {
    setAnswers((prev) => ({
      ...prev,
      lebensziele,
      hasCalculatedRentenluecke: true,
      monatsrate:
        prev.monatsrate > 0
          ? prev.monatsrate
          : lebensziele.rentenluecke.monatlicheSparrateFuerRente,
    }));
    if (returnStepAfterLebensziele && returnStepAfterLebensziele !== "start") {
      const dest = returnStepAfterLebensziele;
      setReturnStepAfterLebensziele(null);
      setStep(dest);
    } else {
      // Direct module from start: proceed into assetanalyse with prefilled Rentenlücke rate
      setReturnStepAfterLebensziele(null);
      setStep("vorfrage");
    }
  };

  // Optional Question 8 handler (Beträge & berechnete Sparrate)
  const handleSubmitQ8 = (
    einmalbetrag: number,
    monatsrate: number,
    nettoeinkommen?: number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      einmalbetrag,
      monatsrate,
      nettoeinkommen,
    }));
    setStep("soll_stand");
  };

  // Haushaltsrechnung & Sparplaner Handlers
  const handleApplyHaushaltSavings = (monatsrate: number, nettoeinkommen: number) => {
    setAnswers((prev) => ({
      ...prev,
      monatsrate,
      nettoeinkommen,
    }));
    setStep("vorfrage");
  };

  const handleOpenSparplanerFromHaushalt = (monatsrate: number) => {
    setAnswers((prev) => ({
      ...prev,
      monatsrate,
    }));
    setStep("sparplaner");
  };

  const handleApplySparplan = (monatsrate: number, einmalbetrag: number) => {
    setAnswers((prev) => ({
      ...prev,
      monatsrate,
      einmalbetrag,
    }));
    setStep("vorfrage");
  };

  // Check gate condition
  const checkGateAndProceed = (currentIst: IstBestand) => {
    setIstBestand(currentIst);
    const hasConsumerDebt =
      answers.schulden === "konsum" ||
      answers.schulden === "konsum_ueber5" ||
      answers.schulden === "ueber5";
    const triggersGate =
      answers.puffer === "unter3" || hasConsumerDebt;

    if (triggersGate) {
      setStep("gate");
    } else {
      setHasGateBypassed(false);
      setStep("auswertung");
    }
  };

  const handleIstBestandSubmit = (values: IstBestand) => {
    setIstBestand(values);
    setStep("ist_analyse");
  };

  const handleIstBestandSkip = () => {
    setIstBestand({ sicherheit: 0, wachstum: 0, spielgeld: 0 });
    setStep("ist_analyse");
  };

  // Gate actions
  const handleGateProceed = () => {
    setHasGateBypassed(true);
    setStep("auswertung");
  };

  // Back navigation
  const handleBack = () => {
    switch (step) {
      case "vorfrage":
        setStep("start");
        break;
      case "q1_puffer":
        setStep("vorfrage");
        break;
      case "q2_schulden":
        setStep("q1_puffer");
        break;
      case "q3_einkommen":
        setStep("q2_schulden");
        break;
      case "q4_unterbrechung":
        setStep("q3_einkommen");
        break;
      case "q5_horizont":
        setStep("q4_unterbrechung");
        break;
      case "q6_renditefokus":
        setStep("q5_horizont");
        break;
      case "q7_verlusttoleranz":
        setStep("q6_renditefokus");
        break;
      case "q8_erfahrung":
        setStep("q7_verlusttoleranz");
        break;
      case "q9_ziel":
        setStep("q8_erfahrung");
        break;
      case "q10_reaktion":
        setStep("q9_ziel");
        break;
      case "q11_entscheidungsstil":
        setStep("q10_reaktion");
        break;
      case "q12_greifbar":
        setStep("q11_entscheidungsstil");
        break;
      case "q13_nachhaltigkeit":
        setStep("q12_greifbar");
        break;
      case "q_lebensziele":
        if (returnStepAfterLebensziele) {
          const dest = returnStepAfterLebensziele;
          setReturnStepAfterLebensziele(null);
          setStep(dest);
        } else {
          setStep("start");
        }
        break;
      case "q8_betraege":
        setStep("q13_nachhaltigkeit");
        break;
      case "haushaltsrechnung":
        setStep("start");
        break;
      case "sparplaner":
        setStep("start");
        break;
      case "soll_stand":
        setStep("q13_nachhaltigkeit");
        break;
      case "ist_bestand":
        setStep("soll_stand");
        break;
      case "ist_analyse":
        setStep("ist_bestand");
        break;
      case "sparrate_allokation":
        setStep("ist_analyse");
        break;
      case "gate":
        setStep("sparrate_allokation");
        break;
      case "auswertung":
        setStep("sparrate_allokation");
        break;
      default:
        setStep("start");
    }
  };

  // Calculate question step numbers and titles for progress bar and header
  let stepNumber: number | undefined;
  let totalSteps: number | undefined = 13;
  let stepTitle: string | undefined;

  switch (step) {
    case "vorfrage":
      stepTitle = "Vorfrage: Begleitmodus";
      totalSteps = undefined;
      break;
    case "q1_puffer":
      stepNumber = 1;
      break;
    case "q2_schulden":
      stepNumber = 2;
      break;
    case "q3_einkommen":
      stepNumber = 3;
      break;
    case "q4_unterbrechung":
      stepNumber = 4;
      break;
    case "q5_horizont":
      stepNumber = 5;
      break;
    case "q6_renditefokus":
      stepNumber = 6;
      break;
    case "q7_verlusttoleranz":
      stepNumber = 7;
      break;
    case "q8_erfahrung":
      stepNumber = 8;
      break;
    case "q9_ziel":
      stepNumber = 9;
      break;
    case "q10_reaktion":
      stepNumber = 10;
      break;
    case "q11_entscheidungsstil":
      stepNumber = 11;
      break;
    case "q12_greifbar":
      stepNumber = 12;
      break;
    case "q13_nachhaltigkeit":
      stepNumber = 13;
      break;
    case "q_lebensziele":
      stepTitle = "Rentenlücke & Altersvorsorge";
      totalSteps = undefined;
      break;
    case "q8_betraege":
      stepTitle = "Beträge & Sparrate";
      totalSteps = undefined;
      break;
    case "haushaltsrechnung":
      stepTitle = "Haushaltsrechnung (50/30/20)";
      totalSteps = undefined;
      break;
    case "sparplaner":
      stepTitle = "Sparplaner & Zinseszins";
      totalSteps = undefined;
      break;
    case "soll_stand":
      stepTitle = "1. Topfverteilungsvorschlag";
      totalSteps = undefined;
      break;
    case "ist_bestand":
      stepTitle = "2. Bestehende Anlagen";
      totalSteps = undefined;
      break;
    case "ist_analyse":
      stepTitle = "2. Analyse deiner Anlagen";
      totalSteps = undefined;
      break;
    case "sparrate_allokation":
      stepTitle = "3. Sparrate & Allokation";
      totalSteps = undefined;
      break;
    case "gate":
      stepTitle = "Sicherheits-Check";
      totalSteps = undefined;
      break;
    case "auswertung":
      stepTitle = "Ergebnis & Vermögensstruktur";
      totalSteps = undefined;
      break;
    default:
      stepNumber = undefined;
      totalSteps = undefined;
  }

  const isExplainMode = !answers.erfahren;
  const isQuestionSlide =
    stepNumber !== undefined ||
    step === "q8_betraege" ||
    step === "q_lebensziele" ||
    step === "haushaltsrechnung" ||
    step === "sparplaner";

  return (
    <div className="min-h-screen bg-[#F7F4F0] text-[#3E2340] flex flex-col justify-between items-center selection:bg-[#B8873B]/20">
      {/* Mobile-first wrapper: 390px default, centered up to 430px on desktop */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-[#F7F4F0] border-x border-[#E5DFD7]/60 shadow-xs relative">
        {/* Header with back button and progress */}
        {step !== "start" && (
          <Header
            stepNumber={stepNumber}
            totalSteps={totalSteps}
            stepTitle={stepTitle}
            onBack={handleBack}
            onReset={handleReset}
            isExplainMode={isExplainMode}
            isQuestionSlide={isQuestionSlide}
            onOpenArchitecture={() => setShowArchitectureModal(true)}
          />
        )}

        {/* Main Step Content */}
        <main className="flex-1 flex flex-col">
          {step === "start" && (
            <StartScreen onSelectModule={handleSelectStartModule} />
          )}

          {step === "vorfrage" && (
            <VorfrageScreen onSelectMode={handleSelectMode} />
          )}

          {step === "q1_puffer" && (
            <QuestionScreen
              question={QUESTIONS[0]}
              selectedValue={answers.puffer}
              onSelect={handleSelectQ1}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q2_schulden" && (
            <QuestionScreen
              question={QUESTIONS[1]}
              selectedValue={answers.schulden}
              onSelect={handleSelectQ2}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q3_einkommen" && (
            <QuestionScreen
              question={QUESTIONS[2]}
              selectedValue={answers.einkommen}
              onSelect={handleSelectQ3}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q4_unterbrechung" && (
            <QuestionScreen
              question={QUESTIONS[3]}
              selectedValue={answers.unterbrechung}
              initialDetails={answers.unterbrechungDetails}
              onSelect={handleSelectQ4}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
              contextNote={
                answers.einkommen === "auszeit_geplant"
                  ? "Da du im vorherigen Schritt eine geplante Auszeit / ein Sabbatical gewählt hast: Hier kannst du Zeitpunkt, Dauer und den Umfang genau definieren."
                  : undefined
              }
            />
          )}

          {step === "q5_horizont" && (
            <QuestionScreen
              question={QUESTIONS[4]}
              selectedValue={answers.horizont}
              onSelect={handleSelectQ5}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q6_renditefokus" && (
            <QuestionScreen
              question={QUESTIONS[5]}
              selectedValue={answers.renditeFokus}
              onSelect={handleSelectQ6}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q7_verlusttoleranz" && (
            <QuestionScreen
              question={QUESTIONS[6]}
              selectedValue={answers.verlustToleranz}
              onSelect={handleSelectQ7}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q8_erfahrung" && (
            <QuestionScreen
              question={QUESTIONS[7]}
              selectedValue={answers.erfahrungLevel}
              onSelect={handleSelectQ8}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q9_ziel" && (
            <QuestionScreen
              question={QUESTIONS[8]}
              selectedValue={answers.ziel}
              onSelect={handleSelectQ9}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
              hasCalculatedRentenluecke={answers.hasCalculatedRentenluecke}
              rentenRate={answers.lebensziele?.rentenluecke.monatlicheSparrateFuerRente}
              onNavigateToRentenluecke={() => {
                setReturnStepAfterLebensziele("q9_ziel");
                setStep("q_lebensziele");
              }}
            />
          )}

          {step === "q10_reaktion" && (
            <QuestionScreen
              question={QUESTIONS[9]}
              selectedValue={answers.reaktion}
              onSelect={handleSelectQ10}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q11_entscheidungsstil" && (
            <QuestionScreen
              question={QUESTIONS[10]}
              selectedValue={answers.entscheidungsStil}
              onSelect={handleSelectQ11}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q12_greifbar" && (
            <QuestionScreen
              question={QUESTIONS[11]}
              selectedValue={
                answers.greifbar === "greifbar"
                  ? "physisch"
                  : answers.greifbarScale !== undefined
                  ? answers.greifbarScale <= 3
                    ? "digital"
                    : "ausgewogen"
                  : undefined
              }
              onSelect={handleSelectQ12}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q13_nachhaltigkeit" && (
            <QuestionScreen
              question={QUESTIONS[12]}
              selectedValue={
                answers.nachhaltigkeitScale !== undefined
                  ? answers.nachhaltigkeitScale >= 8
                    ? "strikt"
                    : answers.nachhaltigkeitScale >= 5
                    ? "wichtig"
                    : "pragmatisch"
                  : undefined
              }
              onSelect={handleSelectQ13}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q_lebensziele" && (
            <LebenszieleScreen
              initialConfig={answers.lebensziele}
              nettoeinkommen={answers.nettoeinkommen}
              onSubmit={handleSubmitLebensziele}
              onOpenGlossary={setActiveGlossaryKey}
              onBackToStart={() => setStep("start")}
              isStandaloneFromStart={returnStepAfterLebensziele === "start"}
            />
          )}

          {step === "q8_betraege" && (
            <Question8Betraege
              initialEinmalbetrag={answers.einmalbetrag}
              initialMonatsrate={answers.monatsrate}
              initialNettoeinkommen={answers.nettoeinkommen}
              monatlicheSparrateFuerRente={answers.lebensziele?.rentenluecke.monatlicheSparrateFuerRente}
              hasCalculatedRentenluecke={answers.hasCalculatedRentenluecke}
              onOpenRentenluecke={() => {
                setReturnStepAfterLebensziele("q8_betraege");
                setStep("q_lebensziele");
              }}
              onSubmit={handleSubmitQ8}
              isExplainMode={isExplainMode}
            />
          )}

          {step === "haushaltsrechnung" && (
            <HaushaltsrechnungScreen
              initialNetto={answers.nettoeinkommen}
              onApplySavingsRate={handleApplyHaushaltSavings}
              onOpenSparplaner={handleOpenSparplanerFromHaushalt}
              onBackToStart={() => setStep("start")}
            />
          )}

          {step === "sparplaner" && (
            <SparplanerScreen
              initialMonatsrate={answers.monatsrate}
              initialEinmalbetrag={answers.einmalbetrag}
              onApplyPlan={handleApplySparplan}
              onBackToStart={() => setStep("start")}
            />
          )}

          {step === "soll_stand" && (
            <SollStandScreen
              answers={answers}
              onUpdateAllocation={(alloc) =>
                setAnswers((prev) => ({
                  ...prev,
                  customAllocation: alloc || undefined,
                }))
              }
              onContinueToIst={() => setStep("ist_bestand")}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "ist_bestand" && (
            <IstBestandScreen
              initialValues={istBestand}
              isExplainMode={isExplainMode}
              onSubmit={handleIstBestandSubmit}
              onSkip={handleIstBestandSkip}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "ist_analyse" && (
            <IstAnalyseScreen
              answers={answers}
              istBestand={istBestand}
              onContinueToSparrate={() => setStep("sparrate_allokation")}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "sparrate_allokation" && (
            <SparrateAllokationScreen
              answers={answers}
              istBestand={istBestand}
              onUpdateMonatsrate={(rate) =>
                setAnswers((prev) => ({
                  ...prev,
                  monatsrate: rate,
                }))
              }
              onOpenFullResult={() => checkGateAndProceed(istBestand)}
              onRestart={handleReset}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "gate" && (
            <GateScreen
              puffer={answers.puffer}
              schulden={answers.schulden}
              onProceed={handleGateProceed}
              onBackToAdjust={() => setStep("q1_puffer")}
            />
          )}

          {step === "auswertung" && (
            <ResultScreen
              answers={answers}
              istBestand={istBestand}
              hasGateWarning={
                hasGateBypassed &&
                (answers.puffer === "unter3" ||
                  answers.schulden === "konsum" ||
                  answers.schulden === "konsum_ueber5" ||
                  answers.schulden === "ueber5")
              }
              onRestart={handleReset}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}
        </main>

        {/* Compliance Footer on EVERY screen */}
        <Footer />

        {/* Modal for interactive term explanations */}
        <GlossaryModal
          glossaryKey={activeGlossaryKey}
          onClose={() => setActiveGlossaryKey(null)}
        />

        {/* Modal for MVP vs. Overall FinWise Platform Architecture */}
        <ArchitectureModal
          isOpen={showArchitectureModal}
          onClose={() => setShowArchitectureModal(false)}
        />
      </div>
    </div>
  );
}
