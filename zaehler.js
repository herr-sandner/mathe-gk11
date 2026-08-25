/*
  Besuchszähler über den kostenlosen Dienst Abacus – zählt VERSCHIEDENE Geräte.
  - Insgesamt:  pro Gerät nur EINMAL überhaupt (dauerhafter Merker).
  - Diese Woche: pro Gerät einmal pro Woche (Merker mit Wochen-Montag).
  - Heute:      pro Gerät einmal pro Tag (Merker mit Datum).
  Die Zahlen liegen auf dem Abacus-Server und sind unabhängig von den Dateien:
  Änderungen an der Website setzen NICHTS zurück. Nur ein anderer Schlüssel-Name
  (unten in den einmal(...)-Aufrufen) würde bei 0 neu starten.
  Fällt der Dienst aus, wird nichts angezeigt. „Gerät" = Browser-Profil.
*/
(function () {
  var NS   = "herr-sandner-mathegk11";
  var BASE = "https://abacus.jasoncameron.dev";
  function hit(key) { return fetch(BASE + "/hit/" + NS + "/" + key).then(function (r) { return r.json(); }); }
  function get(key) { return fetch(BASE + "/get/" + NS + "/" + key).then(function (r) { return r.json(); }); }

  // Zählt für 'key' nur beim ersten Mal, solange 'flag' im Browser nicht gesetzt ist.
  function einmal(key, flag) {
    try {
      if (localStorage.getItem(flag)) return get(key);
      return hit(key).then(function (d) { try { localStorage.setItem(flag, "1"); } catch (e) {} return d; });
    } catch (e) { return hit(key); }
  }

  function ymd(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var t = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + t;
  }
  function heuteKey() { return "tag-" + ymd(new Date()); }
  function wocheKey() {                       // Montag der aktuellen Woche
    var d = new Date();
    var tag = (d.getDay() + 6) % 7;           // Mo=0 … So=6
    d.setDate(d.getDate() - tag);
    return "woche-" + ymd(d);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var box     = document.getElementById("zaehler");
    var elGes    = document.getElementById("zaehler-gesamt-text");
    var elWoche  = document.getElementById("zaehler-woche-text");
    var elHeute  = document.getElementById("zaehler-heute-text");
    function zeig() { if (box) box.style.display = ""; }

    einmal("geraete", "gk11-geraet").then(function (d) {
      var n = Number(d.value);
      if (elGes) elGes.textContent = (n === 1)
        ? "Insgesamt schon von 1 Gerät genutzt."
        : "Insgesamt schon von " + n.toLocaleString("de-DE") + " verschiedenen Geräten genutzt.";
      zeig();
    }).catch(function () {});

    var wk = wocheKey();
    einmal(wk, "gk11-" + wk).then(function (d) {
      var n = Number(d.value);
      if (elWoche) elWoche.textContent = (n === 1)
        ? "Diese Woche hat schon 1 Kursmitglied geübt."
        : "Diese Woche haben schon " + n + " Kursmitglieder geübt.";
      zeig();
    }).catch(function () {});

    var tk = heuteKey();
    einmal(tk, "gk11-" + tk).then(function (d) {
      var n = Number(d.value);
      if (elHeute) elHeute.textContent = (n === 1)
        ? "Heute hat schon 1 Kursmitglied hier Mathe geübt."
        : "Heute haben schon " + n + " Kursmitglieder hier Mathe geübt.";
      zeig();
    }).catch(function () {});
  });
})();
