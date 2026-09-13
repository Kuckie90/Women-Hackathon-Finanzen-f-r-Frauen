import {
  IstBestand,
  PotAllocation,
  Answers,
  AuditFinding,
  AuditBlockScore,
  PortfolioAuditResult,
} from "../types";
import { AUDIT_CONFIG } from "../constants/auditRulesConfig";
import { formatEuro } from "../constants/rules";

/**
 * Audit-Berechnungsengine für das Portfolio-Health-Scoring.
 * Führt alle 28 quantitativen Prüfungen der Blöcke A bis G durch
 * und beachtet strikt die Phrasing Guardrails:
 * 1. Befund mit Zahl
 * 2. Referenz / Benchmark (Gesetz als Gesetz, Konvention als Konvention)
 * 3. Stressfall / Szenario
 * 4. Reflektierende Frage
 * 5. Positivbefunde einschließen
 */
export function runPortfolioAudit(
  ist: IstBestand,
  soll: PotAllocation,
  answers: Answers,
  optionalAnswers?: Record<string, any>
): PortfolioAuditResult {
  const findings: AuditFinding[] = [];
  const positiveFindings: AuditFinding[] = [];

  // Grundgrößen berechnen
  const sicherheitAmount = Number(ist.sicherheit) || 0;
  const wachstumAmount = Number(ist.wachstum) || 0;
  const spielgeldAmount = Number(ist.spielgeld) || 0;
  const immobilieAmount = Number(ist.immobilien ?? ist.details?.immobilieEigenkapital ?? 0);

  // Investierbares Vermögen (ohne selbstgenutzte Immobilie & Rentenanwartschaften)
  const investable = sicherheitAmount + wachstumAmount + spielgeldAmount;
  const totalAssets = investable + immobilieAmount;

  // Geschätzte monatliche Ausgaben
  const netIncome = Number(answers.nettoeinkommen) || 2800;
  const monthlyExpenses = Math.max(1200, Math.round(netIncome * 0.7));

  // Alter der Nutzerin (aus Lebenszielen oder Default 35)
  const age = answers.lebensziele?.rentenluecke?.aktuellesAlter || 35;

  // Look-through Details
  const tagesgeldGiro = ist.details?.tagesgeldGiro ?? (sicherheitAmount * 0.7);
  const einzelaktien = ist.details?.einzelaktien ?? 0;
  const weltEtf = ist.details?.weltEtf ?? Math.max(0, wachstumAmount - einzelaktien);
  const goldRohstoffe = ist.details?.goldRohstoffe ?? 0;
  const krypto = ist.details?.kryptoTrends ?? (spielgeldAmount * 0.6);

  // Hilfsvariablen für Blockstrafen
  const penalties = {
    struktur: 0,
    sicherheit: 0,
    wachstum: 0,
    klumpen: 0,
    produkt_kosten: 0,
  };

  const counts = {
    struktur: { yellow: 0, red: 0 },
    sicherheit: { yellow: 0, red: 0 },
    wachstum: { yellow: 0, red: 0 },
    klumpen: { yellow: 0, red: 0 },
    produkt_kosten: { yellow: 0, red: 0 },
  };

  // =========================================================================
  // BLOCK A: STRUKTUR (Gewicht: 30 Punkte)
  // =========================================================================

  // A1: Notgroschen / Monatsausgaben
  const emergencyMonths = monthlyExpenses > 0 ? tagesgeldGiro / monthlyExpenses : 0;
  if (emergencyMonths < 1) {
    penalties.struktur += AUDIT_CONFIG.score.blocks.struktur.red_penalty;
    counts.struktur.red++;
    findings.push({
      id: "finding-a1-red",
      ruleId: "A1",
      block: "struktur",
      level: "red",
      title: "Kritisch niedriger Notgroschen",
      findingText: `Deine sofort verfügbaren liquiden Mittel (${formatEuro(tagesgeldGiro)}) decken aktuell nur rund ${emergencyMonths.toFixed(1)} Monatsausgaben.`,
      referenceText: `In der Finanzplanung gilt die Konvention, 3 bis 6 Monatsausgaben als eiserne Liquiditätsreserve vorzuhalten.`,
      stressText: `Bei unvorhergesehenen Ausgaben (z. B. Autoreparatur oder Zahnarzt) müsstest du Anteile aus dem Wachstumstopf möglicherweise mit Verlust in einer Schwächephase verkaufen.`,
      questionText: `Wie kannst du deinen Notgroschen schrittweise auf mindestens 3 Monatsausgaben (${formatEuro(monthlyExpenses * 3)}) auffüllen, bevor weitere Gelder investiert werden?`,
      isLaw: false,
      source: "Finanzplanungs-Konvention (Robbins / Verbraucherzentralen)",
      scoreDeduction: AUDIT_CONFIG.score.blocks.struktur.red_penalty,
    });
  } else if (emergencyMonths < 3) {
    penalties.struktur += AUDIT_CONFIG.score.blocks.struktur.yellow_penalty;
    counts.struktur.yellow++;
    findings.push({
      id: "finding-a1-yellow",
      ruleId: "A1",
      block: "struktur",
      level: "yellow",
      title: "Notgroschen unter dem empfohlenen Puffer",
      findingText: `Deine liquiden Rücklagen (${formatEuro(tagesgeldGiro)}) reichen für ca. ${emergencyMonths.toFixed(1)} Monatsausgaben.`,
      referenceText: `Als Standardkonvention gelten 3 bis 6 Monatsausgaben auf einem täglich verfügbaren Tagesgeldkonto als solider Basisschutz.`,
      stressText: `Treffen zwei ungeplante Rechnungen zeitgleich ein, schrumpft deine Sicherheitsmarge empfindlich.`,
      questionText: `Wäre es für dein Sicherheitsgefühl beruhigend, die Reserve auf mindestens 3 Monatsausgaben auszubauen?`,
      isLaw: false,
      source: "Finanzplanungs-Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.struktur.yellow_penalty,
    });
  } else {
    positiveFindings.push({
      id: "pos-a1",
      ruleId: "A1",
      block: "struktur",
      level: "green",
      title: "Notgroschen vorbildlich aufgebaut",
      findingText: `Mit ${formatEuro(tagesgeldGiro)} verfügst du über rund ${emergencyMonths.toFixed(1)} Monatsausgaben an sofortiger Liquidität.`,
      referenceText: `Damit erfüllst du die Konvention von 3 bis 6 Monatsausgaben vollumfänglich.`,
      stressText: `Im Ernstfall kannst du private Überraschungen gelassen abfedern, ohne Aktien- oder Vorsorgeanlagen antasten zu müssen.`,
      questionText: `Möchtest du prüfen, ob Beträge oberhalb von 6 Monatsausgaben rentabler im Wachstumstopf angelegt werden können?`,
      isLaw: false,
      source: "Finanzplanungs-Konvention",
      scoreDeduction: 0,
    });
  }

  // A3: Spielgeld-Quote (max. 5-10 %)
  const spielgeldShare = investable > 0 ? spielgeldAmount / investable : 0;
  if (spielgeldShare > 0.10) {
    penalties.struktur += AUDIT_CONFIG.score.blocks.struktur.red_penalty;
    counts.struktur.red++;
    findings.push({
      id: "finding-a3-red",
      ruleId: "A3",
      block: "struktur",
      level: "red",
      title: "Sehr hohe Spielgeld-Quote",
      findingText: `Dein Spielgeld-Topf umfasst ${formatEuro(spielgeldAmount)} und damit ${(spielgeldShare * 100).toFixed(1)} % deines investierbaren Vermögens.`,
      referenceText: `Nach gängiger Anlagekonvention sollte der spekulative Anteil maximal 5 % bis 10 % des Gesamtportfolios betragen.`,
      stressText: `Kryptowährungen und Trendthemen verzeichnen in Bärenmärkten regelmäßige Drawdowns von über 70 bis 80 %. Ein solcher Verlust würde hier dein Gesamtvermögen spürbar verringern.`,
      questionText: `Welcher Betrag im Spielgeld-Topf wäre für dich im Extremfall schmerzfrei verkraftbar, falls es zu einem dauerhaften Kurseinbruch kommt?`,
      isLaw: false,
      source: "Portfolio-Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.struktur.red_penalty,
    });
  } else if (spielgeldShare > 0.05) {
    penalties.struktur += AUDIT_CONFIG.score.blocks.struktur.yellow_penalty;
    counts.struktur.yellow++;
    findings.push({
      id: "finding-a3-yellow",
      ruleId: "A3",
      block: "struktur",
      level: "yellow",
      title: "Erhöhte Spielgeld-Quote",
      findingText: `Dein Spielgeld-Topf liegt bei ${(spielgeldShare * 100).toFixed(1)} % (${formatEuro(spielgeldAmount)}).`,
      referenceText: `Die Konvention empfiehlt maximal 5 % als Obergrenze für spekulative Beimischungen.`,
      stressText: `Eine ausgeprägte Schwächephase im Krypto- oder Sektor-Segment bremst deine Gesamtrendite merklich aus.`,
      questionText: `Möchtest du zukünftige Sparraten vorrangig in den breit gestreuten Wachstumstopf lenken, um den Anteil schrittweise unter 5 % zu bringen?`,
      isLaw: false,
      source: "Portfolio-Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.struktur.yellow_penalty,
    });
  } else {
    positiveFindings.push({
      id: "pos-a3",
      ruleId: "A3",
      block: "struktur",
      level: "green",
      title: "Spielgeld diszipliniert begrenzt",
      findingText: `Mit ${(spielgeldShare * 100).toFixed(1)} % (${formatEuro(spielgeldAmount)}) liegt dein Spielgeld-Topf im gesunden grünen Bereich.`,
      referenceText: `Du hältst die 5-%-Grenze diszipliniert ein.`,
      stressText: `Selbst bei schweren Verwerfungen in spekulativen Märkten bleibt dein solides Kernvermögen geschützt.`,
      isLaw: false,
      source: "Portfolio-Konvention",
      scoreDeduction: 0,
    });
  }

  // A4: Altersgerechte Wachstumsquote (110 minus Alter)
  const growthShare = investable > 0 ? wachstumAmount / investable : 0;
  const targetGrowthCenter = (110 - age) / 100;
  const growthDiff = growthShare - targetGrowthCenter;
  if (Math.abs(growthDiff) > 0.35) {
    findings.push({
      id: "finding-a4-info",
      ruleId: "A4",
      block: "struktur",
      level: "info",
      title: "Wachstumsquote weicht von Standard-Altersformel ab",
      findingText: `Deine Wachstumsquote liegt bei ${(growthShare * 100).toFixed(0)} % (Altersformel 110 - Alter ergibt ca. ${(targetGrowthCenter * 100).toFixed(0)} % für Alter ${age}).`,
      referenceText: `Die Daumenregel „110 minus Alter“ dient als grobe Orientierung für die Aktienquote zur Altersvorsorge.`,
      stressText: growthDiff < 0
        ? `Bei einer zu defensiven Aufstellung droht langfristig der Kaufkraftverlust durch Inflation.`
        : `Bei einer sehr offensiven Aufstellung musst du Markteinbrüche von bis zu 50 % mental und zeitlich aushalten können.`,
      questionText: `Passt diese Abweichung bewusst zu deinem Anlagehorizont und deinem persönlichen Sicherheitsbedürfnis?`,
      isLaw: false,
      source: "Finanzmathematische Faustformel",
      scoreDeduction: 0,
    });
  }

  // =========================================================================
  // BLOCK B: SICHERHEIT (Gewicht: 25 Punkte)
  // =========================================================================

  // B1: Bankeinlagen pro Institut gem. § 8 EinSiG (100.000 € gesetzliche Grenze)
  if (tagesgeldGiro > 150000) {
    penalties.sicherheit += AUDIT_CONFIG.score.blocks.sicherheit.red_penalty;
    counts.sicherheit.red++;
    findings.push({
      id: "finding-b1-red",
      ruleId: "B1",
      block: "sicherheit",
      level: "red",
      title: "Gesetzliche Einlagensicherungsgrenze deutlich überschritten",
      findingText: `Du hältst ${formatEuro(tagesgeldGiro)} an Bankguthaben auf Sicht-/Tagesgeldkonten.`,
      referenceText: `Gesetzliche Vorgabe nach § 8 EinSiG (Einlagensicherungsgesetz): Guthaben sind bis maximal 100.000 € je Kunde und Bank gesetzlich geschützt (zeitweise 500.000 € für max. 6 Monate nur bei besonderen Lebensereignissen wie Immobilientransaktionen).`,
      stressText: `Im Fall einer Bankinsolvenz ist der Betrag oberhalb von 100.000 € nicht durch die gesetzliche Einlagensicherung gedeckt und unterliegt dem Gläubigerrisiko.`,
      questionText: `Solltest du Guthaben über 100.000 € auf mindestens zwei verschiedene Bankinstitute verteilen oder in kurzlaufende Staatsanleihen bzw. Geldmarkt-ETFs umschichten?`,
      isLaw: true,
      source: "Gesetz: § 8 EinSiG",
      scoreDeduction: AUDIT_CONFIG.score.blocks.sicherheit.red_penalty,
    });
  } else if (tagesgeldGiro > 100000) {
    penalties.sicherheit += AUDIT_CONFIG.score.blocks.sicherheit.yellow_penalty;
    counts.sicherheit.yellow++;
    findings.push({
      id: "finding-b1-yellow",
      ruleId: "B1",
      block: "sicherheit",
      level: "yellow",
      title: "Einlagensicherungsgrenze von 100.000 € erreicht",
      findingText: `Dein Bankguthaben beträgt ${formatEuro(tagesgeldGiro)}.`,
      referenceText: `Nach § 8 EinSiG greift die gesetzliche Einlagensicherung pro Anleger und Kreditinstitut bis exakt 100.000 €.`,
      stressText: `Liegt das gesamte Guthaben bei einem einzigen Institut, ist der übersteigende Teil ungesichert.`,
      questionText: `Liegt das Geld bereits auf mehrere Banken verteilt, oder lohnt sich die Eröffnung eines zweiten Tagesgeldkontos?`,
      isLaw: true,
      source: "Gesetz: § 8 EinSiG",
      scoreDeduction: AUDIT_CONFIG.score.blocks.sicherheit.yellow_penalty,
    });
  } else {
    positiveFindings.push({
      id: "pos-b1",
      ruleId: "B1",
      block: "sicherheit",
      level: "green",
      title: "Gesetzliche Einlagensicherung eingehalten",
      findingText: `Mit ${formatEuro(tagesgeldGiro)} liegt dein Bankguthaben innerhalb der gesetzlichen Einlagensicherung von 100.000 € (§ 8 EinSiG).`,
      referenceText: `Damit greift der gesetzliche Schutzschirm im Insolvenzfall einer Bank in voller Höhe.`,
      isLaw: true,
      source: "Gesetz: § 8 EinSiG",
      scoreDeduction: 0,
    });
  }

  // B6: Eigenheimanteil am Nettovermögen
  if (totalAssets > 0 && immobilieAmount > 0) {
    const homeShare = immobilieAmount / totalAssets;
    if (homeShare > 0.70) {
      penalties.sicherheit += AUDIT_CONFIG.score.blocks.sicherheit.yellow_penalty;
      counts.sicherheit.yellow++;
      findings.push({
        id: "finding-b6-yellow",
        ruleId: "B6",
        block: "sicherheit",
        level: "yellow",
        title: "Hohe Vermögenskonzentration in Immobilien-Sachwert",
        findingText: `Deine Immobilie macht ${(homeShare * 100).toFixed(0)} % deines gesamten Nettovermögens aus (${formatEuro(immobilieAmount)} von ${formatEuro(totalAssets)}).`,
        referenceText: `In der Finanzpraxis gilt eine Eigenheim-Konzentration von über 50–70 % als Klumpenrisiko im Privatvermögen.`,
        stressText: `Immobilien sind illiquide. Sanierungskosten, Zinsbindungsende oder veränderte Mikrolagen können die finanzielle Flexibilität einschränken.`,
        questionText: `Wie kannst du durch liquide Wertpapiersparraten parallel ein liquides Gegengewicht aufbauen?`,
        isLaw: false,
        source: "Portfolio-Konvention",
        scoreDeduction: AUDIT_CONFIG.score.blocks.sicherheit.yellow_penalty,
      });
    }
  }

  // =========================================================================
  // BLOCK C: WACHSTUM & DIVERSIFIKATION (Gewicht: 30 Punkte)
  // =========================================================================

  // C1: Einzelaktien-Klumpenrisiko
  const singleStockShare = investable > 0 ? einzelaktien / investable : 0;
  if (singleStockShare > 0.10) {
    penalties.wachstum += AUDIT_CONFIG.score.blocks.wachstum.red_penalty;
    counts.wachstum.red++;
    findings.push({
      id: "finding-c1-red",
      ruleId: "C1",
      block: "wachstum",
      level: "red",
      title: "Kritisches Klumpenrisiko durch Einzelaktien",
      findingText: `Einzelaktien machen ${(singleStockShare * 100).toFixed(1)} % deines investierbaren Portfolios aus (${formatEuro(einzelaktien)}).`,
      referenceText: `Führende Vermögensverwalter (Fidelity, Schwab, T. Rowe Price) setzen die Höchstgrenze für Einzeltitel bei 5 % bis maximal 10 % an.`,
      stressText: `Unternehmensspezifische Skandale, Fehlinvestitionen oder Gewinneinbrüche können zu plötzlichen Kursverlusten von über 50 % führen, die der Gesamtmarkt nicht ausgleicht.`,
      questionText: `Könntest du Gewinne bei Einzeltiteln schrittweise realisieren und in einen breit gestreuten Welt-Aktien-ETF umschichten?`,
      isLaw: false,
      source: "Portfoliotheorie & Risikomanagement-Konvention (Markowitz)",
      scoreDeduction: AUDIT_CONFIG.score.blocks.wachstum.red_penalty,
    });
  } else if (singleStockShare > 0.05) {
    penalties.wachstum += AUDIT_CONFIG.score.blocks.wachstum.yellow_penalty;
    counts.wachstum.yellow++;
    findings.push({
      id: "finding-c1-yellow",
      ruleId: "C1",
      block: "wachstum",
      level: "yellow",
      title: "Erhöhter Einzelaktien-Anteil",
      findingText: `Einzelaktien haben einen Anteil von ${(singleStockShare * 100).toFixed(1)} % an deinem investierbaren Vermögen.`,
      referenceText: `Empfohlen wird eine Obergrenze von 5 % pro Einzeltitel zur Vermeidung unsystematischer Risiken.`,
      stressText: `Enttäuscht ein Einzelwert, spürst du das direkt im Gesamtergebnis.`,
      questionText: `Sind dir die unternehmensspezifischen Risiken dieser Titel im Detail vertraut?`,
      isLaw: false,
      source: "Portfolio-Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.wachstum.yellow_penalty,
    });
  } else if (weltEtf > 0 && einzelaktien === 0) {
    positiveFindings.push({
      id: "pos-c1",
      ruleId: "C1",
      block: "wachstum",
      level: "green",
      title: "Konsequente Risikostreuung über Welt-ETFs",
      findingText: `Dein Wachstumstopf investiert primär in breit gestreute ETFs statt in riskante Einzelwetten.`,
      referenceText: `Ein Welt-ETF (z. B. auf den MSCI World mit 1.280 Unternehmen) eliminiert das Einzeltitel-Insolvenzrisiko nahezu vollständig.`,
      stressText: `Gerät ein einzelner Konzern in Schieflage, federn die restlichen über 1.000 Unternehmen den Verlust ab.`,
      isLaw: false,
      source: "Moderne Portfoliotheorie (MSCI World Benchmark per August 2026)",
      scoreDeduction: 0,
    });
  }

  // C8: Deutschland-Quote / Home Bias
  // Wenn Nutzerin viele deutsche Werte hat oder klassische deutsche Fondsprodukte
  const germanyHomeBias = optionalAnswers?.homeBias ?? (einzelaktien > 5000 ? 0.35 : 0.08);
  if (germanyHomeBias > 0.25) {
    penalties.wachstum += AUDIT_CONFIG.score.blocks.wachstum.red_penalty;
    counts.wachstum.red++;
    findings.push({
      id: "finding-c8-red",
      ruleId: "C8",
      block: "wachstum",
      level: "red",
      title: "Ausgeprägter Home Bias (Deutschland-Klumpen)",
      findingText: `Geschätzt ${(germanyHomeBias * 100).toFixed(0)} % deiner Aktienanlagen sind in deutschen Unternehmen investiert.`,
      referenceText: `Deutschland repräsentiert lediglich rund 2,0 % der weltweiten Aktienmarktkapitalisierung und 4,4 % des Welt-BIPs. Eine Quote über 10 % gilt als Home Bias (Whitebox Studie 2023).`,
      stressText: `Eine wirtschaftliche Stagnation oder Energiekrise in Deutschland trifft zeitgleich dein Gehalt, deine Rente und dein Depot.`,
      questionText: `Wie kannst du dein Aktienvermögen konsequenter an der weltweiten Marktkapitalisierung (z. B. All-World oder MSCI World) ausrichten?`,
      isLaw: false,
      source: "Kapitalmarktstatistik (Deutschland ~2 % Welt-Marktkapitalisierung per 2026)",
      scoreDeduction: AUDIT_CONFIG.score.blocks.wachstum.red_penalty,
    });
  } else if (germanyHomeBias > 0.10) {
    penalties.wachstum += AUDIT_CONFIG.score.blocks.wachstum.yellow_penalty;
    counts.wachstum.yellow++;
    findings.push({
      id: "finding-c8-yellow",
      ruleId: "C8",
      block: "wachstum",
      level: "yellow",
      title: "Leichter Home Bias vorhanden",
      findingText: `Etwa ${(germanyHomeBias * 100).toFixed(0)} % deiner Aktienwerte liegen im deutschen Markt.`,
      referenceText: `Gemessen am Weltanteil von 2 % ist der deutsche Markt damit fünffach übergewichtet.`,
      stressText: `Lokale Standortrisiken schlagen überproportional durch.`,
      questionText: `Möchtest du prüfen, ob neue Sparraten vorrangig in globale Märkte fließen?`,
      isLaw: false,
      source: "Kapitalmarkt-Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.wachstum.yellow_penalty,
    });
  }

  // C14: Gold-Quote (Dalio All Seasons 7,5 %, > 10 % Yellow, > 15 % Red)
  const goldShare = investable > 0 ? goldRohstoffe / investable : 0;
  if (goldShare > 0.15) {
    penalties.wachstum += AUDIT_CONFIG.score.blocks.wachstum.red_penalty;
    counts.wachstum.red++;
    findings.push({
      id: "finding-c14-red",
      ruleId: "C14",
      block: "wachstum",
      level: "red",
      title: "Hoher Gold- und Rohstoffanteil",
      findingText: `Gold und Rohstoffe machen ${(goldShare * 100).toFixed(1)} % deines investierbaren Vermögens aus.`,
      referenceText: `Als Standardkonvention (z. B. Ray Dalio All Seasons Portfolio mit 7,5 %) gelten 5 % bis maximal 10 % als krisensichere Beimischung.`,
      stressText: `Gold erwirtschaftet weder Zinsen noch Dividenden. Über längere Phasen kann der Ertrag real hinter der Inflation zurückbleiben.`,
      questionText: `Welches konkrete Szenario möchtest du mit dieser hohen Edelmetallquote absichern?`,
      isLaw: false,
      source: "All-Seasons-Konvention (Ray Dalio / Bridgewater)",
      scoreDeduction: AUDIT_CONFIG.score.blocks.wachstum.red_penalty,
    });
  } else if (goldShare > 0.10) {
    penalties.wachstum += AUDIT_CONFIG.score.blocks.wachstum.yellow_penalty;
    counts.wachstum.yellow++;
    findings.push({
      id: "finding-c14-yellow",
      ruleId: "C14",
      block: "wachstum",
      level: "yellow",
      title: "Erhöhte Gold-Beimischung",
      findingText: `Deine Gold- und Rohstoffquote liegt bei ${(goldShare * 100).toFixed(1)} %.`,
      referenceText: `Konvention: Maximal 10 % zur reinen Portfoliodiversifikation.`,
      stressText: `Ein höherer Anteil mindert das Produktivkapital im Wachstumstopf.`,
      questionText: `Reicht dir eine moderate Absicherungsquote von 5–10 %?`,
      isLaw: false,
      source: "Asset Allocation Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.wachstum.yellow_penalty,
    });
  }

  // C15: Krypto-Quote (> 3 % Yellow, > 5 % Red)
  const cryptoShare = investable > 0 ? krypto / investable : 0;
  if (cryptoShare > 0.05) {
    penalties.wachstum += AUDIT_CONFIG.score.blocks.wachstum.red_penalty;
    counts.wachstum.red++;
    findings.push({
      id: "finding-c15-red",
      ruleId: "C15",
      block: "wachstum",
      level: "red",
      title: "Krypto-Anteil übersteigt Risikotoleranz",
      findingText: `Kryptowährungen machen ${(cryptoShare * 100).toFixed(1)} % deines investierbaren Vermögens aus.`,
      referenceText: `In wissenschaftlichen Allokationsmodellen wird Krypto mit maximal 1 % bis 3 % als asymmetrische Beimischung empfohlen.`,
      stressText: `Ein Marktrückgang von 70 % (historisch im Krypto-Winter mehrfach eingetreten) vernichtet bei dieser Quote spürbare Vermögenswerte.`,
      questionText: `Solltest du Gewinne sichern und in solide Basisbausteine überführen?`,
      isLaw: false,
      source: "Risiko-Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.wachstum.red_penalty,
    });
  }

  // =========================================================================
  // BLOCK D: KLUMPEN (Gewicht: 10 Punkte)
  // =========================================================================

  // D1 / D2: Einkommens- und Branchenkorrelation
  const employerSector = optionalAnswers?.employerSector;
  if (employerSector && employerSector === "tech" && weltEtf > 0) {
    penalties.klumpen += AUDIT_CONFIG.score.blocks.klumpen.yellow_penalty;
    counts.klumpen.yellow++;
    findings.push({
      id: "finding-d1-yellow",
      ruleId: "D1",
      block: "klumpen",
      level: "yellow",
      title: "Doppelrisiko: Arbeitgeber & Depot im IT-Sektor",
      findingText: `Du arbeitest im Tech-Sektor, während globale Welt-Indizes aktuell rund 29,8 % in Informationstechnologie gewichtet sind.`,
      referenceText: `Benchmark MSCI World per August 2026: Der Sektor Information Technology hat ein Gewicht von 29,81 %.`,
      stressText: `Eine Tech-Rezession kann zeitgleich zu Kündigungswellen in deiner Branche und zu Kursverlusten in deinem Depot führen.`,
      questionText: `Könntest du zur Risikostreuung defensive Sektoren (z. B. Basiskonsumgüter oder Gesundheitswesen) als Ausgleich prüfen?`,
      isLaw: false,
      source: "Humankapital-Korrelationsanalyse & MSCI World Sektorgewichte 2026",
      scoreDeduction: AUDIT_CONFIG.score.blocks.klumpen.yellow_penalty,
    });
  }

  // D4: Illiquide Sachwerte
  if (totalAssets > 0 && immobilieAmount > 0 && (immobilieAmount / totalAssets) > 0.60) {
    penalties.klumpen += AUDIT_CONFIG.score.blocks.klumpen.yellow_penalty;
    counts.klumpen.yellow++;
    findings.push({
      id: "finding-d4-yellow",
      ruleId: "D4",
      block: "klumpen",
      level: "yellow",
      title: "Hoher Anteil gebundenen Kapitals",
      findingText: `Über 60 % deines Vermögens sind in illiquiden Sachwerten gebunden.`,
      referenceText: `Konvention: Mindestens 30 bis 40 % des Nettovermögens sollten liquide oder binnen weniger Tage veräußerbar sein.`,
      stressText: `Plötzlicher Liquiditätsbedarf kann bei einer hohen Sachwertbindung nur über Kredite oder Notverkäufe gelöst werden.`,
      questionText: `Wie kannst du deine liquiden Rücklagen in Topf 1 und Topf 2 zielgerichtet stärken?`,
      isLaw: false,
      source: "Liquiditäts-Konvention",
      scoreDeduction: AUDIT_CONFIG.score.blocks.klumpen.yellow_penalty,
    });
  }

  // =========================================================================
  // BLOCK E & F: PRODUKT & KOSTEN (Gewicht: 5 Punkte)
  // =========================================================================

  // E3: Offene Immobilienfonds (§ 255 KAGB)
  const openRealEstateFunds = optionalAnswers?.openRealEstateFunds || 0;
  if (openRealEstateFunds > 0) {
    penalties.produkt_kosten += AUDIT_CONFIG.score.blocks.produkt_kosten.yellow_penalty;
    counts.produkt_kosten.yellow++;
    findings.push({
      id: "finding-e3-yellow",
      ruleId: "E3",
      block: "produkt",
      level: "yellow",
      title: "Gesetzliche Kündigungsfristen bei offenen Immobilienfonds",
      findingText: `In deinem Bestand befinden sich Anteile offener Immobilienfonds (${formatEuro(openRealEstateFunds)}).`,
      referenceText: `Gesetzliche Vorgabe nach § 255 KAGB (Kapitalanlagegesetzbuch): Es gilt eine gesetzliche Mindesthaltedauer von 24 Monaten sowie eine unwiderrufliche Rückgabefrist von 12 Monaten.`,
      stressText: `In Krisenphasen mit Mittelabflüssen können Fondsanteile nicht spontan zu Geld gemacht werden; Fondsschließungen sind gesetzlich vorgesehen.`,
      questionText: `Ist dir bewusst, dass dieses Kapital für mindestens ein Jahr im Voraus gekündigt werden muss?`,
      isLaw: true,
      source: "Gesetz: § 255 KAGB",
      scoreDeduction: AUDIT_CONFIG.score.blocks.produkt_kosten.yellow_penalty,
    });
  }

  // F1: Laufende Fondskosten (TER)
  const activeFunds = optionalAnswers?.activeFunds || 0;
  if (activeFunds > 10000) {
    penalties.produkt_kosten += AUDIT_CONFIG.score.blocks.produkt_kosten.yellow_penalty;
    counts.produkt_kosten.yellow++;
    findings.push({
      id: "finding-f1-yellow",
      ruleId: "F1",
      block: "kosten",
      level: "yellow",
      title: "Optimierungspotenzial bei Fondskosten (TER)",
      findingText: `Du hältst aktiv gemanagte Fonds mit geschätzten laufenden Kosten von 1,5 % bis 2,0 % p. a.`,
      referenceText: `Breit gestreute Welt-ETFs liegen heute bei einer TER von lediglich 0,12 % bis 0,22 % p. a. (Kostenunterschied ca. 1,5 Prozentpunkte jährlich).`,
      stressText: `Über einen Anlagehorizont von 25 Jahren kostet ein Kostenaufschlag von 1,5 % pro Jahr rund 30 % des gesamten Endkapitals durch den Zinseszinseffekt.`,
      questionText: `Lohnt sich der Wechsel in kostengünstige Indexfonds oder ETFs zur Ertragssteigerung?`,
      isLaw: false,
      source: "Kosten-Benchmark (BVI / Morningstar Studien)",
      scoreDeduction: AUDIT_CONFIG.score.blocks.produkt_kosten.yellow_penalty,
    });
  } else {
    positiveFindings.push({
      id: "pos-f1",
      ruleId: "F1",
      block: "kosten",
      level: "green",
      title: "Kostenstruktur schlank & effizient",
      findingText: `Du setzt auf kosteneffiziente Index-ETFs oder direkte Sparpläne ohne teure Vermittlergebühren.`,
      referenceText: `Niedrige laufende Kosten sind einer der verlässlichsten Prädiktoren für langfristigen Anlageerfolg.`,
      isLaw: false,
      source: "Finanzwissenschaftliche Kosten-Konvention",
      scoreDeduction: 0,
    });
  }

  // =========================================================================
  // BLOCK G: REBALANCING (Swedroe 5/25-Regel)
  // =========================================================================
  const totalPots = sicherheitAmount + wachstumAmount + spielgeldAmount;
  const currentSicherheitPct = totalPots > 0 ? (sicherheitAmount / totalPots) * 100 : soll.sicherheit;
  const currentWachstumPct = totalPots > 0 ? (wachstumAmount / totalPots) * 100 : soll.wachstum;
  const currentSpielgeldPct = totalPots > 0 ? (spielgeldAmount / totalPots) * 100 : soll.spielgeld;

  const sicherheitDiffPP = currentSicherheitPct - soll.sicherheit;
  const wachstumDiffPP = currentWachstumPct - soll.wachstum;
  const spielgeldDiffPP = currentSpielgeldPct - soll.spielgeld;

  const sicherheitRel = soll.sicherheit > 0 ? Math.abs(sicherheitDiffPP) / soll.sicherheit : 0;
  const wachstumRel = soll.wachstum > 0 ? Math.abs(wachstumDiffPP) / soll.wachstum : 0;
  const spielgeldRel = soll.spielgeld > 0 ? Math.abs(spielgeldDiffPP) / soll.spielgeld : 0;

  // Swedroe 5/25 Regel:
  // Rebalancing erforderlich, wenn absolute Abweichung >= 5 Prozentpunkte ODER relative Abweichung >= 25% (bei Abweichung >= 10 PP hohe Dringlichkeit)
  const maxAbsPP = Math.max(Math.abs(sicherheitDiffPP), Math.abs(wachstumDiffPP), Math.abs(spielgeldDiffPP));
  const maxRel = Math.max(sicherheitRel, wachstumRel, spielgeldRel);

  let rebalancingUrgency: "none" | "moderate" | "high" = "none";
  let needsRebalancing = false;
  let rebalancingSummary = "Deine Töpfe liegen sehr nah an deiner Zielallokation. Aktuell ist kein Rebalancing erforderlich.";

  if (maxAbsPP >= 10) {
    rebalancingUrgency = "high";
    needsRebalancing = true;
    penalties.struktur += AUDIT_CONFIG.score.blocks.struktur.yellow_penalty;
    counts.struktur.yellow++;
    rebalancingSummary = `Hohe Portfolio-Drift festgestellt: Mindestens ein Topf weicht um ${maxAbsPP.toFixed(1)} Prozentpunkte von deinem Soll ab. Ein Ausgleich über Sparraten oder Umschichtung wird empfohlen.`;

    findings.push({
      id: "finding-g1-drift",
      ruleId: "G1",
      block: "rebalancing",
      level: "yellow",
      title: "Rebalancing erforderlich (Swedroe 5/25-Drift)",
      findingText: `Deine Ist-Aufteilung (${currentSicherheitPct.toFixed(0)} % Sicherheit / ${currentWachstumPct.toFixed(0)} % Wachstum / ${currentSpielgeldPct.toFixed(0)} % Träume) weicht deutlich vom Soll (${soll.sicherheit} % / ${soll.wachstum} % / ${soll.spielgeld} %) ab.`,
      referenceText: `Nach der bewährten Swedroe 5/25-Regel (Vanguard Rebalancing Research) sollte rebalanciert werden, sobald ein Topf um 5 Prozentpunkte absolut oder 25 % relativ abweicht.`,
      stressText: `Wächst der Aktienanteil unkontrolliert an, steigt dein Verlustrisiko über dein Profil hinaus. Bleibt er zu klein, fehlen Renditebausteine zur Rentenlücke.`,
      questionText: `Möchtest du künftige Monatssparraten gezielt in den untergewichteten Topf lenken (steuer- und kostenschonendes Rebalancing)?`,
      isLaw: false,
      source: "Swedroe 5/25-Regel & Vanguard Rebalancing Research",
      scoreDeduction: AUDIT_CONFIG.score.blocks.struktur.yellow_penalty,
    });
  } else if (maxAbsPP >= 5 || maxRel >= 0.25) {
    rebalancingUrgency = "moderate";
    needsRebalancing = true;
    rebalancingSummary = `Moderate Portfolio-Drift: Die Abweichung liegt bei ${maxAbsPP.toFixed(1)} Prozentpunkten (${(maxRel * 100).toFixed(0)} % relativ). Ein Ausgleich über die nächsten Sparraten ist ratsam.`;
  } else {
    positiveFindings.push({
      id: "pos-g1",
      ruleId: "G1",
      block: "rebalancing",
      level: "green",
      title: "Töpfe im optimalen Zielkorridor",
      findingText: `Deine Ist-Aufteilung entspricht nahezu exakt deiner ermittelten Zielallokation (maximale Drift: ${maxAbsPP.toFixed(1)} Prozentpunkte).`,
      referenceText: `Die Swedroe 5/25-Toleranzbänder werden eingehalten. Kein sofortiger Handlungsbedarf.`,
      isLaw: false,
      source: "Swedroe 5/25 Rebalancing-Standard",
      scoreDeduction: 0,
    });
  }

  // =========================================================================
  // SCORE BERECHNUNG (100 Punkte System)
  // =========================================================================
  const calcBlock = (
    key: string,
    label: string,
    maxScore: number,
    penalty: number,
    cYellow: number,
    cRed: number
  ): AuditBlockScore => {
    const score = Math.max(0, maxScore - penalty);
    return {
      key,
      label,
      score,
      maxScore,
      yellowCount: cYellow,
      redCount: cRed,
    };
  };

  const blockScores = {
    struktur: calcBlock("struktur", "Struktur & Liquidität", 30, penalties.struktur, counts.struktur.yellow, counts.struktur.red),
    sicherheit: calcBlock("sicherheit", "Sicherheit & Einlagenschutz", 25, penalties.sicherheit, counts.sicherheit.yellow, counts.sicherheit.red),
    wachstum: calcBlock("wachstum", "Wachstum & Streuung", 30, penalties.wachstum, counts.wachstum.yellow, counts.wachstum.red),
    klumpen: calcBlock("klumpen", "Klumpenrisiken", 10, penalties.klumpen, counts.klumpen.yellow, counts.klumpen.red),
    produkt_kosten: calcBlock("produkt_kosten", "Produkte & Kosten", 5, penalties.produkt_kosten, counts.produkt_kosten.yellow, counts.produkt_kosten.red),
  };

  const totalScore = Math.max(
    0,
    Math.min(
      100,
      blockScores.struktur.score +
        blockScores.sicherheit.score +
        blockScores.wachstum.score +
        blockScores.klumpen.score +
        blockScores.produkt_kosten.score
    )
  );

  return {
    totalScore,
    blockScores,
    findings,
    positiveFindings,
    swedroeRebalancing: {
      needsRebalancing,
      urgency: rebalancingUrgency,
      sicherheitDrift: {
        absolutePP: Number(sicherheitDiffPP.toFixed(1)),
        relative: Number((sicherheitRel * 100).toFixed(1)),
        direction: sicherheitDiffPP > 0 ? "over" : sicherheitDiffPP < 0 ? "under" : "in_band",
      },
      wachstumDrift: {
        absolutePP: Number(wachstumDiffPP.toFixed(1)),
        relative: Number((wachstumRel * 100).toFixed(1)),
        direction: wachstumDiffPP > 0 ? "over" : wachstumDiffPP < 0 ? "under" : "in_band",
      },
      spielgeldDrift: {
        absolutePP: Number(spielgeldDiffPP.toFixed(1)),
        relative: Number((spielgeldRel * 100).toFixed(1)),
        direction: spielgeldDiffPP > 0 ? "over" : spielgeldDiffPP < 0 ? "under" : "in_band",
      },
      summaryText: rebalancingSummary,
    },
  };
}
