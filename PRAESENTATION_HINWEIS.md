# Präsentations-Version (ohne Server)

Diese Version läuft komplett ohne `server.py` – alle Daten werden im Browser
selbst gespeichert (localStorage). Gedacht zum Vorführen/Präsentieren auf
einem Tablet oder PC, **nicht** für den echten Turnierbetrieb mit mehreren
Geräten (dafür die Server-Version mit `server.py` verwenden – nur die kann
Zuschauermonitor auf einem zweiten Gerät und mehrere gleichzeitige Nutzer).

## Verwendung

**Empfohlen – über eine echte Webadresse öffnen** (z. B. GitHub Pages, oder
irgendein simpler Webspace): Ordner dort hochladen, `index.html` im
Tablet-Browser aufrufen. Das ist der zuverlässigste Weg, weil manche
Browser (v. a. Safari auf iPad) Dateien, die per Doppeltipp direkt geöffnet
werden, mit gesondertem Speicher behandeln.

**Alternativ – direkt vom Tablet aus öffnen:** Ordner auf das Tablet
kopieren (z. B. über AirDrop, USB, Cloud-Speicher) und `index.html` im
Browser öffnen. Funktioniert für eine einzelne Vorführung in einem
durchgehenden Browser-Tab in der Regel einwandfrei; für dauerhaften Gebrauch
über mehrere Sitzungen hinweg ist die Webadressen-Variante zuverlässiger.

## Was fehlt gegenüber der Server-Version

- Kein Zuschauermonitor auf einem zweiten, separaten Gerät (die Tabelle
  aktualisiert sich nur innerhalb desselben Browsers/Tabs).
- Kein Zugriff von mehreren Geräten gleichzeitig auf dasselbe Turnier.
- Die Daten liegen im Browser-Speicher dieses einen Geräts, nicht in einer
  Datei, die man einfach kopieren könnte (kein `turnier.db`).

Alles andere (alle 6 Module, Gruppenmodus, mehrere Turniere anlegen/archivieren,
Excel Import/Export, PDF-Export, Wertungskarten) funktioniert identisch zur
Server-Version.
