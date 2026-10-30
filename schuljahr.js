/*
  Zentrale Daten für alle Wochenseiten.
  Für ein NEUES Schuljahr: Startmontag + FERIEN-Liste anpassen.
  Format: JJJJ-MM-TT. Ferien jeweils [erster Ferientag, letzter Ferientag].
  Quelle: MBJS Brandenburg, VV Schulbetrieb Anlage 1
*/
const SCHULJAHR_START_MONTAG = "2026-08-24";

const FERIEN = [
  ["2026-10-19", "2026-10-30"], // Herbstferien
  ["2026-12-23", "2027-01-02"], // Weihnachtsferien
  ["2027-02-01", "2027-02-06"], // Winterferien
  ["2027-03-22", "2027-04-03"], // Osterferien
  ["2027-07-01", "2027-08-14"], // Sommerferien
];

/* Datum -> "JJJJ-MM-TT" in lokaler Zeit (toISOString würde UTC nehmen und um einen Tag verrutschen) */
function isoDatum(d){
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function istFerientag(d){
  const s = isoDatum(d);
  return FERIEN.some(([von, bis]) => s >= von && s <= bis);
}

/* Liegt zwischen Montag und Freitag mindestens ein Tag, der nicht in den Ferien liegt? */
function istSchulwoche(montag){
  for (let i = 0; i < 5; i++){
    const tag = new Date(montag);
    tag.setDate(tag.getDate() + i);
    if (!istFerientag(tag)) return true;
  }
  return false;
}

/* Montag der n-ten Schulwoche (Ferienwochen werden übersprungen) */
function montagDerSchulwoche(wocheNr){
  const d = new Date(SCHULJAHR_START_MONTAG + "T00:00:00");
  let zaehler = 0;
  for (let i = 0; i < 60; i++){            // Schutz gegen Endlosschleife
    if (istSchulwoche(d) && ++zaehler === wocheNr) return d;
    d.setDate(d.getDate() + 7);
  }
  return null;
}

/* Schreibt das Ausgabedatum (Montag der jeweiligen Schulwoche) in alle Elemente mit data-datum. */
function schreibeDatum(wocheNr){
  const montag = montagDerSchulwoche(wocheNr);
  const txt = montag
    ? montag.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
    : "";
  document.querySelectorAll("[data-datum]").forEach(el => el.textContent = txt);
}
