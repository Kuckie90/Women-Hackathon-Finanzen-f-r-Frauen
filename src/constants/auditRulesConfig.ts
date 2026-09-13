/**
 * Referenzwerte, Prüfregeln und Scoringsystem für das Portfolio-Audit.
 * Stand: 2026-09-13 (Review-Zyklus: Jährlich, Referenzindex: MSCI World per 2026-08-31).
 * Schwellen sind Konventionen der Beraterpraxis, keine Rechtsnormen, soweit nicht 'law' als Quelle angegeben ist.
 */

export interface SectorWeight {
  [sector: string]: number;
}

export interface CountryWeight {
  [country: string]: number;
}

export interface AuditReferenceValues {
  msci_world: {
    constituents: number;
    top10_weight: number;
    sectors: SectorWeight;
    countries: CountryWeight;
    max_drawdown: number;
    max_drawdown_period: string;
    volatility_10y: number;
    pe: number;
  };
  germany_market_cap_share: number;
  germany_gdp_share: number;
  deposit_insurance_eur: number;
  deposit_insurance_temporary_eur: number;
  deposit_insurance_temporary_months: number;
  rentenwert_eur_monthly: number;
  rentenwert_valid_from: string;
}

export interface BucketAssignmentRule {
  instrument: string;
  bucket: "sicherheit" | "wachstum" | "spielgeld";
  condition?: string;
  else_bucket?: "sicherheit" | "wachstum" | "spielgeld";
  valuation?: string;
  flag?: string;
  exclude_from?: string[];
  include_in?: string[];
  subtype?: string;
  liquidity?: string;
  issuer_risk?: boolean;
}

export interface AuditRuleDefinition {
  id: string;
  block: "struktur" | "sicherheit" | "wachstum" | "klumpen" | "produkt" | "kosten" | "rebalancing";
  metric: string;
  base?: string;
  lookthrough?: boolean;
  direction?: "high_is_bad" | "low_is_bad";
  green?: number | string | [number, number];
  yellow?: number | string | { absolute_pp?: number; relative?: number } | [number, number][];
  red?: number | string | { absolute_pp?: number; relative?: number };
  unit?: string;
  source: string;
  output?: "information_only" | "explanation_only";
  requires?: string[];
  band_center?: string;
  green_tolerance?: number;
  yellow_tolerance?: number;
}

export interface ScoreBlockConfig {
  weight: number;
  yellow_penalty: number;
  red_penalty: number;
}

export const AUDIT_CONFIG = {
  meta: {
    version: "2026-09-13",
    review_cycle: "annual",
    reference_index: "MSCI World",
    reference_date: "2026-08-31",
    note: "Schwellen sind Konventionen der Beraterpraxis, keine Rechtsnormen, soweit nicht 'law' als source angegeben. Prozentwerte als Dezimalzahlen.",
  },
  reference_values: {
    msci_world: {
      constituents: 1280,
      top10_weight: 0.2661,
      sectors: {
        "Information Technology": 0.2981,
        "Financials": 0.1658,
        "Industrials": 0.1113,
        "Health Care": 0.0927,
        "Consumer Discretionary": 0.0882,
        "Communication Services": 0.079,
        "Consumer Staples": 0.0491,
        "Energy": 0.0409,
        "Materials": 0.0347,
        "Utilities": 0.0239,
        "Real Estate": 0.0164,
      },
      countries: {
        "United States": 0.7214,
        "Japan": 0.0578,
        "United Kingdom": 0.0353,
        "Canada": 0.0346,
        "France": 0.0236,
        "Other": 0.1274,
      },
      max_drawdown: 0.5746,
      max_drawdown_period: "2007-10-31 bis 2009-03-09",
      volatility_10y: 0.1486,
      pe: 23.2,
    },
    germany_market_cap_share: 0.02,
    germany_gdp_share: 0.044,
    deposit_insurance_eur: 100000,
    deposit_insurance_temporary_eur: 500000,
    deposit_insurance_temporary_months: 6,
    rentenwert_eur_monthly: 42.52,
    rentenwert_valid_from: "2026-07-01",
  } as AuditReferenceValues,
  bases: {
    investable: "Alles außer selbstgenutzter Immobilie und Rentenansprüchen",
    equity: "Aktien und Aktienfonds nach Look-through",
    net_worth: "Alles inkl. Immobilie, abzüglich Schulden",
    liquid_safe: "Einlagen, Geldmarkt, Anleihen bis 1 Jahr Restlaufzeit",
    security_bucket: "Alle Positionen im Sicherheitstopf",
  },
  bucket_assignment: [
    { instrument: "deposit", bucket: "sicherheit" },
    { instrument: "money_market_etf_eur", bucket: "sicherheit" },
    { instrument: "bond_ig_eur", bucket: "sicherheit", condition: "duration<=5", else_bucket: "wachstum" },
    { instrument: "bond_high_yield", bucket: "wachstum" },
    { instrument: "bond_em", bucket: "wachstum" },
    { instrument: "bond_fx_unhedged", bucket: "wachstum" },
    { instrument: "pension_statutory", bucket: "sicherheit", valuation: "present_value" },
    { instrument: "pension_private", bucket: "sicherheit", flag: "cost_check" },
    { instrument: "life_insurance", bucket: "sicherheit", flag: "cost_check" },
    { instrument: "home_owner_occupied", bucket: "sicherheit", exclude_from: ["investable", "liquid_safe"], include_in: ["net_worth", "cluster_check"] },
    { instrument: "real_estate_rental", bucket: "wachstum" },
    { instrument: "equity_etf_broad", bucket: "wachstum" },
    { instrument: "equity_etf_region", bucket: "wachstum" },
    { instrument: "equity_etf_sector_theme", bucket: "wachstum", subtype: "concentrated" },
    { instrument: "stock_single", bucket: "wachstum" },
    { instrument: "stock_employer", bucket: "wachstum", subtype: "human_capital" },
    { instrument: "fund_mixed", bucket: "wachstum" },
    { instrument: "real_estate_fund_open", bucket: "wachstum", liquidity: "24m_hold_12m_notice" },
    { instrument: "gold_physical_or_backed_etc", bucket: "wachstum" },
    { instrument: "etc_etn_unbacked", bucket: "wachstum", issuer_risk: true },
    { instrument: "certificate_structured", bucket: "wachstum", issuer_risk: true },
    { instrument: "crypto", bucket: "spielgeld" },
    { instrument: "leveraged_product", bucket: "spielgeld" },
    { instrument: "crowdinvesting_p2p_closed_fund", bucket: "spielgeld" },
    { instrument: "private_business", bucket: "wachstum", subtype: "human_capital" },
  ] as BucketAssignmentRule[],
  rules: [
    { id: "A1", block: "struktur", metric: "liquid_safe_months_of_expenses", base: "liquid_safe", direction: "low_is_bad", green: 3, yellow: 1, red: 0, unit: "Monate", source: "Konvention; Robbins bis 12 Monate" },
    { id: "A2", block: "struktur", metric: "five_year_needs_coverage_by_security_bucket", direction: "low_is_bad", green: 1.0, yellow: 0.7, red: 0.0, source: "Beraterpraxis" },
    { id: "A3", block: "struktur", metric: "spielgeld_share", base: "investable", direction: "high_is_bad", green: 0.05, yellow: 0.10, source: "Konvention (max. 5–10 %)" },
    { id: "A4", block: "struktur", metric: "growth_share_vs_band", band_center: "1.10 - age/100", green_tolerance: 0.20, yellow_tolerance: 0.35, output: "information_only", source: "Konvention (110 minus Alter)" },

    { id: "B1", block: "sicherheit", metric: "deposits_per_bank_eur", direction: "high_is_bad", green: 100000, yellow: 150000, source: "Gesetz: § 8 EinSiG (100.000 € gesetzl. Einlagensicherung)" },
    { id: "B2", block: "sicherheit", metric: "fx_share_in_security_bucket", base: "security_bucket", direction: "high_is_bad", green: 0.0, yellow: 0.20, source: "Konvention (Kein Währungsrisiko im Fundament)" },
    { id: "B3", block: "sicherheit", metric: "bond_duration_security_bucket", direction: "high_is_bad", green: 5, yellow: 8, unit: "Jahre", source: "Konvention; Zinsschock 2022" },
    { id: "B4", block: "sicherheit", metric: "bond_min_rating_security_bucket", green: "BBB-", yellow: "BB", red: "below BB or unrated", source: "Investment-Grade-Definition" },
    { id: "B5", block: "sicherheit", metric: "issuer_risk_products_in_security_bucket", base: "security_bucket", direction: "high_is_bad", green: 0.0, yellow: 0.05, source: "Konvention; Lehman Brothers 2008" },
    { id: "B6", block: "sicherheit", metric: "home_share_of_net_worth", base: "net_worth", direction: "high_is_bad", green: 0.50, yellow: 0.70, output: "information_only", source: "Konvention" },
    { id: "B7", block: "sicherheit", metric: "insurance_wrapper_effective_cost_pa", direction: "high_is_bad", green: 0.010, yellow: 0.015, source: "PIB/BIB Effektivkosten (max. 1,0–1,5 % p. a.)" },

    { id: "C1", block: "wachstum", metric: "largest_single_stock_share", base: "investable", lookthrough: true, direction: "high_is_bad", green: 0.05, yellow: 0.10, source: "Fidelity 5 %, Schwab 10 %, T. Rowe Price 5–10 %" },
    { id: "C2", block: "wachstum", metric: "employer_stock_share", base: "investable", direction: "high_is_bad", green: 0.03, yellow: 0.10, source: "Schwab 10–20 %; strenger wegen Einkommenskorrelation" },
    { id: "C3", block: "wachstum", metric: "top10_share_of_equity", base: "equity", lookthrough: true, direction: "high_is_bad", green: 0.35, yellow: 0.50, source: "MSCI World Top 10 = 26,6 %" },
    { id: "C4", block: "wachstum", metric: "effective_number_of_stocks", base: "equity", lookthrough: true, direction: "low_is_bad", green: 50, yellow: 20, source: "Statman 1987; MSCI World ~90–100 effektiv" },
    { id: "C5", block: "wachstum", metric: "count_single_stocks_if_no_broad_etf", direction: "low_is_bad", green: 30, yellow: 15, source: "Statman 1987; Elton/Gruber 1977" },
    { id: "C6", block: "wachstum", metric: "largest_sector_overweight_vs_index_pp", base: "equity", lookthrough: true, direction: "high_is_bad", green: 0.10, yellow: 0.20, source: "Relativ zum MSCI World (IT 29,8 %)" },
    { id: "C7", block: "wachstum", metric: "largest_sector_share_absolute", base: "equity", lookthrough: true, direction: "high_is_bad", green: 0.40, yellow: 0.50, source: "Konvention (max. 40 % in einem Sektor)" },
    { id: "C8", block: "wachstum", metric: "germany_share_of_equity", base: "equity", lookthrough: true, direction: "high_is_bad", green: 0.10, yellow: 0.25, source: "Whitebox 2023 (54 % typisch); Welt-Marktkapitalisierung ~2 %" },
    { id: "C9", block: "wachstum", metric: "us_share_of_equity", base: "equity", lookthrough: true, green_range: [0.60, 0.80], yellow_range: [[0.40, 0.60], [0.80, 0.90]], source: "MSCI World USA 72,1 %" },
    { id: "C10", block: "wachstum", metric: "largest_non_us_country_share", base: "equity", lookthrough: true, direction: "high_is_bad", green: 0.15, yellow: 0.25, source: "Japan 5,8 % im MSCI World" },
    { id: "C11", block: "wachstum", metric: "usd_share_of_investable", base: "investable", lookthrough: true, direction: "high_is_bad", green: 0.60, yellow: 0.75, source: "Konvention" },
    { id: "C12", block: "wachstum", metric: "thematic_sector_etf_share_of_equity", base: "equity", direction: "high_is_bad", green: 0.10, yellow: 0.20, source: "Konvention" },
    { id: "C13", block: "wachstum", metric: "pairwise_etf_overlap_max", lookthrough: true, direction: "high_is_bad", green: 0.30, yellow: 0.60, source: "Konvention; MSCI World vs S&P 500 ~70 %" },
    { id: "C14", block: "wachstum", metric: "gold_share", base: "investable", direction: "high_is_bad", green: 0.10, yellow: 0.15, source: "Konvention; Ray Dalio All Seasons 7,5 %" },
    { id: "C15", block: "wachstum", metric: "crypto_share", base: "investable", direction: "high_is_bad", green: 0.03, yellow: 0.05, source: "Konvention" },

    { id: "D1", block: "klumpen", metric: "employer_sector_overweight_pp", direction: "high_is_bad", yellow: 0.10, red: 0.20, requires: ["employer_sector"], source: "Einkommens-Portfolio-Korrelation" },
    { id: "D2", block: "klumpen", metric: "region_cluster_count", yellow: 2, red: 3, requires: ["home_region", "employer_region", "equity_overweight_region"], source: "Regionaler Schock" },
    { id: "D3", block: "klumpen", metric: "partner_same_sector_or_employer", yellow: "same_sector", red: "same_employer", requires: ["partner_employer"], source: "Haushaltsebene" },
    { id: "D4", block: "klumpen", metric: "illiquid_share_of_net_worth_ex_home", direction: "high_is_bad", yellow: 0.30, red: 0.50, source: "Konvention" },

    { id: "E1", block: "produkt", metric: "certificates_structured_share", base: "investable", direction: "high_is_bad", yellow: 0.05, red: 0.10, source: "Emittentenrisiko" },
    { id: "E2", block: "produkt", metric: "leveraged_share", base: "investable", direction: "high_is_bad", yellow: 0.01, red: 0.02, source: "Totalverlustrisiko" },
    { id: "E3", block: "produkt", metric: "open_real_estate_fund_share", base: "investable", direction: "high_is_bad", yellow: 0.10, red: 0.15, source: "Gesetz: § 255 KAGB (24 Monate Mindesthaltefrist, 12 Monate Kündigung)" },
    { id: "E4", block: "produkt", metric: "active_fund_weighted_ter", direction: "high_is_bad", yellow: 0.005, red: 0.010, source: "Kostenvergleich vs. ETFs" },
    { id: "E5", block: "produkt", metric: "swap_etf_present", output: "explanation_only", source: "UCITS-Kontrahentenrisiko max. 10 % NAV" },

    { id: "F1", block: "kosten", metric: "weighted_ongoing_fund_costs_pa", direction: "high_is_bad", yellow: 0.004, red: 0.008, source: "Konvention (ETFs meist 0,15–0,25 %)" },
    { id: "F2", block: "kosten", metric: "broker_fees_share_of_annual_contributions", direction: "high_is_bad", yellow: 0.01, red: 0.02, source: "Konvention" },

    { id: "G1", block: "rebalancing", metric: "bucket_drift_from_target", yellow: { absolute_pp: 0.05, relative: 0.25 }, red: { absolute_pp: 0.10 }, source: "Swedroe 5/25-Regel; Vanguard Rebalancing Research" },
  ] as AuditRuleDefinition[],
  score: {
    blocks: {
      struktur: { weight: 30, yellow_penalty: 5, red_penalty: 15 },
      sicherheit: { weight: 25, yellow_penalty: 4, red_penalty: 12 },
      wachstum: { weight: 30, yellow_penalty: 3, red_penalty: 8 },
      klumpen: { weight: 10, yellow_penalty: 3, red_penalty: 6 },
      produkt_kosten: { weight: 5, yellow_penalty: 1, red_penalty: 3 },
    } as Record<string, ScoreBlockConfig>,
    floor_per_block: 0,
  },
  phrasing_guardrails: [
    "Befund mit Zahl, dann Referenz, dann Stressfall, dann Frage.",
    "Kein bestimmtes Finanzinstrument als Kauf- oder Verkaufsziel nennen.",
    "Alternativen nur auf Kategorienebene (z. B. 'breit gestreuter Welt-ETF').",
    "Konvention als Konvention benennen, Gesetz als Gesetz.",
    "Positivbefunde ausgeben, nicht nur Warnungen.",
  ],
};
