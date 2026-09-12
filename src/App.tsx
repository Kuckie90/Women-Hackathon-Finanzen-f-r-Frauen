/**
 * Topfgeld – Drei-Töpfe-Anlageaufteilung für Frauen
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
  HorizontChoice,
  ReaktionChoice,
  ZielChoice,
  NachhaltigkeitChoice,
  GreifbarChoice,
  LebenszieleConfig,
} from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { StartScreen } from "./components/StartScreen";
import { VorfrageScreen } from "./components/VorfrageScreen";
import { QuestionScreen } from "./components/QuestionScreen";
import { Question8Betraege } from "./components/Question8Betraege";
import { OptionalQuestionsScreen } from "./components/OptionalQuestionsScreen";
import { IstBestandScreen } from "./components/IstBestandScreen";
import { LebenszieleScreen } from "./components/LebenszieleScreen";
import { GateScreen } from "./components/GateScreen";
import { ResultScreen } from "./components/ResultScreen";
import { GlossaryModal } from "./components/GlossaryModal";
import { QUESTIONS } from "./data/questionsData";
import { DEFAULT_LEBENSZIELE } from "./utils/goalsAndPension";

// Initial state with NO pre-selected choices for questions
const INITIAL_ANSWERS: Answers = {
  erfahren: false,
  puffer: undefined,
  schulden: undefined,
  einkommen: undefined,
  unterbrechung: undefined,
  horizont: undefined,
  reaktion: undefined,
  ziel: undefined,
  nachhaltigkeitScale: 5,
  greifbarScale: 5,
  nachhaltigkeit: "egal",
  greifbar: "egal",
  einmalbetrag: 0,
  monatsrate: 150, // Healthy default suggested rate
  nettoeinkommen: undefined,
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

  // Reset to initial state
  const handleReset = () => {
    setStep("start");
    setAnswers(INITIAL_ANSWERS);
    setIstBestand(INITIAL_IST_BESTAND);
    setHasGateBypassed(false);
  };

  // Vorfrage Mode selection
  const handleSelectMode = (erfahren: boolean) => {
    setAnswers((prev) => ({ ...prev, erfahren }));
    setStep("q1_puffer");
  };

  // Question 1 to 7 handlers
  const handleSelectQ1 = (val: string) => {
    setAnswers((prev) => ({ ...prev, puffer: val as PufferChoice }));
    setStep("q2_schulden");
  };

  const handleSelectQ2 = (val: string) => {
    setAnswers((prev) => ({ ...prev, schulden: val as SchuldenChoice }));
    setStep("q3_einkommen");
  };

  const handleSelectQ3 = (val: string) => {
    setAnswers((prev) => ({ ...prev, einkommen: val as EinkommenChoice }));
    setStep("q4_unterbrechung");
  };

  const handleSelectQ4 = (val: string) => {
    setAnswers((prev) => ({ ...prev, unterbrechung: val as UnterbrechungChoice }));
    setStep("q5_horizont");
  };

  const handleSelectQ5 = (val: string) => {
    setAnswers((prev) => ({ ...prev, horizont: val as HorizontChoice }));
    setStep("q6_reaktion");
  };

  const handleSelectQ6 = (val: string) => {
    setAnswers((prev) => ({ ...prev, reaktion: val as ReaktionChoice }));
    setStep("q7_ziel");
  };

  const handleSelectQ7 = (val: string) => {
    setAnswers((prev) => ({ ...prev, ziel: val as ZielChoice }));
    setStep("q_lebensziele");
  };

  // Lebensziele & Rentenlücke handler
  const handleSubmitLebensziele = (lebensziele: LebenszieleConfig) => {
    setAnswers((prev) => ({ ...prev, lebensziele }));
    setStep("q8_betraege");
  };

  // Question 8 handler (Beträge & berechnete Sparrate)
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
    setStep("q_optional");
  };

  // Optional questions handler (1-10 scales)
  const handleSubmitOptional = (
    nachhaltigkeitScale: number,
    greifbarScale: number,
    nachhaltigkeit: NachhaltigkeitChoice,
    greifbar: GreifbarChoice
  ) => {
    setAnswers((prev) => ({
      ...prev,
      nachhaltigkeitScale,
      greifbarScale,
      nachhaltigkeit,
      greifbar,
    }));
    setStep("ist_bestand");
  };

  // Check gate condition
  const checkGateAndProceed = (currentIst: IstBestand) => {
    setIstBestand(currentIst);
    const hasExpensiveConsumerDebt =
      answers.schulden === "konsum_ueber5" || answers.schulden === "ueber5";
    const triggersGate =
      answers.puffer === "unter3" || hasExpensiveConsumerDebt;

    if (triggersGate) {
      setStep("gate");
    } else {
      setHasGateBypassed(false);
      setStep("auswertung");
    }
  };

  const handleIstBestandSubmit = (values: IstBestand) => {
    checkGateAndProceed(values);
  };

  const handleIstBestandSkip = () => {
    checkGateAndProceed({ sicherheit: 0, wachstum: 0, spielgeld: 0 });
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
      case "q6_reaktion":
        setStep("q5_horizont");
        break;
      case "q7_ziel":
        setStep("q6_reaktion");
        break;
      case "q_lebensziele":
        setStep("q7_ziel");
        break;
      case "q8_betraege":
        setStep("q_lebensziele");
        break;
      case "q_optional":
        setStep("q8_betraege");
        break;
      case "ist_bestand":
        setStep("q_optional");
        break;
      case "gate":
        setStep("ist_bestand");
        break;
      case "auswertung":
        setStep("ist_bestand");
        break;
      default:
        setStep("start");
    }
  };

  // Calculate question step numbers for progress bar
  let stepNumber: number | undefined;
  const totalSteps = 9;
  switch (step) {
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
    case "q6_reaktion":
      stepNumber = 6;
      break;
    case "q7_ziel":
      stepNumber = 7;
      break;
    case "q_lebensziele":
      stepNumber = 8;
      break;
    case "q8_betraege":
      stepNumber = 9;
      break;
    default:
      stepNumber = undefined;
  }

  const isExplainMode = !answers.erfahren;

  return (
    <div className="min-h-screen bg-[#F7F4F0] text-[#3E2340] flex flex-col justify-between items-center selection:bg-[#B8873B]/20">
      {/* Mobile-first wrapper: 390px default, centered up to 430px on desktop */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-[#F7F4F0] border-x border-[#E5DFD7]/60 shadow-xs relative">
        {/* Header with back button and progress */}
        {step !== "start" && (
          <Header
            stepNumber={stepNumber}
            totalSteps={totalSteps}
            onBack={handleBack}
            onReset={handleReset}
            isExplainMode={isExplainMode}
          />
        )}

        {/* Main Step Content */}
        <main className="flex-1 flex flex-col">
          {step === "start" && (
            <StartScreen onStart={() => setStep("vorfrage")} />
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
              onSelect={handleSelectQ4}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
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

          {step === "q6_reaktion" && (
            <QuestionScreen
              question={QUESTIONS[5]}
              selectedValue={answers.reaktion}
              onSelect={handleSelectQ6}
              isExplainMode={isExplainMode}
              onOpenGlossary={setActiveGlossaryKey}
            />
          )}

          {step === "q7_ziel" && (
            <QuestionScreen
              question={QUESTIONS[6]}
              selectedValue={answers.ziel}
              onSelect={handleSelectQ7}
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
            />
          )}

          {step === "q8_betraege" && (
            <Question8Betraege
              initialEinmalbetrag={answers.einmalbetrag}
              initialMonatsrate={answers.monatsrate}
              initialNettoeinkommen={answers.nettoeinkommen}
              monatlicheSparrateFuerRente={answers.lebensziele?.rentenluecke.monatlicheSparrateFuerRente}
              onSubmit={handleSubmitQ8}
              isExplainMode={isExplainMode}
            />
          )}

          {step === "q_optional" && (
            <OptionalQuestionsScreen
              initialNachhaltigkeitScale={answers.nachhaltigkeitScale}
              initialGreifbarScale={answers.greifbarScale}
              onSubmit={handleSubmitOptional}
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
      </div>
    </div>
  );
}
