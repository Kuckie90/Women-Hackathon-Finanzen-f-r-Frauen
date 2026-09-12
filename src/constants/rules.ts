import {
  Answers,
  HorizontChoice,
  ReaktionChoice,
  EinkommenChoice,
  ZielChoice,
  UnterbrechungChoice,
  UnterbrechungDetails,
  RenditeFokusChoice,
  VerlustToleranzChoice,
  ErfahrungChoice,
  ProfileType,
  PotAllocation,
  PotAllocationRanges,
  ScoreBreakdown,
} from "../types";

// ============================================================================
// ZIELALLOKATION JE PROFIL
// Feste Prozentverteilung für Sicherheit, Wachstum und Spaßgeld je Profil.
// Werte sind Prozent und summieren sich je Zeile exakt auf 100.
// ============================================================================
export const ZIELALLOKATION: Record<ProfileType, PotAllocation> = {
  "Absicherung zuerst": {
    sicherheit: 100,
    wachstum: 0,
    spielgeld: 0,
  },
  "Vorsichtig": {
    sicherheit: 70,
    wachstum: 30,
    spielgeld: 0,
  },
  "Ausgewogen": {
    sicherheit: 40,
    wachstum: 55,
    spielgeld: 5,
  },
  "Offensiv": {
    sicherheit: 20,
    wachstum: 70,
    spielgeld: 10,
  },
};

// ============================================================================
// PROZENT-SPANNEN (ZIELKORRIDORE GEMÄSS BRIEFING ABSCHNITT 3 & 4)
// Spannen statt starrer Fixwerte für realistische und BaFin-konforme Orientierung
// ============================================================================
export const ZIELALLOKATION_SPANNEN: Record<ProfileType, PotAllocationRanges> = {
  "Absicherung zuerst": {
    sicherheit: { min: 90, max: 100, target: 100 },
    wachstum: { min: 0, max: 10, target: 0 },
    spielgeld: { min: 0, max: 5, target: 0 },
  },
  "Vorsichtig": {
    sicherheit: { min: 60, max: 80, target: 70 },
    wachstum: { min: 20, max: 40, target: 30 },
    spielgeld: { min: 0, max: 5, target: 0 },
  },
  "Ausgewogen": {
    sicherheit: { min: 30, max: 50, target: 40 },
    wachstum: { min: 45, max: 65, target: 55 },
    spielgeld: { min: 0, max: 10, target: 5 },
  },
  "Offensiv": {
    sicherheit: { min: 10, max: 30, target: 20 },
    wachstum: { min: 60, max: 80, target: 70 },
    spielgeld: { min: 5, max: 15, target: 10 },
  },
};

// ============================================================================
// PROFIL_REGELN: PUNKTETABELLE UND SCHWELLEN
// Alle Scoring-Punkte und Schwellenwerte für die Profilermittlung
// ============================================================================
export const PROFIL_REGELN = {
  punkte: {
    horizont: {
      unter3: 0,
      "3bis10": 2,
      ueber10: 4,
    } as Record<HorizontChoice, number>,
    reaktion: {
      verkaufen: 0,
      aussitzen: 2,
      nachkaufen: 4,
    } as Record<ReaktionChoice, number>,
    renditeFokus: {
      sicherheit: 0,
      ausgewogen: 2,
      rendite: 4,
    } as Record<RenditeFokusChoice, number>,
    verlustToleranz: {
      unruhig: 0,
      rational: 2,
      gelassen: 3,
    } as Record<VerlustToleranzChoice, number>,
    erfahrungLevel: {
      keine: 0,
      basis: 1,
      fundiert: 2,
      fortgeschritten: 3,
    } as Record<ErfahrungChoice, number>,
    einkommen: {
      sicher: 2,
      teilzeit: 1,
      schwankend: 0,
    } as Record<EinkommenChoice, number>,
    ziel: {
      altersvorsorge: 2,
      vermoegensaufbau: 1,
      anschaffung: 0,
    } as Record<ZielChoice, number>,
    unterbrechung: {
      nein: 1,
      ja: 0,
      aktuell: 0,
    } as Record<UnterbrechungChoice, number>,
  },
  schwellen: {
    vorsichtigMax: 7,  // 0–7 -> Vorsichtig
    ausgewogenMax: 15, // 8–15 -> Ausgewogen
    offensivMax: 23,   // 16–23 -> Offensiv
  },
};

/**
 * Berechnet die Punkte und das resultierende Profil anhand der Antworten
 * unter strikter Beachtung der festgelegten Überschreibungsreihenfolge.
 */
export function calculateProfile(answers: Answers): ScoreBreakdown {
  const pHorizont = answers.horizont ? PROFIL_REGELN.punkte.horizont[answers.horizont] ?? 0 : 2;
  const pReaktion = answers.reaktion ? PROFIL_REGELN.punkte.reaktion[answers.reaktion] ?? 0 : 2;
  const pRenditeFokus = answers.renditeFokus ? PROFIL_REGELN.punkte.renditeFokus[answers.renditeFokus] ?? 0 : 2;
  const pVerlustToleranz = answers.verlustToleranz ? PROFIL_REGELN.punkte.verlustToleranz[answers.verlustToleranz] ?? 0 : 2;
  const pErfahrung = answers.erfahrungLevel ? PROFIL_REGELN.punkte.erfahrungLevel[answers.erfahrungLevel] ?? 0 : 1;
  const pEinkommen = answers.einkommen ? PROFIL_REGELN.punkte.einkommen[answers.einkommen] ?? 0 : 1;
  const pZiel = answers.ziel ? PROFIL_REGELN.punkte.ziel[answers.ziel] ?? 0 : 1;
  const pUnterbrechung = answers.unterbrechung ? PROFIL_REGELN.punkte.unterbrechung[answers.unterbrechung] ?? 0 : 0;

  const totalScore =
    pHorizont +
    pReaktion +
    pRenditeFokus +
    pVerlustToleranz +
    pErfahrung +
    pEinkommen +
    pZiel +
    pUnterbrechung;

  // Basisprofil nach Summe
  let baseProfile: ProfileType = "Vorsichtig";
  if (totalScore <= PROFIL_REGELN.schwellen.vorsichtigMax) {
    baseProfile = "Vorsichtig";
  } else if (totalScore <= PROFIL_REGELN.schwellen.ausgewogenMax) {
    baseProfile = "Ausgewogen";
  } else {
    baseProfile = "Offensiv";
  }

  let finalProfile: ProfileType = baseProfile;
  let appliedOverride: string | null = null;

  // 1. Überschreibung: Horizont unter 3 Jahre
  if (answers.horizont === "unter3") {
    finalProfile = "Absicherung zuerst";
    appliedOverride = "Anlagehorizont unter 3 Jahren: Sofortige Umschaltung auf 'Absicherung zuerst'. Bei so kurzen Zeiträumen darf das Kapital nicht den Schwankungen der Aktienmärkte ausgesetzt sein.";
  }
  // 2. Überschreibung: Reaktion bei -30 % ist "verkaufen" -> höchstens Vorsichtig
  else if (answers.reaktion === "verkaufen") {
    if (finalProfile === "Ausgewogen" || finalProfile === "Offensiv") {
      finalProfile = "Vorsichtig";
      appliedOverride = "Reaktion bei Kursrückgang ist 'Verkaufen': Begrenzung auf höchstens 'Vorsichtig'. So wird das Risiko panischer Notverkäufe im Tief drastisch reduziert.";
    }
  }
  // 3. Überschreibung: Absoluter Kapitalschutz & hohe Nervosität -> höchstens Vorsichtig
  else if (answers.renditeFokus === "sicherheit" && answers.verlustToleranz === "unruhig") {
    if (finalProfile === "Ausgewogen" || finalProfile === "Offensiv") {
      finalProfile = "Vorsichtig";
      appliedOverride = "Priorität Kapitalschutz und geringe Verlusttoleranz: Begrenzung auf 'Vorsichtig', um dir absolute Gelassenheit und ruhigen Schlaf zu sichern.";
    }
  }
  // 4. Überschreibung: Schwankendes Einkommen + Unterbrechung geplant oder aktuell -> höchstens Ausgewogen
  else if (answers.einkommen === "schwankend" && answers.unterbrechung !== "nein") {
    if (finalProfile === "Offensiv") {
      finalProfile = "Ausgewogen";
      appliedOverride = "Schwankendes Einkommen kombiniert mit geplanter oder bestehender Auszeit: Begrenzung auf höchstens 'Ausgewogen', um Liquiditätsengpässe abzufedern.";
    }
  }

  const items = [
    {
      key: "horizont",
      label: "Zeithorizont",
      valueLabel:
        answers.horizont === "unter3"
          ? "Unter 3 Jahren"
          : answers.horizont === "3bis10"
          ? "3 bis 10 Jahre"
          : answers.horizont === "ueber10"
          ? "Mehr als 10 Jahre"
          : "Nicht angegeben",
      points: pHorizont,
    },
    {
      key: "reaktion",
      label: "Reaktion bei -30 % Crash",
      valueLabel:
        answers.reaktion === "verkaufen"
          ? "Verkaufen"
          : answers.reaktion === "aussitzen"
          ? "Aussitzen"
          : answers.reaktion === "nachkaufen"
          ? "Nachkaufen"
          : "Nicht angegeben",
      points: pReaktion,
    },
    {
      key: "renditeFokus",
      label: "Sicherheits- vs. Renditefokus",
      valueLabel:
        answers.renditeFokus === "sicherheit"
          ? "Absoluter Kapitalschutz"
          : answers.renditeFokus === "ausgewogen"
          ? "Gesunder Mittelweg"
          : answers.renditeFokus === "rendite"
          ? "Maximale Rendite"
          : "Nicht angegeben",
      points: pRenditeFokus,
    },
    {
      key: "verlustToleranz",
      label: "Nervenstärke bei Schwächephasen",
      valueLabel:
        answers.verlustToleranz === "unruhig"
          ? "Kaum aussitzbar / unruhig"
          : answers.verlustToleranz === "rational"
          ? "1–2 Jahre rational okay"
          : answers.verlustToleranz === "gelassen"
          ? "Mehrere Jahre gelassen"
          : "Nicht angegeben",
      points: pVerlustToleranz,
    },
    {
      key: "erfahrungLevel",
      label: "Anlageerfahrung & Vorwissen",
      valueLabel:
        answers.erfahrungLevel === "keine"
          ? "Keine (Giro/Tagesgeld)"
          : answers.erfahrungLevel === "basis"
          ? "Basiswissen / Bausparer / ETF-Start"
          : answers.erfahrungLevel === "fundiert"
          ? "Fundiert (jahrelange ETFs)"
          : answers.erfahrungLevel === "fortgeschritten"
          ? "Fortgeschritten / aktiv"
          : "Nicht angegeben",
      points: pErfahrung,
    },
    {
      key: "einkommen",
      label: "Einkommenssicherheit",
      valueLabel:
        answers.einkommen === "sicher"
          ? "Sicher"
          : answers.einkommen === "teilzeit"
          ? "Befristet oder Teilzeit"
          : answers.einkommen === "schwankend"
          ? "Schwankend"
          : "Nicht angegeben",
      points: pEinkommen,
    },
    {
      key: "ziel",
      label: "Anlageziel",
      valueLabel:
        answers.ziel === "altersvorsorge"
          ? "Altersvorsorge"
          : answers.ziel === "vermoegensaufbau"
          ? "Vermögensaufbau"
          : answers.ziel === "anschaffung"
          ? "Größere Anschaffung"
          : "Nicht angegeben",
      points: pZiel,
    },
    {
      key: "unterbrechung",
      label: "Geplante Unterbrechung",
      valueLabel:
        answers.unterbrechung === "nein"
          ? "Nein (durchgehendes Einkommen)"
          : answers.unterbrechung === "ja"
          ? "Ja (geplant in den nächsten 5 Jahren)"
          : answers.unterbrechung === "aktuell"
          ? "Bin gerade darin"
          : "Nicht angegeben",
      points: pUnterbrechung,
    },
  ];

  return {
    totalScore,
    baseProfile,
    finalProfile,
    appliedOverride,
    items,
  };
}

/**
 * Text-Helfer für Unterbrechungsdetails
 */
export function formatUnterbrechungsDetails(details?: UnterbrechungDetails): string | null {
  if (!details) return null;
  const parts: string[] = [];

  if (details.wann) {
    const wannMap: Record<string, string> = {
      sofort: "bereits jetzt",
      in_6_monaten: "in den nächsten 6 Monaten",
      in_1_jahr: "in ca. 1 Jahr",
      in_2_bis_5_jahren: "in 2–5 Jahren",
    };
    parts.push(wannMap[details.wann] || details.wann);
  }

  if (details.dauer) {
    const dauerMap: Record<string, string> = {
      "3_bis_6_monate": "für 3–6 Monate",
      "6_bis_12_monate": "für 6–12 Monate",
      "1_bis_2_jahre": "für 1–2 Jahre",
      dauerhaft: "dauerhaft / längerfristig",
    };
    parts.push(dauerMap[details.dauer] || details.dauer);
  }

  if (details.umfang) {
    const umfangMap: Record<string, string> = {
      voll: "vollständige Pause (100 %)",
      teilzeit_50: "Teilzeit (ca. 50 %)",
      teilzeit_75: "Teilzeit (ca. 75–80 %)",
      flexibel: "flexible Reduktion",
    };
    parts.push(`(${umfangMap[details.umfang] || details.umfang})`);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Berechnet empfohlene Sparraten basierend auf Nettoeinkommen und Antworten.
 * Gibt auch einen Richtwert aus, falls monatsrate 0 ist.
 */
export function calculateSparraten(
  monatsrate: number,
  unterbrechung?: UnterbrechungChoice,
  nettoeinkommen?: number,
  unterbrechungDetails?: UnterbrechungDetails
) {
  const hasUnterbrechung = unterbrechung === "ja" || unterbrechung === "aktuell";

  // Richtwertberechnung falls Sparrate 0 oder unklar
  let empfohleneRichtrate = 150; // Standardfallback
  if (nettoeinkommen && nettoeinkommen > 0) {
    // 50/30/20-Regel: 15-20% Sparquote
    empfohleneRichtrate = Math.round((nettoeinkommen * 0.15) / 10) * 10;
  }

  const effektiveRate = monatsrate > 0 ? monatsrate : empfohleneRichtrate;

  if (hasUnterbrechung && effektiveRate > 0) {
    const isVoll = unterbrechungDetails?.umfang === "voll";
    const factor = isVoll ? 0.35 : 0.5;
    const basisrate = Math.floor((effektiveRate * factor) / 10) * 10;
    const aufstockung = Math.max(0, effektiveRate - basisrate);
    const detailText = formatUnterbrechungsDetails(unterbrechungDetails);

    return {
      effektiveRate,
      isDefaultRate: monatsrate === 0,
      hasTwoRates: true,
      basisrate,
      aufstockung,
      pufferMonate: 6,
      hinweis: detailText
        ? `Geplante Veränderung (${detailText}): Daher empfehlen wir 6 Monatsausgaben Notgroschen und eine krisensichere Basis-Sparrate von ${basisrate} €.`
        : "Eine Rate, die auch in der Unterbrechung läuft — und eine, die du in guten Monaten obendrauf legst.",
    };
  }

  return {
    effektiveRate,
    isDefaultRate: monatsrate === 0,
    hasTwoRates: false,
    basisrate: effektiveRate,
    aufstockung: 0,
    pufferMonate: 3,
    hinweis: null,
  };
}

/**
 * Gibt die pot-spezifischen Anlagebeispiele unter Beachtung der
 * 1-10 Skalen für Nachhaltigkeit und greifbare Sachwerte (Gold, Immobilien) zurück.
 * (Ändert NIE die Prozentsätze!)
 */
export function getPotExamples(
  pot: "sicherheit" | "wachstum" | "spielgeld",
  answers: Answers
): string {
  if (pot === "sicherheit") {
    const techHint = answers.techAffinitaet === "digital" 
      ? " (Tagesgeld- & Geldmarktkonten via Neobroker oder Direktbank)" 
      : answers.techAffinitaet === "klassisch" 
      ? " (Tages- & Festgeldkonto bei deiner Hausbank/Filialbank vor Ort)" 
      : "";
    return `Tagesgeld, Festgeld, Geldmarktfonds, kurzlaufende Staatsanleihen, Instandhaltungsrücklage für Immobilien${techHint}`;
  }

  if (pot === "wachstum") {
    const nScale = answers.nachhaltigkeitScale ?? (answers.nachhaltigkeit === "wichtig" ? 8 : 4);
    const gScale = answers.greifbarScale ?? (answers.greifbar === "greifbar" ? 8 : 3);
    const marken = answers.markenPraeferenz;

    const isHighSustainability = nScale >= 6;
    const isHighTangible = gScale >= 6;

    let aktienText = "breit gestreute Welt-Aktien-ETFs (z. B. MSCI World / FTSE All-World)";
    if (isHighSustainability) {
      aktienText =
        nScale >= 8
          ? "strenge SRI/ESG Welt-Aktien-ETFs (mit strikten Ausschlusskriterien für Rüstung, Kohle & Tabak, z. B. MSCI World SRI)"
          : "breit gestreute Welt-Aktien mit Nachhaltigkeitsfilter";
    }

    if (marken === "bekannte_marken") {
      aktienText += " ergänzt um vertraute Qualitätsmarken und etablierte Großunternehmen";
    } else if (marken === "offen") {
      aktienText += " mit Core-Satellite-Struktur (breiter Weltindex als Kern, gezielte Marken als Satelliten)";
    }

    if (isHighTangible) {
      const goldDetail =
        gScale >= 8
          ? "Physisches Gold zu Hause im Tresor / Bankschließfach, Immobilien-Eigenkapital & Tilgung"
          : "Gold (physisch hinterlegt z. B. Xetra-Gold/Euwax), Immobilienanteile";
      return `${goldDetail}, ${aktienText}`;
    } else {
      return `${aktienText}, Gold als Beimischung (Xetra-Gold), offene Immobilienfonds`;
    }
  }

  // spaßgeld / spielgeld
  const stilHint = answers.entscheidungsStil === "emotional" 
    ? " – pure Freude und Projekte, bei denen dein Bauchgefühl entscheidet" 
    : "";
  return `Freie Entscheidungen ohne Rechtfertigung${stilHint}: Krypto (Bitcoin, Ethereum), Trend-Aktien, Kunst, persönliche Herzensprojekte. Davon höchstens die Hälfte in spekulative Krypto-Assets.`;
}

/**
 * Formatierungshelfer für Währungen
 */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
