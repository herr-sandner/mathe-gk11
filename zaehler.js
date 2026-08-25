/*
  Besuchszähler über den kostenlosen Dienst Abacus.
  - Gesamt:      Seitenaufrufe (jede Ansicht zählt +1).
  - Diese Woche: pro Gerät einmal pro Woche (Montag als Kennung), unabhängig vom Tag.
  - Heute:       pro Gerät einmal pro Tag.
  Anfragen laufen NACHEINANDER (nicht parallel), damit der Dienst nichts wegen
  Rate-Limit abweist. Fällt etwas aus, wird der betroffene Teil einfach nicht gezeigt.
  Die Zahlen liegen serverseitig; Änderungen an der Website setzen nichts zurück.
*/
(function () {
  var NS   = "herr-sandner-mathegk11";
  var BASE = "https://abacus.jasoncameron.dev";

  async function call(path) {
    var r = await fetch(BASE + path);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  }
  function hit(key) { return call("/hit/" + NS + "/" + key); }
  function get(key) { return call("/get/" + NS + "/" + key); }

  async function einmal(key, flag) {           // zählt nur beim ersten Mal (pro flag)
    try { if (localStorage.getItem(flag)) return await get(key); } catch (e) {}
    var d = await hit(key);
    try { localStorage.setItem(flag, "1"); } catch (e) {}
    return d;
  }
  function ymd(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var t = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + t;
  }
  function heuteKey() { return "tag-" + ymd(new Date()); }
  function wocheKey() {
    var d = new Date(); var tag = (d.getDay() + 6) % 7;   // Mo=0 … So=6
    d.setDate(d.getDate() - tag); return "woche-" + ymd(d);
  }

  document.addEventListener("DOMContentLoaded", async function () {
    var box     = document.getElementById("zaehler");
    var elGes    = document.getElementById("zaehler-gesamt-text");
    var elWoche  = document.getElementById("zaehler-woche-text");
    var elHeute  = document.getElementById("zaehler-heute-text");
    function zeig() { if (box) box.style.display = ""; }

    // 1) Heute
    try {
      var tk = heuteKey();
      var h = Number((await einmal(tk, "gk11-" + tk)).value);
      if (elHeute) elHeute.textContent = (h === 1)
        ? "Heute hat schon 1 Kursmitglied hier Mathe geübt."
        : "Heute haben schon " + h + " Kursmitglieder hier Mathe geübt.";
      zeig();
    } catch (e) {}

    // 2) Diese Woche (eigener Merker, unabhängig vom Tag)
    try {
      var wk = wocheKey();
      var w = Number((await einmal(wk, "gk11-" + wk)).value);
      if (elWoche) elWoche.textContent = (w === 1)
        ? "Diese Woche hat schon 1 Kursmitglied geübt."
        : "Diese Woche haben schon " + w + " Kursmitglieder geübt.";
      zeig();
    } catch (e) {}

    // 3) Gesamt – Seitenaufrufe (jede Ansicht zählt)
    try {
      var g = Number((await hit("aufrufe")).value);
      if (elGes) elGes.textContent = "Seitenaufrufe insgesamt: " + g.toLocaleString("de-DE");
      zeig();
    } catch (e) {}
  });
})();
