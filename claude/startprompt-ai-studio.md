# Topfgeld – Startprompt AI Studio

Baue eine mobile Web-App auf Deutsch mit dem Namen **Topfgeld**. Zielgruppe: Frauen in Deutschland, die anlegen wollen oder schon anlegen und ihr Depot ordnen möchten.

**Grundregeln**

- Nur Frontend. Kein Backend, keine Datenbank, kein Login, keine Nutzerkonten. Alle Eingaben bleiben im Browser-Zustand und werden nirgends gespeichert oder gesendet.
- Keine Modellaufrufe zur Laufzeit. Die gesamte Logik ist fest programmiert und deterministisch. Gleiche Eingaben ergeben immer dasselbe Ergebnis.
- Handy zuerst. Entwirf für 390 px Breite, ein Screen pro Frage, große Tippflächen (mindestens 48 px hoch), Fortschrittsanzeige oben, Zurück-Button. Auf breiten Bildschirmen bleibt der Inhalt auf 430 px zentriert.
- Nenne niemals konkrete Finanzprodukte, Fonds, ETFs, Anbieter oder ISINs. Ausschließlich Töpfe und Anlageklassen.
- Sprachregel, ausnahmslos: Formuliere nie „das passt zu dir", „für dich geeignet" oder „wir empfehlen dir". Formuliere immer: „Anleger:innen mit diesem Profil halten typischerweise …". Das ist kein Stil, sondern die Grenze zur erlaubnispflichtigen Anlageberatung.
- Fußzeile auf jedem Screen, klein und grau: „Topfgeld gibt keine Anlageberatung und empfiehlt keine konkreten Finanzinstrumente. Alle Angaben bleiben auf diesem Gerät."

**Aussehen**

Ruhig und erwachsen, kein Finanz-Blau und kein Pink. Grundfläche Sandweiß `#F7F4F0`, Text und dunkle Flächen tiefes Aubergine `#3E2340`, ein einziger Akzent in warmem Messing `#B8873B`. Serifenlose Schrift, große Überschriften, viel Weißraum.

**Das Drei-Töpfe-Modell — trägt die ganze App**

- **Sicherheit** — Notgroschen und Sicherheitsnetz. Enthält: Tagesgeld, Festgeld, Geldmarkt, kurzlaufende Anleihen.
- **Wachstum** — das langfristige Beet. Enthält: breit gestreute Welt-Aktien, Gold als Beimischung.
- **Spielgeld** — zum Experimentieren. Enthält: Krypto, Einzelwerte, Themenwetten. Davon höchstens die Hälfte in Krypto.

Auf dem Startbildschirm des Erklär-Modus erscheint dieses Bild wörtlich:

> Stell dir drei Gläser auf dem Küchentisch vor. Im **Sicherheits-Glas** liegt das Geld, das da sein muss, wenn morgen die Waschmaschine kaputtgeht. Das **Wachstums-Glas** ist dein Beet: Du säst heute, gießt regelmäßig und erntest in zehn oder zwanzig Jahren. Das **Spielgeld-Glas** ist zum Experimentieren — ein Verlust darf hier wehtun, aber nichts gefährden. Topfgeld sagt dir, wie groß jedes Glas bei dir sein sollte.

**Zustand**

Halte die Antworten in einem Objekt `answers` mit genau diesen Schlüsseln:

`erfahren` (true | false), `puffer` ("unter3" | "3bis6" | "ueber6"), `schulden` ("keine" | "unter5" | "ueber5"), `einkommen` ("sicher" | "teilzeit" | "schwankend"), `unterbrechung` ("nein" | "ja" | "aktuell"), `horizont` ("unter3" | "3bis10" | "ueber10"), `reaktion` ("verkaufen" | "aussitzen" | "nachkaufen"), `ziel` ("altersvorsorge" | "anschaffung" | "vermoegensaufbau"), `nachhaltigkeit` ("wichtig" | "egal"), `greifbar` ("greifbar" | "egal"), `einmalbetrag` (Zahl), `monatsrate` (Zahl)

**Vorfrage — sie steuert nur den Ton, nie die Zahlen**

„Investierst du schon?" → Ja / Noch nicht

- Noch nicht → Erklär-Modus: Gläser-Bild auf dem Start, längere Erklärtexte unter jeder Frage, Fachbegriffe mit Antipp-Erklärung, Ist-Bestand-Screen darf übersprungen werden.
- Ja → Kurzmodus: keine Erklärtexte, direkt durch die Fragen, Ist-Bestand wird aktiv angeboten.

Beide Pfade stellen dieselben acht Fragen und rechnen identisch.

**Die acht Frage-Screens**

1. „Wie viele Monatsausgaben liegen verfügbar auf deinem Konto?" → weniger als 3 / 3 bis 6 / mehr als 6
2. „Hast du teure Schulden — Dispo, Ratenkredit, Kreditkarte?" → keine / ja, unter 5 % Zinsen / ja, über 5 % Zinsen
3. „Wie sicher ist dein Einkommen in den nächsten drei Jahren?" → sicher / befristet oder Teilzeit / schwankend
4. „Planst du in den nächsten fünf Jahren eine Unterbrechung oder Reduzierung?", Untertext „Elternzeit, Pflege, Weiterbildung" → nein / ja / bin gerade darin
5. „Wann brauchst du dieses Geld wieder?" → in weniger als 3 Jahren / in 3 bis 10 Jahren / in mehr als 10 Jahren
6. „Dein Depot steht 30 % im Minus. Was tust du?" → verkaufen / aussitzen / nachkaufen
7. „Wofür legst du an?" → Altersvorsorge / größere Anschaffung / Vermögensaufbau ohne festen Zweck
8. „Womit startest du?" → zwei Eurofelder: „Einmalbetrag" und „monatlich"

**Zwei Zusatzfragen, die ausdrücklich nichts berechnen**

Nach Frage 8, klar als optional gekennzeichnet:

- „Ist dir Nachhaltigkeit wichtig?" → wichtig / egal
- „Magst du Anlagen, die man anfassen kann?" → ja / egal

Diese beiden Antworten ändern ausschließlich, welche Beispiele innerhalb eines Topfes genannt werden — niemals die Prozentsätze. Bei `nachhaltigkeit === "wichtig"` nenne im Wachstums-Topf „breit gestreute Welt-Aktien mit Nachhaltigkeitsfilter" statt „breit gestreute Welt-Aktien". Bei `greifbar === "greifbar"` nenne Gold und Immobilienanteile zuerst. Schreibe diesen Grundsatz auch sichtbar in den „Warum dieses Ergebnis?"-Bereich.

**Die zwei Gates — vor jeder Empfehlung prüfen**

Wenn `puffer === "unter3"` oder `schulden === "ueber5"`, zeige statt des Ergebnisses den Screen „Erst der Boden, dann der Aufbau":

- Bei zu kleinem Puffer: „Bevor du anlegst, gehören 3 Monatsausgaben auf ein Tagesgeldkonto. Sonst musst du im schlechtesten Moment verkaufen."
- Bei teuren Schulden: „Ein Kredit über 5 % kostet dich sicher, was ein Depot nur vielleicht bringt. Erst tilgen, dann anlegen."
- Beide Sätze zeigen, wenn beides zutrifft.
- Darunter ein Button „Trotzdem weiterschauen" zum normalen Ergebnis — dort dann ein dauerhafter Hinweisbalken oben: „Ohne Puffer ist das eine Vorschau, kein Plan."

**Profilzuordnung — feste Regeln, kein freies Rechnen**

Punkte zählen:

- `horizont`: unter3 = 0, 3bis10 = 2, ueber10 = 4
- `reaktion`: verkaufen = 0, aussitzen = 2, nachkaufen = 4
- `einkommen`: sicher = 2, teilzeit = 1, schwankend = 0
- `ziel`: altersvorsorge = 2, vermoegensaufbau = 1, anschaffung = 0
- `unterbrechung`: nein = 1, sonst 0

Summe 0–4 → Vorsichtig, 5–9 → Ausgewogen, 10–13 → Offensiv.

Danach diese Überschreibungen in dieser Reihenfolge:

1. `horizont === "unter3"` → Profil ist Absicherung zuerst
2. `reaktion === "verkaufen"` → höchstens Vorsichtig
3. `einkommen === "schwankend"` und `unterbrechung !== "nein"` → höchstens Ausgewogen

Die Punktzahl wählt nur eines von vier festen Profilen aus. Innerhalb eines Profils wird nichts gerechnet — die Aufteilung steht fest.

**Zielallokation je Profil**

| Profil | Sicherheit | Wachstum | Spielgeld |
|---|---|---|---|
| Absicherung zuerst | 100 | 0 | 0 |
| Vorsichtig | 70 | 30 | 0 |
| Ausgewogen | 40 | 55 | 5 |
| Offensiv | 20 | 70 | 10 |

Werte sind Prozent und summieren sich je Zeile auf 100. Nicht abweichen, nicht runden, nicht dazuerfinden.

Lege diese Tabelle als eine einzige benannte Konstante `ZIELALLOKATION` ganz oben im Code ab, gut sichtbar kommentiert, und lies alle Berechnungen ausschließlich daraus. Genauso die Punktetabelle und die Schwellen als Konstante `PROFIL_REGELN` an derselben Stelle. Streue die Zahlen nirgendwo sonst ein.

**Die zwei Sparraten**

Wenn `unterbrechung === "ja"` oder `"aktuell"`:

- Basisrate „hältst du durch" = 50 % der eingegebenen Monatsrate, auf volle 10 € abgerundet
- Aufstockung „wenn möglich" = eingegebene Monatsrate minus Basisrate
- Empfohlener Puffer steigt von 3 auf 6 Monatsausgaben
- Beide Raten nebeneinander anzeigen, mit dem Satz: „Eine Rate, die auch in der Unterbrechung läuft — und eine, die du in guten Monaten obendrauf legst."

Sonst: eine einzige Rate.

**Ist-Bestand-Screen**

Drei Eurofelder, alle dürfen 0 sein, jeweils mit Beispielen darunter:

- Sicherheit — Tagesgeld, Festgeld, Geldmarkt, kurzlaufende Anleihen
- Wachstum — breit gestreute Aktien, Gold
- Spielgeld — Krypto, Einzelwerte

Darüber „Was liegt schon irgendwo?", darunter ein Button „Auswertung zeigen". Im Erklär-Modus zusätzlich ein Link „Überspringen".

**Auswertung**

Gesamtvermögen = Summe der drei Ist-Werte + Einmalbetrag.

Tabelle mit einer Zeile je Topf: Ist in € · Ist in % · Soll in % · Soll in € · Differenz in € · Maßnahme.

Maßnahme nach dieser Regel, mit `d` = Soll-Prozent minus Ist-Prozent in Prozentpunkten:

- `|d| < 10` → „Passt. Nächste Sparraten hierhin lenken." (bei d > 0) bzw. „Passt. Vorerst nichts nachlegen." (bei d ≤ 0)
- `d ≥ 10` → „Aufstocken um X €."
- `d ≤ −10` → „Umschichten: X € abbauen." plus kleiner Hinweis: „Beim Verkauf fallen Steuern an. Sparer-Pauschbetrag 1.000 € pro Jahr, bei Aktienfonds 30 % Teilfreistellung."

Darunter ein horizontales Balkendiagramm, je Topf zwei Balken (Ist und Soll). Keine Diagrammbibliothek, zeichne es mit HTML und CSS.

**„Warum dieses Ergebnis?"**

Aufklappbarer Bereich am Ende, der im Klartext zeigt: erreichte Punktzahl, welche Antwort wie viele Punkte gab, welche Überschreibung griff, welches Profil folgt, und die Obergrenze für Spielgeld und Krypto. Dazu der Satz: „Deine Antworten zu Nachhaltigkeit und greifbaren Anlagen ändern nur, welche Beispiele wir nennen — nie die Aufteilung."

**Ergebnisscreen, zusätzlicher Hinweiskasten**

„Dein Vermögen, dein Name." — „Führe Depot und Sparplan auf deinen eigenen Namen, nicht nur über ein gemeinsames Konto. Der Gender Pension Gap in Deutschland liegt je nach Berechnung zwischen 26 und 37 Prozent."

**Startbildschirm**

Titel Topfgeld, darunter „Drei Töpfe. Acht Fragen. Dann weißt du, wie du dein Geld aufteilst." Ein Button „Los geht's". Klein darunter: „Dauert zwei Minuten. Nichts wird gespeichert."
