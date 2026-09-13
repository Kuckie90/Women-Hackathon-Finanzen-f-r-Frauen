export interface GlossaryItem {
  term: string;
  shortExplain: string;
  detail: string;
}

export const GLOSSAR: Record<string, GlossaryItem> = {
  "Sicherheit": {
    term: "Topf 1: Sichere Anlagen (Sicherheit / Das Fundament)",
    shortExplain: "Kapitalerhalt, garantierte Liquidität und geringes Risiko. Dein unverzichtbares Sicherheitsnetz.",
    detail:
      "Was gehört hinein?\n• Notgroschen auf dem Tagesgeldkonto (3–6 Monatsausgaben für Notfälle)\n• Festgelder mit sicherem Rückzahldatum\n• Geldmarktfonds & kurzlaufende Euro-Staatsanleihen (AAA-Rating)\n• Instandhaltungsrücklage für die eigene Immobilie\n\nZweck: Schützt dich absolut verlässlich vor finanziellen Notlagen (Waschmaschine kaputt, Jobverlust) und verhindert Notverkäufe an der Börse.",
  },
  "Wachstum": {
    term: "Topf 2: Risikoaffiner & Wachstumsstärker (Wachstum / Das Beet)",
    shortExplain: "Risikoaffiner und substanziell wachstumsstärker. Der Motor für langfristigen Vermögensaufbau & Rente.",
    detail:
      "Was gehört hinein?\n• Breit gestreute Welt-Aktien-ETFs (tausende Firmen weltweit über MSCI World / FTSE All-World)\n• Gold als wertbeständige, krisenfeste Sachwert-Beimischung (5–10 %)\n• Immobilie: Die getilgten Eigenkapital-Anteile und laufende Tilgung (langfristiger Sachwert)\n\nZweck: Das „Beet“ – heute säen, monatlich gießen und über 10–20+ Jahre ernten. Schlägt nachweislich die Inflation und sichert den Lebensstandard im Ruhestand ab.",
  },
  "Träume": {
    term: "Topf 3: Träume & Chancen (Kann bei Gelingen genutzt werden – darf man aber nicht brauchen müssen!)",
    shortExplain: "Kann bei Gelingen für Träume genutzt werden – die eiserne Regel: Dieses Geld darf man unter keinen Umständen brauchen müssen!",
    detail:
      "Was gehört hinein?\n• Freie Chancen für große Träume, Weltreisen, Auszeiten oder Herzenswünsche\n• Krypto-Assets (Bitcoin, Ethereum etc. – max. 50 % dieses Topfes)\n• Trendaktien, Zukunftsthemen, KI-Wetten oder freie Experimente\n\nDie eiserne Regel: Dieses Geld darfst du im Alltag, für deine Miete oder für deine Rente unter keinen Umständen brauchen müssen! Ein Verlust bis hin zum Totalverlust muss schmerzfrei verkraftbar sein. Wenn eine Chance gelingt, kannst du dir Träume früher oder größer erfüllen.",
  },
  "Spaßgeld": {
    term: "Topf 3: Träume & Chancen (Kann bei Gelingen genutzt werden – darf man aber nicht brauchen müssen!)",
    shortExplain: "Kann bei Gelingen für Träume genutzt werden – die eiserne Regel: Dieses Geld darf man unter keinen Umständen brauchen müssen!",
    detail:
      "Was gehört hinein?\n• Freie Chancen für große Träume, Weltreisen, Auszeiten oder Herzenswünsche\n• Krypto-Assets (Bitcoin, Ethereum etc. – max. 50 % dieses Topfes)\n• Trendaktien, Zukunftsthemen, KI-Wetten oder freie Experimente\n\nDie eiserne Regel: Dieses Geld darfst du im Alltag, für deine Miete oder für deine Rente unter keinen Umständen brauchen müssen! Ein Verlust bis hin zum Totalverlust muss schmerzfrei verkraftbar sein. Wenn eine Chance gelingt, kannst du dir Träume früher oder größer erfüllen.",
  },
  "Immobilien": {
    term: "Immobilien im Drei-Töpfe-Modell",
    shortExplain: "Eigenheim, Tilgung und Instandhaltung richtig den Töpfen zuordnen.",
    detail:
      "Eine Immobilie ist kein Einzeltopf, sondern teilt sich auf:\n1. Tilgung & Eigenkapital: Gehören zum WACHSTUM. Sie bauen kontinuierlich Sachvermögen auf, sind aber illiquide (man kann keine Scheibe vom Haus zum Bäcker mitnehmen).\n2. Instandhaltungsrücklage: Gehört zur SICHERHEIT. Mindestens 1–2 € pro Quadratmeter Wohnfläche im Monat auf einem separaten Tagesgeldkonto für Reparaturen.\n3. Immobilienfonds/REITs: Gehören ebenfalls zum WACHSTUM.",
  },
  "DSGVO": {
    term: "DSGVO-Konformität bei Depotauszügen",
    shortExplain: "Warum deine Daten 100 % sicher sind: Reines Edge-Processing im Browser.",
    detail:
      "So garantieren wir den Datenschutz nach Art. 2 Abs. 2 DSGVO:\n• Reines Client-Side Parsing: Deine Datei wird direkt in deinem Browser (JavaScript) ausgelesen.\n• Kein Backend-Transfer: Es wird kein einziges Byte an einen Server oder eine KI gesendet.\n• Lokale Anonymisierung: Persönliche Daten wie Name, Depotnummer oder IBAN werden vor der Berechnung automatisch ignoriert.\n• Kein Tracking: Schließt du den Tab, sind alle temporären Dateien spurlos gelöscht.",
  },
  "Schuldenarten": {
    term: "Immobilienschulden vs. Konsumschulden",
    shortExplain: "Warum ein Baukredit 'gute Schulden' sind, Konsumschulden aber brandgefährlich.",
    detail:
      "Die Bewertung von Schulden hängt elementar vom wirtschaftlichen Gegenwert ab:\n\n1. Immobilienschulden (Baukredit / Hypothek):\n• Finanziert einen bleibenden Sachwert (Haus, Wohnung).\n• Jede monatliche Tilgung baut aktiv dein Nettovermögen auf (Topf 2: Wachstum).\n• Die Zinsen sind meist niedrig und langfristig gebunden.\n• Fazit: Kein Grund für einen Anlagestopp! Ein Baukredit läuft 20–30 Jahre — würdest du erst nach Volltilgung investieren, verpasst du Jahrzehnte des Zinseszinses. Wichtig ist lediglich eine solide Instandhaltungsrücklage auf dem Tagesgeld (Topf 1).\n\n2. Konsumschulden (Dispo, Kreditkarte, Ratenkredit):\n• Finanziert Dinge, die an Wert verlieren (Urlaub, Konsumgüter, Lifestyle).\n• Hohe Zinsen (oft 8 % bis 15 %), die garantiert anfallen und jedes Börsenwachstum zunichte machen.\n• Fazit: Echte Konsumschulden haben immer Vorrang vor der Geldanlage!",
  },
  "Rentenluecke": {
    term: "Rentenlücke & Gender Pension Gap",
    shortExplain: "Die Differenz zwischen deinem gewohnten Lebensstandard und der gesetzlichen Rente.",
    detail:
      "Warum ist das Thema gerade für Frauen so wichtig?\n• Frauen in Deutschland erhalten im Alter im Schnitt rund 30 % weniger gesetzliche Rente als Männer (Gender Pension Gap) – bedingt durch Erziehungszeiten, Teilzeitarbeit und den Gender Pay Gap.\n• Die Rentenlücke beziffert den monatlichen Fehlbetrag zwischen deinem Wunsch-Nettoeinkommen im Ruhestand und der tatsächlichen gesetzlichen Rente.\n• Durch den langen Anlagehorizont bis zur Rente (oft 15–35 Jahre) kann diese Lücke hervorragend mit Topf 2 (Wachstum / Welt-ETFs) geschlossen werden: Der Zinseszins übernimmt den Großteil der Arbeit!",
  },
  "Lebensziele": {
    term: "Lebensziele & die Drei Töpfe",
    shortExplain: "Wie kurz-, mittel- und langfristige Ziele den richtigen Töpfen zugeordnet werden.",
    detail:
      "Jedes Lebensziel braucht den passenden Zeithorizont:\n• Kurzfristig (< 3 Jahre, z.B. Notgroschen, Reise, Autoreparatur): Gehört in Topf 1 (Sicherheit auf Tagesgeld) bzw. Topf 3. Niemals an der Börse anlegen, da ein kurzfristiger Kurseinbruch nicht ausgesessen werden kann.\n• Mittelfristig (3–10 Jahre, z.B. Eigenkapital, Sabbatical, Weiterbildung): Mix aus Topf 1 und defensiveren Anlagen in Topf 2.\n• Langfristig (> 10 Jahre, insb. Altersvorsorge & Rentenlücke): Gehört zwingend in Topf 2 (Wachstum / Welt-ETFs). Nur Aktien schlagen nachweislich die Inflation und generieren echtes Vermögen.",
  },
  "Monatsausgaben": {
    term: "Monatsausgaben / Notgroschen",
    shortExplain: "Alle fixen und lebensnotwendigen Kosten eines typischen Monats.",
    detail:
      "Dazu gehören Miete oder Kreditrate, Nebenkosten, Versicherungen, Lebensmittel und Verträge. Nicht gemeint sind Urlaub oder Luxus. Der Notgroschen schützt dich davor, bei unerwarteten Rechnungen Schulden zu machen oder deine Geldanlagen mit Verlust verkaufen zu müssen.",
  },
  "Dispo": {
    term: "Dispokredit & teure Kredite",
    shortExplain: "Überziehungskredit auf dem Girokonto, meist mit 10 % bis 15 % Zinsen.",
    detail:
      "Dispozinsen und Ratenkredite sind teuer und fallen garantiert an. Selbst sehr gute Aktienmärkte erwirtschaften im Schnitt nur 6 % bis 8 % im Jahr. Schulden zu tilgen bringt daher sofort eine garantierte 'Rendite' in Höhe des gesparten Zinssatzes.",
  },
  "Depot": {
    term: "Wertpapierdepot",
    shortExplain: "Ein virtuelles Schließfach bei einer Bank für deine Wertpapiere.",
    detail:
      "Im Depot werden deine Anteile an weltweiten Unternehmen aufbewahrt. Das Depot gehört rechtlich immer dir als Sondervermögen und ist vor einer Pleite der Bank geschützt.",
  },
  "Volatilität": {
    term: "Kursschwankungen (Volatilität)",
    shortExplain: "Kurse gehen hoch und runter – das ist der normale Preis für langfristige Rendite.",
    detail:
      "Ein Rückgang von 30 % fühlt sich unangenehm an, ist aber an den Börsen historisch alle paar Jahre völlig normal. Ein Verlust entsteht erst in dem Moment, in dem du in Panik verkaufst.",
  },
  "Gender Pension Gap": {
    term: "Gender Pension Gap",
    shortExplain: "Die Rentenlücke zwischen Frauen und Männern im Alter.",
    detail:
      "In Deutschland erhalten Frauen im Alter im Durchschnitt 26 % bis 37 % weniger Alterseinkünfte als Männer. Häufige Ursachen sind Teilzeitphasen, Familien- und Pflegeauszeiten und das Ehegattensplitting. Ein eigenes Depot auf den eigenen Namen ist die wichtigste Absicherung.",
  },
  "Risiko-Rendite": {
    term: "Risiko-Rendite-Zusammenhang",
    shortExplain: "Rendite ist die Entschädigung für das Aushalten von Schwankungen.",
    detail:
      "Geldanlagen ohne Schwankung (wie Giro- oder Tagesgeld) verlieren durch die Inflation schleichend an Kaufkraft. Um langfristig Kaufkraft zu sichern und echtes Vermögen aufzubauen, führt an Sachwerten (wie Welt-Aktien) kein Weg vorbei. Durch die Drei Töpfe stellst du sicher, dass dein Sicherheits-Glas voll ist, bevor du Schwankungen eingehst.",
  },
  "Anlagetyp": {
    term: "Dein Anlagetyp & Risikoprofil",
    shortExplain: "Die optimale Balance aus deinen Zielen, deiner Verlusttoleranz und deinem Zeithorizont.",
    detail:
      "Ein Anlagetyp ist kein starrer Stempel, sondern beschreibt dein persönliches Wohlfühl-Verhältnis von Sicherheit (Topf 1) zu Wachstum (Topf 2). Ein gutes Portfolio lässt dich nachts ruhig schlafen, während dein Geld tagsüber für dich arbeitet.",
  },
  "Altersvorsorgedepot": {
    term: "Das neue Altersvorsorgedepot (Reform 2026)",
    shortExplain: "Das kapitalmarktbasierte Standardprodukt zur staatlich geförderten privaten Altersvorsorge.",
    detail:
      "Mit der Altersvorsorgereform zum 01.01.2026 hat Deutschland die private Vorsorge modernisiert:\n• Garantiefrei & ETF-basiert: Bisherige Riester-Produkte litten unter einer 100-%-Beitragsgarantie, die fast alle Rendite in Niedrigzinsanleihen band. Das neue Altersvorsorgedepot erlaubt die Anlage in kostengünstige, breit gestreute Welt-Aktien-ETFs.\n• Volle staatliche Förderung & Steuervorteile: Sparbeiträge können steuerlich als Sonderausgaben abgesetzt werden.\n• Wechseloption: Bestehende Riester-Verträge können oft unbürokratisch übertragen werden, um von den besseren Renditechancen zu profitieren.",
  },
  "FruehstartRente": {
    term: "Frühstart-Rente für Kinder (ab 2026)",
    shortExplain: "10 € monatliche staatliche Förderung für Kinder ab 6 Jahren in ein Altersvorsorgedepot.",
    detail:
      "Laut Kabinettsbeschluss 2026 (rückwirkend für Jahrgänge ab 2020):\n• Der Staat zahlt 10 € pro Monat (120 € pro Jahr) direkt in ein zertifiziertes Altersvorsorgedepot des Kindes vom 6. bis zum 18. Lebensjahr ein.\n• 12 Jahre à 120 € ergeben 1.440 € reine staatliche Einzahlung.\n• Durch den immensen Zinseszins über 60 Jahre (bis zur Rente des Kindes bei ca. 6 % Rendite) werden aus dieser kleinen staatlichen Anschubfinanzierung voraussichtlich über 40.000 € Rentenvermögen!\n• Eltern können freiwillig einen eigenen Sparbetrag aufstocken, um den Effekt zu vervielfachen.",
  },
  "Rebalancing": {
    term: "Portfolio-Rebalancing (Swedroe 5/25-Standard)",
    shortExplain: "Das Wiederherstellen der ursprünglichen Zielaufteilung nach Marktschwankungen.",
    detail:
      "Warum Rebalancing so wirkungsvoll ist:\n• Nach der bewährten Swedroe 5/25-Regel (Vanguard Research) sollte rebalanciert werden, wenn ein Topf um 5 Prozentpunkte absolut oder 25 % relativ von seinem Soll abweicht.\n• Mechanischer Antizyklik-Effekt: Durch Rebalancing verkaufst du automatisch teuer gewordene Anlagen (z. B. nach einer Aktienrallye) und kaufst günstig bewertete Bausteine nach.\n• Steuerschonendes Rebalancing: Wenn möglich, rebalanciert man vorrangig über neue Monatssparraten (Cashflow-Rebalancing), um Veräußerungsgewinnsteuern zu vermeiden.",
  },
  "Einlagensicherung": {
    term: "Gesetzliche Einlagensicherung (§ 8 EinSiG)",
    shortExplain: "Gesetzlicher Schutzschirm von 100.000 € je Anleger und Kreditinstitut.",
    detail:
      "Rechtsrahmen nach dem Einlagensicherungsgesetz (EinSiG):\n• Guthaben auf Girokonten, Tagesgeld und Festgeld sind bis 100.000 € gesetzlich vor Bankpleiten geschützt.\n• Temporär erhöhter Schutz: Bis zu 500.000 € für maximal 6 Monate bei besonderen Lebensereignissen (z. B. Immobilienverkäufe, Scheidung, Abfindungen gem. § 8 Abs. 2 EinSiG).\n• Konsequenz: Barvermögen über 100.000 € sollte immer auf mehrere Banken verteilt oder in liquide, sondervermögensgeschützte Geldmarkt-ETFs angelegt werden.",
  },
  "HomeBias": {
    term: "Home Bias (Heimatmarkt-Neigung)",
    shortExplain: "Die Neigung, das eigene Heimatland im Portfolio massiv überzugewichten.",
    detail:
      "Kapitalmarkt-Fakten:\n• Deutschland erwirtschaftet ca. 4,4 % des weltweiten Bruttoinlandsprodukts und macht nur rund 2,0 % der globalen Aktienmarktkapitalisierung aus.\n• Dennoch halten viele deutsche Privatanleger 30 % bis 50 % ihrer Aktien in heimischen DAX-Titeln (Whitebox 2023).\n• Gefahr des Doppelrisikos: Gerät die heimische Wirtschaft in eine Rezession, drohen zeitgleich Jobunsicherheit und Kursverluste im Depot. Eine breite globale Streuung (Welt-ETF) schützt davor verlässlich.",
  },
};

export interface QuestionDef {
  id: number;
  key: string;
  category?: string;
  title: string;
  subtitle?: string;
  explanationTitle?: string;
  explanationText?: string;
  glossaryKey?: string;
  options: {
    value: string;
    label: string;
    description?: string;
    badge?: string;
    badgeColor?: "green" | "gold" | "red" | "neutral";
  }[];
}

export const QUESTIONS: QuestionDef[] = [
  {
    id: 1,
    key: "puffer",
    category: "Finanzielle Basis",
    title: "Wie viele Monatsausgaben liegen verfügbar auf deinem Konto?",
    subtitle: "Girokonto, Tagesgeld oder Notgroschen",
    explanationTitle: "Warum wir das fragen:",
    explanationText:
      "Dein Notgroschen ist das Sicherheitsnetz. Wenn die Waschmaschine streikt oder das Auto in die Werkstatt muss, darfst du niemals gezwungen sein, deine langfristigen Anlagen zu verkaufen.",
    glossaryKey: "Monatsausgaben",
    options: [
      {
        value: "unter3",
        label: "Weniger als 3 Monatsausgaben",
        description: "Aktuell besteht ein erhöhtes Liquiditätsrisiko",
      },
      {
        value: "3bis6",
        label: "3 bis 6 Monatsausgaben",
        description: "Der solide Standard für die meisten Lebenslagen",
      },
      {
        value: "ueber6",
        label: "Mehr als 6 Monatsausgaben",
        description: "Sehr komfortables Polster",
      },
    ],
  },
  {
    id: 2,
    key: "schulden",
    category: "Finanzielle Basis",
    title: "Wie sieht deine Schuldensituation aus?",
    subtitle: "Immobilienschulden (Baukredit) werden völlig anders bewertet als Konsumschulden",
    explanationTitle: "Immobilienschulden vs. Konsumschulden:",
    explanationText:
      "Ein Baukredit finanziert einen bleibenden Sachwert — jede Monatsrate tilgt deine Schuld und baut dein Nettovermögen in Topf 2 (Wachstum) auf. Baukredite erfordern keinen Anlagestopp! Echte Konsumschulden (Dispo, Ratenkauf, Kreditkarte) hingegen kosten teure Zinsen für Dinge, die an Wert verlieren. Konsumschulden tilgen hat daher immer absolute Priorität.",
    glossaryKey: "Schuldenarten",
    options: [
      {
        value: "keine",
        label: "Keine Schulden",
        description: "Weder Immobilienfinanzierung noch Konsumkredite oder Dispo",
        badge: "Schuldenfrei",
        badgeColor: "green",
      },
      {
        value: "nur_immobilie",
        label: "Nur Immobilienschulden (Baukredit / Hypothek)",
        description: "Planmäßige Finanzierung für Haus oder Wohnung — keine Konsumschulden",
        badge: "Sachwert-Aufbau (Kein Anlagestopp)",
        badgeColor: "gold",
      },
      {
        value: "konsum",
        label: "Konsumschulden (erst tilgen)",
        description: "Dispokredit, Kreditkarte, Ratenkäufe oder Konsumdarlehen — vorrangig tilgen!",
        badge: "Konsumschuld (Erst tilgen!)",
        badgeColor: "red",
      },
    ],
  },
  {
    id: 3,
    key: "einkommen",
    category: "Finanzielle Basis",
    title: "Wie sicher ist dein Einkommen in den nächsten drei Jahren?",
    subtitle: "Branche, Stabilität und Vorhersehbarkeit deines monatlichen Zuflusses",
    explanationTitle: "Warum dein Berufsfeld entscheidend ist:",
    explanationText:
      "Wer ein krisensicheres Festgehalt hat, kann im Portfolio mehr ins Wachstum gehen. Bei schwankenden Einnahmen, volatilen Branchen (wie Tech & Startups) oder bevorstehenden Auszeiten braucht dein Sicherheits-Glas (Topf 1) mehr Gewicht, damit du niemals zu Notverkäufen gezwungen wirst.\n\n💡 Hinweis zu Auszeiten: Falls du ein Sabbatical, Elternzeit oder eine Stundenreduktion planst: In der direkt folgenden Frage kannst du den genauen Zeitraum, die Dauer und den Umfang im Detail festlegen!",
    options: [
      {
        value: "sicher",
        label: "Sehr sicher & krisenfest",
        description: "Unbefristete Festanstellung, Beamtenstatus, öffentlicher Dienst oder krisenfeste Branche",
        badge: "Hohe Stabilität",
        badgeColor: "green",
      },
      {
        value: "volatil_branche",
        label: "Festanstellung in volatiler Branche",
        description: "Z. B. Tech, Startups, Krypto, Agenturen oder Restrukturierung (gutes Gehalt, aber Kündigungs- oder Marktrisiko)",
        badge: "Tech / Volatil",
        badgeColor: "gold",
      },
      {
        value: "teilzeit",
        label: "Befristet, Teilzeit oder Übergang",
        description: "Befristeter Arbeitsvertrag, reduzierte Stundenzahl oder geplanter Jobwechsel",
        badge: "Befristet / Teilzeit",
        badgeColor: "neutral",
      },
      {
        value: "schwankend",
        label: "Stark schwankend oder selbstständig",
        description: "Freiberufler:in, Selbstständigkeit, Unternehmertum oder stark provisions- & erfolgsabhängig",
        badge: "Schwankend",
        badgeColor: "neutral",
      },
      {
        value: "auszeit_geplant",
        label: "Geplante Auszeit, Sabbatical oder Elternzeit",
        description: "In den nächsten 1–3 Jahren steht eine berufliche Pause, Sabbatical oder Familiengründung an (wird in Frage 4 detailliert)",
        badge: "Auszeit / Sabbatical",
        badgeColor: "gold",
      },
    ],
  },
  {
    id: 4,
    key: "unterbrechung",
    category: "Finanzielle Basis",
    title: "Planst du in den nächsten fünf Jahren eine Unterbrechung oder Reduzierung?",
    subtitle: "Elternzeit, Pflege, Weiterbildung oder Sabbatical",
    explanationTitle: "Lebensphasen mitdenken:",
    explanationText:
      "Auszeiten kosten Geld und verringern oft die Sparfähigkeit. Wir teilen deine Sparrate dann automatisch in eine verlässliche Basis und eine optionale Aufstockung.",
    glossaryKey: "Gender Pension Gap",
    options: [
      {
        value: "nein",
        label: "Nein",
        description: "Kontinuierliches Einkommen geplant",
      },
      {
        value: "ja",
        label: "Ja, ist geplant",
        description: "Eine Auszeit oder Stundenreduktion steht bevor",
      },
      {
        value: "aktuell",
        label: "Bin gerade darin",
        description: "Aktuell reduzierte oder pausierte Erwerbstätigkeit",
      },
    ],
  },
  {
    id: 5,
    key: "horizont",
    category: "Finanzielle Basis",
    title: "Wann brauchst du das angelegte Geld wieder?",
    subtitle: "Dein geplanter Anlagezeitraum für das anzulegende Kapital",
    explanationTitle: "Warum der Anlagehorizont entscheidend ist:",
    explanationText:
      "Je länger dein Anlagehorizont ist, desto gelassener kannst du zwischenzeitliche Marktschwankungen aussitzen und vom Zinseszins profitieren. Geld, das du in den nächsten 3 Jahren benötigst, sollte keinem Börsenrisiko ausgesetzt werden. Erst ab 5 bis 10+ Jahren entfalten chancenreiche Wertpapiere ihr volles Potenzial.",
    options: [
      {
        value: "unter3",
        label: "In weniger als 3 Jahren (Kurzfristig)",
        description: "Ich brauche das Geld zeitnah wieder (z. B. für Autokauf, Umzug oder kurzfristige Anschaffungen).",
      },
      {
        value: "3bis10",
        label: "In 3 bis 10 Jahren (Mittelfristig)",
        description: "Das Geld soll 3 bis 10 Jahre arbeiten (z. B. für größere Pläne oder mittelfristige Flexibilität).",
      },
      {
        value: "ueber10",
        label: "In mehr als 10 Jahren (Langfristig)",
        description: "Das Geld kann 10 bis 20+ Jahre ungestört wachsen (z. B. für dauerhaften Vermögensaufbau oder den Ruhestand).",
      },
    ],
  },
  {
    id: 6,
    key: "renditeFokus",
    category: "Risikobereitschaft & Anlageziel",
    title: "Was steht bei deiner Geldanlage an erster Stelle?",
    subtitle: "Dein persönlicher Schwerpunkt zwischen Sicherheit und Rendite",
    explanationTitle: "Risikofreude vs. Kapitalschutz:",
    explanationText:
      "Hier geht es rein um deine Risikobereitschaft: Möchtest du dein Kapital vor Schwankungen schützen oder suchst du maximale Renditechancen? Der Zeithorizont wird nicht hier vorgegeben, sondern separat erfasst und erst im Gesamtergebnis mit deiner Risikobereitschaft kombiniert.",
    glossaryKey: "Risiko-Rendite",
    options: [
      {
        value: "sicherheit",
        label: "Absoluter Kapitalschutz",
        description: "Keine Verluste erleiden – auch wenn das Geld durch Inflation real an Wert verliert",
        badge: "Sicherheit zuerst",
        badgeColor: "green",
      },
      {
        value: "ausgewogen",
        label: "Gesunder Mittelweg",
        description: "Solider Inflationsschutz mit moderatem Wachstum bei vertretbaren Schwankungen",
        badge: "Balance",
        badgeColor: "gold",
      },
      {
        value: "rendite",
        label: "Maximale Rendite",
        description: "Möglichst hoher Vermögenszuwachs – deutliche zwischenzeitliche Schwankungen nehme ich in Kauf",
        badge: "Renditechance",
        badgeColor: "neutral",
      },
    ],
  },
  {
    id: 7,
    key: "verlustToleranz",
    category: "Risikobereitschaft & Anlageziel",
    title: "Wie lange könntest du eine schwache Börsenphase aussitzen?",
    subtitle: "Nervenstärke und Zeithorizont bei längeren Durststrecken",
    explanationTitle: "Zyklen verstehen:",
    explanationText:
      "Märkte bewegen sich in Wellen. Nach jedem Bärenmarkt (Abwärtsphase) folgte in der Historie ein neuer Höchststand. Entscheidend ist, wie gelassen du diese Phasen durchhalten kannst.",
    glossaryKey: "Volatilität",
    options: [
      {
        value: "unruhig",
        label: "Kaum – schon wenige Monate machen mich nervös",
        description: "Ich mache mir schnell Sorgen und verfolge beunruhigende Finanznachrichten",
      },
      {
        value: "rational",
        label: "1 bis 2 Jahre sind für mich okay",
        description: "Ich weiß rational, dass Krisen vorübergehen, auch wenn es sich mulmig anfühlt",
      },
      {
        value: "gelassen",
        label: "Mehrere Jahre problemlos",
        description: "Ich ignoriere Tagesnachrichten und vertraue voll auf die langfristige Wirtschaftskraft",
      },
    ],
  },
  {
    id: 8,
    key: "erfahrungLevel",
    category: "Risikobereitschaft & Anlageziel",
    title: "Welche Erfahrung hast du bisher mit Geldanlagen?",
    subtitle: "Dein Vorwissen mit Wertpapieren, Fonds oder ETFs",
    explanationTitle: "Erfahrung stärkt das Vertrauen:",
    explanationText:
      "Wer schon einmal einen echten Marktcrash live miterlebt hat, reagiert oft deutlich besonnener als Neueinsteigerinnen. Wir passen die Allokation an deinen Wohlfühlbereich an.",
    glossaryKey: "Depot",
    options: [
      {
        value: "keine",
        label: "Bisher gar keine",
        description: "Mein Geld lag bisher nur auf dem Girokonto, Sparbuch oder Tagesgeld",
      },
      {
        value: "basis",
        label: "Erste Schritte / Basiswissen",
        description: "Festgeld, Bausparer oder vielleicht schon ein erster kleiner ETF-Sparplan",
      },
      {
        value: "fundiert",
        label: "Fundierte Erfahrung",
        description: "Ich bespare seit mehreren Jahren selbstständig weltweite ETFs oder Fonds",
      },
      {
        value: "fortgeschritten",
        label: "Fortgeschritten & vielseitig",
        description: "Erfahrung mit ETFs, Einzelaktien, Krypto oder verschiedenen Anlageklassen",
      },
    ],
  },
  {
    id: 9,
    key: "ziel",
    category: "Risikobereitschaft & Anlageziel",
    title: "Wofür legst du an?",
    subtitle: "Dein Hauptziel bestimmt die Risikobereitschaft",
    explanationTitle: "Ziel und Strategie:",
    explanationText:
      "Die Altersvorsorge hat den längsten Atem und verträgt am meisten Wachstum. Eine Anschaffung braucht dagegen Termintreue und Sicherheit.",
    options: [
      {
        value: "altersvorsorge",
        label: "Altersvorsorge",
        description: "Finanzielle Unabhängigkeit und Schutz vor Altersarmut",
      },
      {
        value: "vermoegensaufbau",
        label: "Vermögensaufbau ohne festen Zweck",
        description: "Geld für die Zukunft arbeiten lassen und Flexibilität wahren",
      },
      {
        value: "anschaffung",
        label: "Größere Anschaffung",
        description: "Immobilienkauf, Selbstständigkeit oder große Projekte",
      },
    ],
  },
  {
    id: 10,
    key: "reaktion",
    category: "Anlegerinnen-Persönlichkeit",
    title: "Dein Depot steht 30 % im Minus. Was tust du?",
    subtitle: "Ehrliche Selbsteinschätzung bei Marktturbulenzen",
    explanationTitle: "Psychologie der Börse:",
    explanationText:
      "Die größte Gefahr beim Anlegen ist nicht die Börse, sondern die eigene Panik. Wer im Tief verkauft, verwandelt Buchverluste in echte Verluste. Ein klares Regelwerk und Disziplin schützen dich vor Fehlentscheidungen.",
    glossaryKey: "Volatilität",
    options: [
      {
        value: "verkaufen",
        label: "Verkaufen",
        description: "Reißleine ziehen, um noch Schlimmeres zu verhindern",
      },
      {
        value: "aussitzen",
        label: "Aussitzen",
        description: "Ruhe bewahren, die Kurse erholen sich historisch wieder",
      },
      {
        value: "nachkaufen",
        label: "Nachkaufen",
        description: "Günstige Einstiegspreise nutzen und mehr Anteile sichern",
      },
    ],
  },
  {
    id: 11,
    key: "entscheidungsStil",
    category: "Anlegerinnen-Persönlichkeit",
    title: "Wie triffst du Finanzentscheidungen am liebsten?",
    subtitle: "Rationale Fakten vs. emotionales Bauchgefühl",
    explanationTitle: "Kopf vs. Bauch:",
    explanationText:
      "Manche Anlegerinnen brauchen wissenschaftliche Studien und Kennzahlen, andere vertrauen ihrer Intuition oder wollen vor allem nachts ruhig schlafen. Beides ist völlig legitim und hilft uns, deine Strategie auf dich abzustimmen.",
    options: [
      {
        value: "rational",
        label: "Nüchterne Zahlen & Fakten",
        description: "Wissenschaftliche Daten, Statistiken und rationale Kennzahlen geben mir Sicherheit",
        badge: "Rational / Zahlenbasiert",
        badgeColor: "gold",
      },
      {
        value: "ausgewogen",
        label: "Ausgewogen (Kopf & Herz)",
        description: "Die Zahlen müssen stimmen, aber das Bauchgefühl muss sich ebenfalls gut anfühlen",
        badge: "Ausgewogen",
        badgeColor: "green",
      },
      {
        value: "emotional",
        label: "Gutes Gefühl & Seelenruhe",
        description: "Ruhiger Schlaf und emotionales Wohlbefinden zählen für mich mehr als die letzte Nachkommastelle Rendite",
        badge: "Seelenruhe zuerst",
        badgeColor: "neutral",
      },
    ],
  },
  {
    id: 12,
    key: "greifbar",
    category: "Anlegerinnen-Persönlichkeit",
    title: "Wie wichtig sind dir anfassbare, haptische Sachwerte?",
    subtitle: "Physisches Gold & reale Werte vs. rein digitale Wertpapier-Depots",
    explanationTitle: "Haptik & mentale Beruhigung:",
    explanationText:
      "Ein Wertpapierdepot ist rein digital. Manch eine Anlegerin schätzt als mentale Beruhigung eine Beimischung greifbarer Werte wie physisches Gold im Tresor oder Immobilien.",
    options: [
      {
        value: "digital",
        label: "Rein digital reicht vollkommen",
        description: "ETFs und digitale Verwahrung im Depot sind modern, liquide und unkompliziert",
        badge: "Modern & Digital",
        badgeColor: "green",
      },
      {
        value: "ausgewogen",
        label: "Ausgewogen (Digital mit realem Anker)",
        description: "Digital ist praktisch, aber eine kleine greifbare Sachwert-Beimischung beruhigt",
        badge: "Ausgewogen",
        badgeColor: "gold",
      },
      {
        value: "physisch",
        label: "Anfassbare Sachwerte essenziell",
        description: "Echtes Gold, haptische Sachwerte oder Immobilien im Hintergrund sind mir persönlich sehr wichtig",
        badge: "Haptisch / Gold-affin",
        badgeColor: "gold",
      },
    ],
  },
  {
    id: 13,
    key: "nachhaltigkeit",
    category: "Anlegerinnen-Persönlichkeit",
    title: "Welche Rolle spielen Nachhaltigkeit & Ethik bei deiner Geldanlage?",
    subtitle: "Ökologische, soziale und ethische Kriterien (ESG/SRI)",
    explanationTitle: "Geld mit gutem Gewissen anlegen:",
    explanationText:
      "Nachhaltige ETFs schließen Unternehmen aus kontroversen Branchen (z. B. Waffen, Kohle, Tabak) aus. Du entscheidest, wie streng die Filter für deine Anlagekategorien sein sollen.",
    options: [
      {
        value: "pragmatisch",
        label: "Pragmatisch / Maximale Marktstreuung",
        description: "Klassischer Welt-Index ohne ESG-Filter, volle weltweite Marktabdeckung",
        badge: "Maximal gestreut",
        badgeColor: "neutral",
      },
      {
        value: "wichtig",
        label: "Wichtig: ESG- & SRI-gefiltert",
        description: "Ausschluss kontroverser Branchen wie Rüstung, Tabak oder fossile Energieträger",
        badge: "ESG-Standard",
        badgeColor: "green",
      },
      {
        value: "strikt",
        label: "Höchste Priorität: Kompromisslos nachhaltig",
        description: "Strikte ethisch-ökologische Kriterien und gezielte Zukunftsthemen (Klima, saubere Energie)",
        badge: "Strikt Nachhaltig",
        badgeColor: "green",
      },
    ],
  },
];
