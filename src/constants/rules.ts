import {
  Answers,
  HorizontChoice,
  ReaktionChoice,
  EinkommenChoice,
  ZielChoice,
  UnterbrechungChoice,
  ProfileType,
  PotAllocation,
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
    vorsichtigMax: 4,  // 0–4 -> Vorsichtig
    ausgewogenMax: 9,  // 5–9 -> Ausgewogen
    offensivMax: 13,   // 10–13 -> Offensiv
  },
};

/**
 * Berechnet die Punkte und das resultierende Profil anhand der Antworten
 * unter strikter Beachtung der festgelegten Überschreibungsreihenfolge:
 * 1. horizont === "unter3" -> Absicherung zuerst
 * 2. reaktion === "verkaufen" -> höchstens Vorsichtig
 * 3. einkommen === "schwankend" && unterbrechung !== "nein" -> höchstens Ausgewogen
 */
export function calculateProfile(answers: Answers): ScoreBreakdown {
  const pHorizont = answers.horizont ? PROFIL_REGELN.punkte.horizont[answers.horizont] ?? 0 : 2;
  const pReaktion = answers.reaktion ? PROFIL_REGELN.punkte.reaktion[answers.reaktion] ?? 0 : 2;
  const pEinkommen = answers.einkommen ? PROFIL_REGELN.punkte.einkommen[answers.einkommen] ?? 0 : 1;
  const pZiel = answers.ziel ? PROFIL_REGELN.punkte.ziel[answers.ziel] ?? 0 : 1;
  const pUnterbrechung = answers.unterbrechung ? PROFIL_REGELN.punkte.unterbrechung[answers.unterbrechung] ?? 0 : 0;

  const totalScore = pHorizont + pReaktion + pEinkommen + pZiel + pUnterbrechung;

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
  // 3. Überschreibung: Schwankendes Einkommen + Unterbrechung geplant oder aktuell -> höchstens Ausgewogen
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
      label: "Reaktion bei -30 %",
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
 * Berechnet empfohlene Sparraten basierend auf Nettoeinkommen und Antworten.
 * Gibt auch einen Richtwert aus, falls monatsrate 0 ist.
 */
export function calculateSparraten(
  monatsrate: number,
  unterbrechung?: UnterbrechungChoice,
  nettoeinkommen?: number
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
    const basisrate = Math.floor((effektiveRate * 0.5) / 10) * 10;
    const aufstockung = Math.max(0, effektiveRate - basisrate);
    return {
      effektiveRate,
      isDefaultRate: monatsrate === 0,
      hasTwoRates: true,
      basisrate,
      aufstockung,
      pufferMonate: 6,
      hinweis:
        "Eine Rate, die auch in der Unterbrechung läuft — und eine, die du in guten Monaten obendrauf legst.",
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
    return "Tagesgeld, Festgeld, Geldmarktfonds, kurzlaufende Staatsanleihen, Instandhaltungsrücklage für Immobilien";
  }

  if (pot === "wachstum") {
    const nScale = answers.nachhaltigkeitScale ?? (answers.nachhaltigkeit === "wichtig" ? 8 : 4);
    const gScale = answers.greifbarScale ?? (answers.greifbar === "greifbar" ? 8 : 3);

    const isHighSustainability = nScale >= 6;
    const isHighTangible = gScale >= 6;

    let aktienText = "breit gestreute Welt-Aktien";
    if (isHighSustainability) {
      aktienText =
        nScale >= 8
          ? "strenge SRI/ESG Welt-Aktien (mit strikten Ausschlusskriterien für Rüstung, Kohle & Tabak)"
          : "breit gestreute Welt-Aktien mit Nachhaltigkeitsfilter";
    }

    if (isHighTangible) {
      const goldDetail =
        gScale >= 8
          ? "Physisches Gold zu Hause im Tresor / Bankschließfach, Immobilien-Eigenkapital & Tilgung"
          : "Gold (physisch oder besichert), Immobilienanteile";
      return `${goldDetail}, ${aktienText}`;
    } else {
      return `${aktienText}, Gold als Beimischung, offene Immobilienfonds`;
    }
  }

  // spaßgeld / spielgeld
  return "Freie Entscheidungen ohne Rechtfertigung: Krypto (Bitcoin, Ethereum), Einzelwerte, Themenwetten, persönliche Herzensprojekte. Davon höchstens die Hälfte in Krypto.";
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
