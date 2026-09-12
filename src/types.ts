/**
 * Topfgeld TypeScript Type Definitions
 */

export type PufferChoice = "unter3" | "3bis6" | "ueber6";
export type SchuldenChoice =
  | "keine"
  | "nur_immobilie"
  | "konsum_unter5"
  | "konsum_ueber5"
  | "unter5"
  | "ueber5";
export type EinkommenChoice = "sicher" | "teilzeit" | "schwankend";
export type UnterbrechungChoice = "nein" | "ja" | "aktuell";
export type HorizontChoice = "unter3" | "3bis10" | "ueber10";
export type ReaktionChoice = "verkaufen" | "aussitzen" | "nachkaufen";
export type ZielChoice = "altersvorsorge" | "anschaffung" | "vermoegensaufbau";
export type NachhaltigkeitChoice = "wichtig" | "egal";
export type GreifbarChoice = "greifbar" | "egal";

export interface Answers {
  erfahren: boolean;
  puffer?: PufferChoice;
  schulden?: SchuldenChoice;
  einkommen?: EinkommenChoice;
  unterbrechung?: UnterbrechungChoice;
  horizont?: HorizontChoice;
  reaktion?: ReaktionChoice;
  ziel?: ZielChoice;
  // Zwei Zusatzfragen: Skalen von 1 bis 10
  nachhaltigkeitScale: number; // 1-10
  greifbarScale: number; // 1-10 (physisches Gold im Tresor, Immobilien zum Betreten)
  nachhaltigkeit: NachhaltigkeitChoice;
  greifbar: GreifbarChoice;
  einmalbetrag: number;
  monatsrate: number;
  // Monatliches Nettoeinkommen für die automatische Sparraten-Empfehlung (optional)
  nettoeinkommen?: number;
  sparrateModus?: "berechnen" | "manuell";
  // Gesamtlebensziele & Rentenlücke
  lebensziele?: LebenszieleConfig;
  // Händisch angepasste Töpfe (falls die Nutzerin vom berechneten Soll abweichen möchte)
  customAllocation?: PotAllocation;
}

export interface RentenlueckeData {
  aktuellesAlter: number; // z. B. 32
  rentenAlter: number; // z. B. 67
  wunschRenteNetto: number; // monatlich im Alter
  erwarteteRenteNetto: number; // Schätzung gesetzliche/betriebliche Rente
  rentenlueckeMonatlich: number; // Differenz
  benoetigtesKapital: number; // Kapitalstock zum Renteneintritt
  monatlicheSparrateFuerRente: number; // Nötige Sparrate in Topf 2 (Wachstum @ 6% Realrendite)
}

export interface LebenszielItem {
  id: string;
  kategorie: "kurzfristig" | "mittelfristig" | "langfristig";
  titel: string;
  zielbetrag: number;
  zeithorizontText: string;
  zielTopf: "sicherheit" | "wachstum" | "spielgeld";
  beschreibung: string;
}

export interface LebenszieleConfig {
  rentenCheckAktiv: boolean;
  rentenluecke: RentenlueckeData;
  kurzfristZiel: {
    titel: string;
    zielbetrag: number;
    monate: number;
  };
  mittelfristZiel: {
    titel: string;
    zielbetrag: number;
    jahre: number;
  };
}

export interface IstBestand {
  sicherheit: number;
  wachstum: number;
  spielgeld: number; // Spaßgeld / Spielgeld
  immobilien?: number; // Gehört zum Wachstum (Eigenkapital/Tilgung) oder Sicherheit (Instandhaltungsrücklage)
}

export type ProfileType =
  | "Absicherung zuerst"
  | "Vorsichtig"
  | "Ausgewogen"
  | "Offensiv";

export interface PotAllocation {
  sicherheit: number; // in %
  wachstum: number;   // in %
  spielgeld: number;  // in % (Spaßgeld)
}

export interface ScoreBreakdown {
  totalScore: number;
  baseProfile: ProfileType;
  finalProfile: ProfileType;
  appliedOverride: string | null;
  items: {
    key: string;
    label: string;
    valueLabel: string;
    points: number;
  }[];
}

export interface ParsedPosition {
  id: string;
  name: string;
  amount: number;
  category: "sicherheit" | "wachstum" | "spielgeld";
  notes?: string;
}

export interface UploadedReport {
  fileName: string;
  fileSize: number;
  parsedAt: string;
  detectedBroker?: string;
  positions: ParsedPosition[];
  totals: {
    sicherheit: number;
    wachstum: number;
    spielgeld: number;
    gesamt: number;
  };
}

export type AppStep =
  | "start"
  | "vorfrage"
  | "erkaerung_intro"
  | "q1_puffer"
  | "q2_schulden"
  | "q3_einkommen"
  | "q4_unterbrechung"
  | "q5_horizont"
  | "q6_reaktion"
  | "q7_ziel"
  | "q_lebensziele"
  | "q8_betraege"
  | "q_optional"
  | "ist_bestand"
  | "gate"
  | "auswertung"
  | "lexikon";
