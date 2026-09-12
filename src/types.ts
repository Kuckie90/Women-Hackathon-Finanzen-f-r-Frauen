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
export type EinkommenChoice =
  | "sicher"
  | "volatil_branche"
  | "teilzeit"
  | "schwankend"
  | "auszeit_geplant";
export type UnterbrechungChoice = "nein" | "ja" | "aktuell";
export type UnterbrechungWann = "sofort" | "in_6_monaten" | "in_1_jahr" | "in_2_bis_5_jahren";
export type UnterbrechungDauer = "3_bis_6_monate" | "6_bis_12_monate" | "1_bis_2_jahre" | "dauerhaft";
export type UnterbrechungUmfang = "voll" | "teilzeit_50" | "teilzeit_75" | "flexibel";

export interface UnterbrechungDetails {
  wann?: UnterbrechungWann;
  dauer?: UnterbrechungDauer;
  umfang?: UnterbrechungUmfang;
}

export type HorizontChoice = "unter3" | "3bis10" | "ueber10";
export type ReaktionChoice = "verkaufen" | "aussitzen" | "nachkaufen";
export type RenditeFokusChoice = "sicherheit" | "ausgewogen" | "rendite";
export type VerlustToleranzChoice = "unruhig" | "rational" | "gelassen";
export type ErfahrungChoice = "keine" | "basis" | "fundiert" | "fortgeschritten";
export type ZielChoice = "altersvorsorge" | "anschaffung" | "vermoegensaufbau";
export type NachhaltigkeitChoice = "wichtig" | "egal";
export type GreifbarChoice = "greifbar" | "egal";
export type EntscheidungsStilChoice = "rational" | "ausgewogen" | "emotional";
export type MarkenPraeferenzChoice = "welt_index" | "offen" | "bekannte_marken";
export type TechAffinitaetChoice = "digital" | "gemischt" | "klassisch";

export interface AllocationRange {
  min: number;
  max: number;
  target: number;
}

export interface PotAllocationRanges {
  sicherheit: AllocationRange;
  wachstum: AllocationRange;
  spielgeld: AllocationRange;
}

export interface Answers {
  erfahren: boolean;
  puffer?: PufferChoice;
  schulden?: SchuldenChoice;
  einkommen?: EinkommenChoice;
  unterbrechung?: UnterbrechungChoice;
  unterbrechungDetails?: UnterbrechungDetails;
  horizont?: HorizontChoice;
  reaktion?: ReaktionChoice;
  renditeFokus?: RenditeFokusChoice;
  verlustToleranz?: VerlustToleranzChoice;
  erfahrungLevel?: ErfahrungChoice;
  ziel?: ZielChoice;
  // Psychografische & methodische Präferenzen (gemäß Briefing)
  entscheidungsStil?: EntscheidungsStilChoice; // Rationale Kennzahlen vs. emotionales Bauchgefühl
  markenPraeferenz?: MarkenPraeferenzChoice; // Anonyme Indexfonds vs. bekannte Markenunternehmen
  techAffinitaet?: TechAffinitaetChoice; // Reine App- & Online-Broker vs. klassischer Bankkontakt
  // Feineinstellungen: Skalen von 1 bis 10
  nachhaltigkeitScale?: number; // 1-10
  greifbarScale?: number; // 1-10 (physisches Gold im Tresor, Immobilien zum Betreten)
  nachhaltigkeit?: NachhaltigkeitChoice;
  greifbar?: GreifbarChoice;
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

export interface Reform2026Config {
  hasRiester: boolean;
  interessiertAltersvorsorgedepot: boolean;
  hasKinder: boolean;
  kinderAnzahl: number;
  kinderSparbeitragEltern: number;
}

export interface LebenszieleConfig {
  rentenCheckAktiv: boolean;
  rentenluecke: RentenlueckeData;
  reform2026?: Reform2026Config;
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

export interface VorsorgeVertraege {
  riesterGuthaben: number;       // Riester-Rente (aktuelles Vertragskapital / Deckungskapital)
  ruerupGuthaben: number;        // Rürup-Rente / Basisrente (aktuelles Vertragskapital)
  privateRenteGuthaben: number;  // Private Rentenversicherung (Rückkaufswert / Fondsguthaben)
  lebensversicherung: number;    // Kapitallebensversicherung (aktueller Rückkaufswert)
}

export interface IstBestandDetails {
  // Topf 1 (Sicherheit)
  tagesgeldGiro: number; // Tagesgeld, Girokonto, Sparbuch
  festgeldBauspar: number; // Festgeld, Bausparvertrag

  // Altersvorsorge
  riesterKlassisch: number; // Für Rückwärtskompatibilität

  // Optionale Vorsorge- & Rentenverträge (Riester, Rürup, private Rentenversicherung, Lebensversicherung)
  vorsorge?: VorsorgeVertraege;

  // Topf 2 (Wachstum & Sachwerte)
  weltEtf: number; // Welt-Aktien-ETFs (MSCI World, All-World, ACWI)
  einzelaktien: number; // Einzelaktien (für Klumpenrisiko-Check)
  goldRohstoffe: number; // Physisches Gold, ETCs, Rohstoffe (Krisendiversifikation nach Dalio)

  // Topf 3 (Spaßgeld / Spielgeld)
  kryptoTrends: number; // Krypto, Trend-Wetten, spekulatives Spielgeld

  // Illiquider Sachwert (separat erfasst nach Robbins / Christine Benz)
  immobilieEigenkapital: number; // Selbstbewohnte Immobilie / getilgtes Eigenkapital
}

export interface IstBestand {
  sicherheit: number;
  wachstum: number;
  spielgeld: number; // Spaßgeld / Spielgeld
  immobilien?: number; // Gehört zum Wachstum (Eigenkapital/Tilgung) oder Sicherheit (Instandhaltungsrücklage)
  vorsorge?: VorsorgeVertraege;
  details?: IstBestandDetails;
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
  | "q7_renditefokus"
  | "q8_verlusttoleranz"
  | "q9_erfahrung"
  | "q10_ziel"
  | "q_lebensziele"
  | "q8_betraege"
  | "q_optional"
  | "soll_stand"
  | "ist_bestand"
  | "gate"
  | "auswertung"
  | "lexikon";
