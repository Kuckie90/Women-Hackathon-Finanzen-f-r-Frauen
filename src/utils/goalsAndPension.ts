/**
 * Berechnungen für Lebensziele, Rentenlücke (Gender Pension Gap)
 * und Zielerreichungs-Status im Drei-Töpfe-Modell
 */

import { RentenlueckeData, LebenszieleConfig, IstBestand, PotAllocation } from "../types";

export const DEFAULT_RENTENLUECKE: RentenlueckeData = {
  aktuellesAlter: 32,
  rentenAlter: 67,
  wunschRenteNetto: 2000,
  erwarteteRenteNetto: 1300,
  rentenlueckeMonatlich: 700,
  benoetigtesKapital: 210000,
  monatlicheSparrateFuerRente: 155,
};

export const DEFAULT_LEBENSZIELE: LebenszieleConfig = {
  rentenCheckAktiv: true,
  rentenluecke: DEFAULT_RENTENLUECKE,
  kurzfristZiel: {
    titel: "Notgroschen & liquide Rücklagen",
    zielbetrag: 6000,
    monate: 12,
  },
  mittelfristZiel: {
    titel: "Immobilien-Eigenkapital / Sabbatical",
    zielbetrag: 20000,
    jahre: 5,
  },
};

/**
 * Berechnet die monatliche Rentenlücke, den Kapitalstock und die nötige Sparrate
 * in Topf 2 (Wachstum @ 6 % realer p.a. Rendite bei Welt-ETFs).
 */
export function calculateRentenluecke(
  alter: number,
  rentenAlter: number,
  wunschNetto: number,
  erwarteteRente: number
): RentenlueckeData {
  const safeAlter = Math.max(18, Math.min(65, alter));
  const safeRentenAlter = Math.max(safeAlter + 1, Math.min(72, rentenAlter));
  const jahreBisRente = safeRentenAlter - safeAlter;

  const rentenlueckeMonatlich = Math.max(0, wunschNetto - erwarteteRente);

  // 4 % Entnahmeregel oder 25 Jahre Rentenzeit (bis ca. Alter 92)
  // Kapitalbedarf = monatliche Lücke * 12 * 25 (Faktor 300)
  const benoetigtesKapital = Math.round(rentenlueckeMonatlich * 300);

  // Zinseszins-Formel: monatlicher Zins r = 6 % / 12 = 0.005
  // PMT = FV * r / (((1 + r)^n) - 1)
  const monthlyRate = 0.06 / 12;
  const months = jahreBisRente * 12;
  let monatlicheSparrateFuerRente = 0;

  if (benoetigtesKapital > 0 && months > 0) {
    const compoundFactor = Math.pow(1 + monthlyRate, months) - 1;
    if (compoundFactor > 0) {
      monatlicheSparrateFuerRente = Math.round(
        (benoetigtesKapital * monthlyRate) / compoundFactor
      );
    }
  }

  return {
    aktuellesAlter: safeAlter,
    rentenAlter: safeRentenAlter,
    wunschRenteNetto: wunschNetto,
    erwarteteRenteNetto: erwarteteRente,
    rentenlueckeMonatlich,
    benoetigtesKapital,
    monatlicheSparrateFuerRente,
  };
}

/**
 * Prognostiziert das Endvermögen zum Rentenbeginn
 * basierend auf Startkapital (Ist in Topf 2), Monatsrate in Topf 2 und Jahren bis zur Rente.
 */
export function projectFutureValue(
  startKapital: number,
  monatlicheRate: number,
  jahre: number,
  annualReturn: number = 0.06
): number {
  const r = annualReturn / 12;
  const n = Math.max(1, jahre * 12);
  const futureStart = startKapital * Math.pow(1 + r, n);
  const futureAnnuity = monatlicheRate * ((Math.pow(1 + r, n) - 1) / r);
  return Math.round(futureStart + futureAnnuity);
}

/**
 * Zielerreichungs-Statistiken für die Auswertungs-Grafik
 */
export interface GoalProgressItem {
  id: string;
  name: string;
  kategorie: "kurzfristig" | "mittelfristig" | "langfristig";
  zielTopf: "sicherheit" | "wachstum" | "spielgeld";
  topfLabel: string;
  zielBetrag: number;
  istBetrag: number;
  monatlicherZuwachs: number;
  prozentErreicht: number;
  statusText: string;
  prognoseText: string;
}

export function computeGoalProgress(
  lebensziele: LebenszieleConfig,
  istBestand: IstBestand,
  allocation: PotAllocation,
  monatsrate: number
): {
  items: GoalProgressItem[];
  overallPensionCoveragePercent: number;
  projectedPensionCapital: number;
} {
  const rl = lebensziele.rentenluecke;
  const jahreBisRente = Math.max(1, rl.rentenAlter - rl.aktuellesAlter);

  // Monatliche Zuteilung nach Töpfen
  const monthlySicherheit = Math.round((monatsrate * allocation.sicherheit) / 100);
  const monthlyWachstum = Math.round((monatsrate * allocation.wachstum) / 100);
  const monthlySpielgeld = monatsrate - monthlySicherheit - monthlyWachstum;

  // 1. Kurzfristiges Ziel: Notgroschen
  const kfZiel = lebensziele.kurzfristZiel.zielbetrag;
  const kfIst = istBestand.sicherheit;
  const kfProzent = kfZiel > 0 ? Math.min(100, Math.round((kfIst / kfZiel) * 100)) : 100;
  const kfRestMonate =
    kfZiel > kfIst && monthlySicherheit > 0
      ? Math.ceil((kfZiel - kfIst) / monthlySicherheit)
      : 0;

  const item1: GoalProgressItem = {
    id: "notgroschen",
    name: lebensziele.kurzfristZiel.titel || "Notgroschen & Puffer",
    kategorie: "kurzfristig",
    zielTopf: "sicherheit",
    topfLabel: "Topf 1 (Sicherheit)",
    zielBetrag: kfZiel,
    istBetrag: kfIst,
    monatlicherZuwachs: monthlySicherheit,
    prozentErreicht: kfProzent,
    statusText:
      kfProzent >= 100
        ? "Vollständig abgesichert!"
        : `${kfProzent} % erreicht (${kfRestMonate} Monate bis zum Vollpuffer)`,
    prognoseText:
      kfProzent >= 100
        ? "Notgroschen steht komplett. Überschüssige Sparraten fließen zu 100 % in Topf 2 (Wachstum)."
        : `Bei ${monthlySicherheit} € monatlich ist dein Puffer in ca. ${kfRestMonate} Monaten voll.`,
  };

  // 2. Mittelfristiges Ziel: z. B. Eigenkapital / Auszeit
  const mfZiel = lebensziele.mittelfristZiel.zielbetrag;
  // Für das Mittelfristziel stehen typischerweise Überschüsse aus Topf 1 & 2 zur Verfügung
  const mfIst = Math.round(
    Math.max(0, istBestand.sicherheit - kfZiel) + istBestand.wachstum * 0.3
  );
  const mfProzent = mfZiel > 0 ? Math.min(100, Math.round((mfIst / mfZiel) * 100)) : 100;
  const mfMonatlich = Math.round(monthlySicherheit * 0.4 + monthlyWachstum * 0.3);

  const item2: GoalProgressItem = {
    id: "mittelfrist",
    name: lebensziele.mittelfristZiel.titel || "Mittelfristiges Lebensziel",
    kategorie: "mittelfristig",
    zielTopf: "wachstum",
    topfLabel: "Topf 1 & 2 (Planbar)",
    zielBetrag: mfZiel,
    istBetrag: mfIst,
    monatlicherZuwachs: mfMonatlich,
    prozentErreicht: mfProzent,
    statusText: `${mfProzent} % erreicht`,
    prognoseText:
      mfZiel > 0 && mfMonatlich > 0
        ? `Erreichbar in ca. ${Math.ceil(Math.max(0, mfZiel - mfIst) / (mfMonatlich * 12))} Jahren bei planmäßiger Sparrate.`
        : "Flexibel aufbaubar.",
  };

  // 3. Langfristiges Ziel: Rentenlücke schließen
  const rentenZiel = rl.benoetigtesKapital;
  const rentenIst = istBestand.wachstum; // Depot / ETFs
  const rentenProzent =
    rentenZiel > 0 ? Math.min(100, Math.round((rentenIst / rentenZiel) * 100)) : 100;

  // Prognose mit Zinseszins zum Rentenalter
  const projectedPensionCapital = projectFutureValue(
    rentenIst,
    monthlyWachstum,
    jahreBisRente,
    0.06
  );

  const overallPensionCoveragePercent =
    rentenZiel > 0
      ? Math.round((projectedPensionCapital / rentenZiel) * 100)
      : 100;

  const item3: GoalProgressItem = {
    id: "rentenluecke",
    name: "Rentenlücke schließen (Altersvorsorge)",
    kategorie: "langfristig",
    zielTopf: "wachstum",
    topfLabel: "Topf 2 (Wachstum / Welt-ETFs)",
    zielBetrag: rentenZiel,
    istBetrag: rentenIst,
    monatlicherZuwachs: monthlyWachstum,
    prozentErreicht: rentenProzent,
    statusText: `${rentenProzent} % des Startkapitals vorhanden`,
    prognoseText: `Mit ${monthlyWachstum} €/Monat in Topf 2 erreichst du mit 67 Jahren voraussichtlich ca. ${projectedPensionCapital.toLocaleString("de-DE")} € (Deckung der Rentenlücke: ${overallPensionCoveragePercent} %).`,
  };

  return {
    items: [item1, item2, item3],
    overallPensionCoveragePercent,
    projectedPensionCapital,
  };
}

/**
 * Hilfsfunktion zum Balancieren von 3 Töpfen auf exakt 100 %
 */
export function balanceAllocation(
  changedKey: "sicherheit" | "wachstum" | "spielgeld",
  newVal: number,
  current: PotAllocation
): PotAllocation {
  const val = Math.max(0, Math.min(90, Math.round(newVal)));
  const remaining = 100 - val;

  const otherKeys = (
    ["sicherheit", "wachstum", "spielgeld"] as (keyof PotAllocation)[]
  ).filter((k) => k !== changedKey);

  const key1 = otherKeys[0];
  const key2 = otherKeys[1];

  const currentOtherSum = current[key1] + current[key2];

  let val1 = 0;
  let val2 = 0;

  if (currentOtherSum > 0) {
    val1 = Math.round((current[key1] / currentOtherSum) * remaining);
    val2 = remaining - val1;
  } else {
    val1 = Math.round(remaining / 2);
    val2 = remaining - val1;
  }

  return {
    sicherheit:
      changedKey === "sicherheit"
        ? val
        : key1 === "sicherheit"
        ? val1
        : val2,
    wachstum:
      changedKey === "wachstum"
        ? val
        : key1 === "wachstum"
        ? val1
        : val2,
    spielgeld:
      changedKey === "spielgeld"
        ? val
        : key1 === "spielgeld"
        ? val1
        : val2,
  };
}
