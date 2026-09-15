// ============================================================
// turnier.js – gemeinsames Datenmodell & Logik für die
// Turnierverwaltung. Wird von allen Seiten per <script> eingebunden.
//
// PRÄSENTATIONS-VERSION: Speicherung über localStorage im Browser,
// KEIN Server nötig - läuft direkt vom Tablet/PC aus, ideal zum
// Vorführen. Für den echten Turnierbetrieb (mehrere Geräte,
// Zuschauermonitor auf einem zweiten Gerät) die Server-Version mit
// server.py verwenden, die dieselben Daten über alle Geräte hinweg
// synchron hält - das kann diese Version bauartbedingt nicht.
//
// Alle Funktionsnamen sind absichtlich identisch zur Server-Version,
// damit keine der anderen Dateien (01-07, index.html) geändert
// werden muss.
//
// Datenstruktur (gespeichertes JSON, pro Turnier):
// {
//   stammdaten:  { turniername, ort, datum, beginn, anzahlMannschaften, anzahlBahnen },
//   mannschaften: [ { id, name, spieler: [name, ...] } ],
//   spielplan:    [ { id, runde, durchgang, bahn, teamA, teamB } ],
//   ergebnisse:   { [spielId]: { stockA, stockB, punkteA, punkteB, statusA, statusB } }
// }
// ============================================================

const TV_LISTE_KEY = 'tv_praesentation_liste';   // [{ id, erstellt_am }]
const TV_AKTIV_KEY = 'tv_praesentation_aktiv_id';

function tvSchluessel(id) {
    return 'tv_praesentation_turnier_' + id;
}

function tvZeigeVerbindungsfehler() {
    tvToast('⚠️ Speichern nicht möglich. Läuft der Browser im privaten/inkognito-Modus, oder ist der Speicher voll?', 'error');
}

// Stellt sicher, dass immer ein aktives Turnier existiert - legt beim
// allerersten Aufruf automatisch eines an.
async function tvSicherstellenAktivesTurnier() {
    let aktivId = localStorage.getItem(TV_AKTIV_KEY);
    if (aktivId && localStorage.getItem(tvSchluessel(aktivId)) !== null) {
        return aktivId;
    }
    const ergebnis = await tvNeuesTurnier();
    return ergebnis ? String(ergebnis.id) : null;
}

// Liest den aktuellen Gesamtstand des aktiven Turniers.
// Gibt im Fehlerfall ein leeres Objekt zurück - die Seite bleibt
// dadurch immer bedienbar.
async function tvLoad() {
    try {
        const aktivId = await tvSicherstellenAktivesTurnier();
        if (!aktivId) return {};
        const raw = localStorage.getItem(tvSchluessel(aktivId));
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        tvZeigeVerbindungsfehler();
        return {};
    }
}

// Schreibt eine Teil-Aktualisierung (führt sie mit dem aktuellen
// Stand zusammen, damit nichts überschrieben wird).
async function tvSave(teilUpdate) {
    try {
        const aktivId = await tvSicherstellenAktivesTurnier();
        if (!aktivId) throw new Error('Kein aktives Turnier');
        const aktuell = await tvLoad();
        const neu = Object.assign({}, aktuell, teilUpdate);
        localStorage.setItem(tvSchluessel(aktivId), JSON.stringify(neu));
        return neu;
    } catch (e) {
        tvZeigeVerbindungsfehler();
        return null;
    }
}

// Liste aller gespeicherten Turniere (Archiv), neueste zuerst.
async function tvListeTurniere() {
    try {
        const liste = JSON.parse(localStorage.getItem(TV_LISTE_KEY) || '[]');
        const aktivId = localStorage.getItem(TV_AKTIV_KEY);
        return liste
            .map(eintrag => {
                const raw = localStorage.getItem(tvSchluessel(eintrag.id));
                const daten = raw ? JSON.parse(raw) : {};
                const s = daten.stammdaten || {};
                return {
                    id: eintrag.id,
                    turniername: s.turniername || '(ohne Namen)',
                    ort: s.ort || '',
                    datum: s.datum || '',
                    erstellt_am: eintrag.erstellt_am,
                    aktiv: String(eintrag.id) === String(aktivId)
                };
            })
            .sort((a, b) => Number(b.id) - Number(a.id));
    } catch (e) {
        tvZeigeVerbindungsfehler();
        return [];
    }
}

// Legt ein neues, leeres Turnier an und macht es zum aktiven Turnier.
// Bestehende Turniere bleiben im Archiv (localStorage) erhalten.
async function tvNeuesTurnier() {
    try {
        const liste = JSON.parse(localStorage.getItem(TV_LISTE_KEY) || '[]');
        const neueId = liste.reduce((max, e) => Math.max(max, Number(e.id)), 0) + 1;
        liste.push({ id: neueId, erstellt_am: new Date().toISOString() });
        localStorage.setItem(TV_LISTE_KEY, JSON.stringify(liste));
        localStorage.setItem(tvSchluessel(neueId), '{}');
        localStorage.setItem(TV_AKTIV_KEY, String(neueId));
        return { ok: true, id: neueId };
    } catch (e) {
        tvZeigeVerbindungsfehler();
        return null;
    }
}

// Schaltet ein bestehendes Turnier (z. B. aus dem Archiv) wieder aktiv.
async function tvTurnierAktivieren(id) {
    try {
        if (localStorage.getItem(tvSchluessel(id)) === null) {
            throw new Error('Turnier nicht gefunden');
        }
        localStorage.setItem(TV_AKTIV_KEY, String(id));
        return true;
    } catch (e) {
        tvZeigeVerbindungsfehler();
        return false;
    }
}

// Löscht ein Turnier endgültig aus dem Archiv (localStorage).
async function tvTurnierLoeschen(id) {
    try {
        let liste = JSON.parse(localStorage.getItem(TV_LISTE_KEY) || '[]');
        liste = liste.filter(e => String(e.id) !== String(id));
        localStorage.setItem(TV_LISTE_KEY, JSON.stringify(liste));
        localStorage.removeItem(tvSchluessel(id));

        const aktivId = localStorage.getItem(TV_AKTIV_KEY);
        if (String(aktivId) === String(id)) {
            if (liste.length > 0) {
                localStorage.setItem(TV_AKTIV_KEY, String(liste[liste.length - 1].id));
            } else {
                await tvNeuesTurnier();
            }
        }
        return true;
    } catch (e) {
        tvZeigeVerbindungsfehler();
        return false;
    }
}

function tvTeamName(teams, id) {
    const t = teams.find(x => x.id === id);
    return t ? t.name : '(unbekannt)';
}

// Wenn eine Modul-Seite eingebettet im Dashboard läuft (index.html lädt sie
// in einem iframe), ist der Seiten-eigene "Zurück zum Dashboard"-Link
// überflüssig - die rechte Modul-Auswahl im Dashboard bleibt ja ohnehin
// sichtbar. Ohne dieses Ausblenden würde ein Klick darauf das Dashboard
// ein zweites Mal innerhalb des iframes laden.
if (window.top !== window.self) {
    document.addEventListener('DOMContentLoaded', () => {
        const back = document.querySelector('.topbar .back');
        if (back) back.style.display = 'none';
    });
}

// ------------------------------------------------------------
// Toast-Benachrichtigung (erwartet <div class="toast" id="toast"></div>)
// ------------------------------------------------------------
function tvToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) { console.log(message); return; }
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type === 'success' ? 'success' : type === 'error' ? 'error' : 'info');
    setTimeout(() => toast.classList.add('show'), 10);
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ------------------------------------------------------------
// Live-Vorschau für Modul 01: Runden, Spiele pro Runde, Durchgänge
// ------------------------------------------------------------
function tvBerechneVorschau(n, bahnen) {
    if (!n || n < 2) return null;
    const hatFreilos = (n % 2 !== 0);
    const effektiv = hatFreilos ? n + 1 : n;
    const runden = effektiv - 1;
    const spielProRunde = effektiv / 2 - (hatFreilos ? 1 : 0);
    let durchgaengeProRunde = 1;
    if (bahnen && bahnen > 0) durchgaengeProRunde = Math.ceil(spielProRunde / bahnen);
    return { runden, spielProRunde, hatFreilos, durchgaengeProRunde };
}

// ------------------------------------------------------------
// Modul 03: Round-Robin nach der Circle-Method + Bahnenzuteilung
// ------------------------------------------------------------
function tvErstelleRundenplan(teams) {
    const arr = teams.slice();
    const hatFreilos = arr.length % 2 !== 0;
    if (hatFreilos) arr.push(null); // Freilos-Platzhalter
    const total = arr.length;
    const rounds = total - 1;
    const half = total / 2;
    const runden = [];
    let rotierend = arr.slice();
    for (let r = 0; r < rounds; r++) {
        const paare = [];
        for (let i = 0; i < half; i++) {
            const a = rotierend[i];
            const b = rotierend[total - 1 - i];
            if (a && b) paare.push([a, b]);
        }
        runden.push(paare);
        const fix = rotierend[0];
        const rest = rotierend.slice(1);
        rest.unshift(rest.pop());
        rotierend = [fix, ...rest];
    }
    return { runden, hatFreilos };
}

// Verteilt die Paarungen einer Runde auf die Bahnen. Reichen die Bahnen
// nicht für alle Spiele einer Runde, entstehen mehrere Durchgänge.
// Die Bahn-Zuordnung rotiert über die Runden, damit sich die
// Bahnennutzung pro Mannschaft über das Turnier gleichmäßig verteilt.
function tvVerteileAufBahnen(runden, bahnenCount) {
    const spiele = [];
    let laufendeId = 1;
    runden.forEach((paare, rIdx) => {
        paare.forEach((paar, pIdx) => {
            const slot = (pIdx + rIdx) % bahnenCount;
            const durchgang = Math.floor(pIdx / bahnenCount) + 1;
            spiele.push({
                id: 'sp' + (laufendeId++),
                runde: rIdx + 1,
                durchgang,
                bahn: slot + 1,
                teamA: paar[0].id,
                teamB: paar[1].id
            });
        });
    });
    return spiele;
}

// ------------------------------------------------------------
// Modul 05: Sieg 2 Punkte, Unentschieden 1 Punkt, Niederlage 0 Punkte
// ------------------------------------------------------------
function tvBerechneErgebnis(stockA, stockB) {
    if (stockA === '' || stockB === '' || stockA === null || stockB === null || isNaN(stockA) || isNaN(stockB)) {
        return null;
    }
    stockA = Number(stockA); stockB = Number(stockB);
    if (stockA > stockB) return { punkteA: 2, punkteB: 0, statusA: 'sieg', statusB: 'niederlage' };
    if (stockA < stockB) return { punkteA: 0, punkteB: 2, statusA: 'niederlage', statusB: 'sieg' };
    return { punkteA: 1, punkteB: 1, statusA: 'unentschieden', statusB: 'unentschieden' };
}

function tvBadgeHtml(status) {
    const labels = { sieg: 'Sieg', unentschieden: 'Unentschieden', niederlage: 'Niederlage', offen: 'offen' };
    return `<span class="badge ${status}">${labels[status]}</span>`;
}

// ------------------------------------------------------------
// Modul 06: Tabelle – Punkte, dann Stockpunktdifferenz, dann eigene
// Stockpunkte als Tiebreak.
// ------------------------------------------------------------
function tvBerechneTabelle(daten) {
    const teams = daten.mannschaften || [];
    const spielplan = daten.spielplan || [];
    const ergebnisse = daten.ergebnisse || {};

    const stats = {};
    teams.forEach(team => {
        stats[team.id] = { id: team.id, name: team.name, punkte: 0, stockEigen: 0, stockFremd: 0, spiele: 0 };
    });

    spielplan.forEach(spiel => {
        const erg = ergebnisse[spiel.id];
        if (!erg || erg.punkteA === undefined) return;
        if (stats[spiel.teamA]) {
            stats[spiel.teamA].punkte += erg.punkteA;
            stats[spiel.teamA].stockEigen += Number(erg.stockA) || 0;
            stats[spiel.teamA].stockFremd += Number(erg.stockB) || 0;
            stats[spiel.teamA].spiele += 1;
        }
        if (stats[spiel.teamB]) {
            stats[spiel.teamB].punkte += erg.punkteB;
            stats[spiel.teamB].stockEigen += Number(erg.stockB) || 0;
            stats[spiel.teamB].stockFremd += Number(erg.stockA) || 0;
            stats[spiel.teamB].spiele += 1;
        }
    });

    const liste = Object.values(stats).map(s => ({ ...s, diff: s.stockEigen - s.stockFremd }));
    liste.sort((a, b) => b.punkte - a.punkte || b.diff - a.diff || b.stockEigen - a.stockEigen);
    return liste;
}

function tvRankBadge(rang) {
    if (rang === 1) return `<span class="rank-badge rank-1">🥇</span>`;
    if (rang === 2) return `<span class="rank-badge rank-2">🥈</span>`;
    if (rang === 3) return `<span class="rank-badge rank-3">🥉</span>`;
    return `<span class="rank-badge">${rang}</span>`;
}

// ============================================================
// Gruppenmodus (mehr als 9 Mannschaften): 2 Gruppen per Zufallslosung,
// danach Kreuzspiele (Plätze 1-4 je Gruppe), Halbfinale und Finale.
// ============================================================

function tvGruppenmodusAktiv(anzahlMannschaften) {
    return !!anzahlMannschaften && anzahlMannschaften > 9;
}

function tvMischeZufaellig(liste) {
    const arr = liste.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Teilt die Mannschaften per Zufallslosung in 2 möglichst gleich
// große Gruppen (bei ungerader Anzahl bekommt Gruppe 1 eine mehr).
function tvTeileInGruppen(teams) {
    const gemischt = tvMischeZufaellig(teams);
    const groesseGr1 = Math.ceil(gemischt.length / 2);
    return {
        gruppe1: gemischt.slice(0, groesseGr1),
        gruppe2: gemischt.slice(groesseGr1)
    };
}

// Teilt die verfügbaren Bahnen auf beide Gruppen auf, damit beide
// Gruppen gleichzeitig auf unterschiedlichen Bahnen spielen können.
function tvTeileBahnen(anzahlBahnen) {
    const bahnenGr1 = Math.ceil(anzahlBahnen / 2);
    return { bahnenGr1, bahnenGr2: anzahlBahnen - bahnenGr1 };
}

// Ermittelt die Sieger-Team-ID eines Spiels, oder null, wenn das
// Ergebnis noch fehlt oder (bei K.o.-Spielen unerwünscht) unentschieden ist.
function tvSiegerId(spiel, ergebnisse) {
    const erg = ergebnisse[spiel.id];
    if (!erg || !erg.statusA) return null;
    if (erg.statusA === 'unentschieden') return null;
    return erg.statusA === 'sieg' ? spiel.teamA : spiel.teamB;
}

// Erstellt die 4 Kreuzspiele (Viertelfinale) aus den Plätzen 1-4 je
// Gruppe: 1.Gr1-4.Gr2, 2.Gr1-3.Gr2, 1.Gr2-4.Gr1, 2.Gr2-3.Gr1.
function tvErstelleKreuzspiele(tabelleGr1, tabelleGr2, anzahlBahnen) {
    const paarungen = [
        { bezeichnung: 'Kreuzspiel 1 (1. Gr.1 – 4. Gr.2)', teamA: tabelleGr1[0].id, teamB: tabelleGr2[3].id },
        { bezeichnung: 'Kreuzspiel 2 (2. Gr.1 – 3. Gr.2)', teamA: tabelleGr1[1].id, teamB: tabelleGr2[2].id },
        { bezeichnung: 'Kreuzspiel 3 (1. Gr.2 – 4. Gr.1)', teamA: tabelleGr2[0].id, teamB: tabelleGr1[3].id },
        { bezeichnung: 'Kreuzspiel 4 (2. Gr.2 – 3. Gr.1)', teamA: tabelleGr2[1].id, teamB: tabelleGr1[2].id }
    ];
    return paarungen.map((p, i) => ({
        id: 'ks' + (i + 1),
        phase: 'kreuzspiel',
        bahn: anzahlBahnen ? (i % anzahlBahnen) + 1 : i + 1,
        ...p
    }));
}

// Halbfinale: Sieger Kreuzspiel1+2 gegeneinander, Sieger Kreuzspiel3+4 gegeneinander.
function tvErstelleHalbfinale(kreuzspiele, ergebnisse, anzahlBahnen) {
    const sieger = kreuzspiele.map(s => tvSiegerId(s, ergebnisse));
    if (sieger.some(s => !s)) return null; // noch nicht alle Kreuzspiele fertig
    return [
        { id: 'hf1', phase: 'halbfinale', bezeichnung: 'Halbfinale 1', bahn: 1, teamA: sieger[0], teamB: sieger[1] },
        { id: 'hf2', phase: 'halbfinale', bezeichnung: 'Halbfinale 2', bahn: anzahlBahnen > 1 ? 2 : 1, teamA: sieger[2], teamB: sieger[3] }
    ];
}

// Finale: Sieger der beiden Halbfinale gegeneinander.
function tvErstelleFinale(halbfinale, ergebnisse) {
    const sieger = halbfinale.map(s => tvSiegerId(s, ergebnisse));
    if (sieger.some(s => !s)) return null;
    return [{ id: 'fin1', phase: 'finale', bezeichnung: 'Finale', bahn: 1, teamA: sieger[0], teamB: sieger[1] }];
}

// Gesamttabelle nach Turnierende: 1./2. aus dem Finale, 3./4. die
// Halbfinale-Verlierer, 5.-8. die Kreuzspiel-Verlierer, der Rest nach
// Gruppenphase (Punkte/Differenz). Tiebreaks innerhalb derselben Stufe
// laufen über die Gruppenphasen-Statistik.
function tvBerechneGesamttabelle(daten) {
    const spielplan = daten.spielplan || [];
    const ergebnisse = daten.ergebnisse || {};
    const gruppenTabelle = tvBerechneTabelle({ ...daten, spielplan: spielplan.filter(s => s.phase === 'gruppe' || !s.phase) });
    const statsById = {};
    gruppenTabelle.forEach(s => { statsById[s.id] = s; });

    const kreuzspiele = spielplan.filter(s => s.phase === 'kreuzspiel');
    const halbfinale = spielplan.filter(s => s.phase === 'halbfinale');
    const finale = spielplan.filter(s => s.phase === 'finale');

    const platzierte = new Set();
    const ergebnisListe = [];

    if (finale.length && tvSiegerId(finale[0], ergebnisse)) {
        const siegerId = tvSiegerId(finale[0], ergebnisse);
        const zweiterId = siegerId === finale[0].teamA ? finale[0].teamB : finale[0].teamA;
        [siegerId, zweiterId].forEach((id, i) => {
            ergebnisListe.push({ ...statsById[id], id, platz: i + 1 });
            platzierte.add(id);
        });
    }

    if (halbfinale.length) {
        const verlierer = halbfinale
            .map(s => {
                const sieger = tvSiegerId(s, ergebnisse);
                if (!sieger) return null;
                return sieger === s.teamA ? s.teamB : s.teamA;
            })
            .filter(id => id && !platzierte.has(id));
        verlierer
            .sort((a, b) => (statsById[b]?.punkte ?? 0) - (statsById[a]?.punkte ?? 0) || (statsById[b]?.diff ?? 0) - (statsById[a]?.diff ?? 0))
            .forEach(id => { ergebnisListe.push({ ...statsById[id], id, platz: 3 }); platzierte.add(id); });
    }

    if (kreuzspiele.length) {
        const verlierer = kreuzspiele
            .map(s => {
                const sieger = tvSiegerId(s, ergebnisse);
                if (!sieger) return null;
                return sieger === s.teamA ? s.teamB : s.teamA;
            })
            .filter(id => id && !platzierte.has(id));
        verlierer
            .sort((a, b) => (statsById[b]?.punkte ?? 0) - (statsById[a]?.punkte ?? 0) || (statsById[b]?.diff ?? 0) - (statsById[a]?.diff ?? 0))
            .forEach(id => { ergebnisListe.push({ ...statsById[id], id, platz: 5 }); platzierte.add(id); });
    }

    const rest = gruppenTabelle.filter(s => !platzierte.has(s.id));
    rest.forEach(s => ergebnisListe.push({ ...s, platz: null }));

    // Fortlaufende Platznummern für die "Rest"-Gruppe, startend nach der
    // höchsten bereits vergebenen Platzierung.
    let naechsterPlatz = ergebnisListe.filter(s => s.platz !== null).length + 1;
    ergebnisListe.forEach(s => { if (s.platz === null) s.platz = naechsterPlatz++; });

    return ergebnisListe;
}
