STOCKSPORT · TURNIERSOFTWARE
Bedienungsanleitung
Turnierverwaltung für Stocksportvereine — Schritt für Schritt vom Einrichten bis zur fertigen Tabelle.
1. Einrichtung (einmalig)
Die Software läuft komplett auf dem eigenen PC oder Raspberry Pi, ohne Internetverbindung.
Voraussetzung: Python 3
●	Raspberry Pi: bereits vorinstalliert, nichts zu tun.
●	Windows: die mitgelieferte Python-Installationsdatei ausführen. Wichtig: beim Installieren das Häkchen bei „Add python.exe to PATH" setzen, danach den PC einmal neu starten.
●	Mac: in der Regel bereits vorinstalliert.
Starten
Einfach auf die Datei „Turnierverwaltung_starten" doppelklicken (.bat unter Windows, .sh unter Raspberry Pi/Linux/Mac). Der Browser öffnet sich danach automatisch mit der Turnierverwaltung. Ein Konsolenfenster bleibt im Hintergrund offen, solange die App läuft — das ist normal.
Für den täglichen Gebrauch empfiehlt sich eine Verknüpfung dieser Start-Datei auf dem Desktop.
2. Ein Turnier von Anfang bis Ende
 
Das Dashboard: alle sechs Schritte immer über die linke Navigation erreichbar.
Schritt 01 — Turniername
Grunddaten eintragen: Turniername, Örtlichkeit, Datum, Beginn, Anzahl der Mannschaften, Anzahl der Bahnen. Diese Angaben erscheinen später auf den Wertungskarten und im PDF-Export.
 
Grunddaten des Turniers, inklusive automatischer Rundenvorschau.
Schritt 02 — Mannschaften
Mannschaftsnamen und Spieler eintragen. Alternativ per Excel-Liste: zuerst „Leere Vorlage exportieren", ausfüllen, dann „Excel importieren".
 
Mannschaften und Spieler erfassen.
Schritt 03 — Turnierplan
Mit „Spielplan erstellen" wird automatisch verlost, wer gegen wen auf welcher Bahn spielt (jeder gegen jeden). Bei ungerader Mannschaftsanzahl hat pro Runde eine Mannschaft spielfrei.
Gruppenmodus: Bei mehr als 9 Mannschaften wird automatisch in zwei Gruppen gelost, inklusive Aufteilung der Bahnen auf beide Gruppen. Nach der Gruppenphase folgen automatisch Kreuzspiele, Halbfinale und Finale (siehe Schritt 06).
 
Automatisch erstellter Spielplan, Runde für Runde.
Schritt 04 — Wertungskarten
Wertungskarte gesamt: eine Karte pro Mannschaft mit allen ihren Spielen.
Wertungskarte einzeln: eine Karte pro Spiel, wird nach dem Spiel beim Wertungsrichter abgegeben. Gespielt wird auf 6 Kehren.
Schritt 05 — Ergebniseingabe
Stockpunkte je Spiel eintragen. Sieg (2 Punkte), Unentschieden (1 Punkt) und Niederlage (0 Punkte) sowie die Stockpunktdifferenz werden automatisch berechnet und übersichtlich angezeigt.
 
Ergebniseingabe mit automatischer Punkteberechnung und Differenz.
Schritt 06 — Tabelle
Zeigt die aktuelle Platzierung nach Punkten, bei Gleichstand entscheidet die Stockpunktdifferenz. Im Gruppenmodus werden beide Gruppentabellen angezeigt; sobald die Gruppenphase abgeschlossen ist, erscheinen automatisch die Buttons für Kreuzspiele, Halbfinale und Finale, am Ende die Gesamttabelle mit allen Mannschaften.
 
Tabelle mit automatischer Gold/Silber/Bronze-Platzierung.
●	Zuschauermonitor: öffnet die Tabelle in einem eigenen, sich automatisch aktualisierenden Fenster — ideal für einen zweiten Bildschirm.
●	PDF-Export: erstellt eine druckfertige Ergebnisliste inklusive Mannschaftsaufstellung.
3. Mehrere Turniere verwalten
Über „Neues Turnier starten" (oben links im Dashboard) lässt sich jederzeit ein neues, leeres Turnier anlegen — das vorherige bleibt vollständig erhalten und ist über „Frühere Turniere" wieder aufrufbar. So lassen sich z. B. mehrere Turniertage unabhängig voneinander verwalten, ohne dass Daten verloren gehen.
4. Datensicherung
Alle Turnierdaten liegen in der Datei „turnier.db" im Programmordner. Für ein Backup reicht es, diese eine Datei an einem sicheren Ort zu kopieren.
5. Häufige Fragen
„Keine Verbindung zum lokalen Server"? Die Turnierverwaltung läuft nur, während das Programm im Hintergrund aktiv ist. Start-Datei erneut ausführen — es geht dabei nichts verloren.
Zweites Gerät im selben Netzwerk nutzen? Auf dem zweiten Gerät im Browser die IP-Adresse des Servers aufrufen, z. B. http://192.168.1.50:8000.
Weitere Fragen? Die eingebaute Anleitung in der Software (Button „Anleitung" im Dashboard) enthält dieselben Informationen jederzeit griffbereit direkt am Bildschirm.

