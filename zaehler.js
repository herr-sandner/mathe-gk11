/*
  Einfacher Besuchszähler über den kostenlosen Dienst Abacus.
  - Gesamt: jede Ansicht der Startseite zählt +1.
  - Heute: pro Gerät nur einmal am Tag hochzählen (Merker im Browser).
  Fällt der Dienst aus, wird nichts angezeigt – die Seite bleibt unbeeinflusst.
  Hinweis: leichter, anonymer Zähler; keine Cookies, keine Namen. Nicht fälschungssicher.
*/
(function () {
  var NS   = "herr-sandner-mathegk11";
  var BASE = "https://abacus.jasoncameron.dev";
  function hit(key) { return fetch(BASE + "/hit/" + NS + "/" + key).then(function (r) { return r.json(); }); }
  function get(key) { return fetch(BASE + "/get/" + NS + "/" + key).then(function (r) { return r.json(); }); }

  function heuteKey() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var t = String(d.getDate()).padStart(2, "0");
    return "tag-" + d.getFullYear() + "-" + m + "-" + t;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var box     = document.getElementById("zaehler");
    var elGes   = document.getElementById("zaehler-gesamt");
    var elHeute = document.getElementById("zaehler-heute-text");

    hit("gesamt").then(function (d) {
      if (elGes) elGes.textContent = Number(d.value).toLocaleString("de-DE");
      if (box) box.style.display = "";
    }).catch(function () {});

    var tk = heuteKey(), flag = "gk11-" + tk, p;
    try {
      p = localStorage.getItem(flag)
        ? get(tk)
        : hit(tk).then(function (d) { try { localStorage.setItem(flag, "1"); } catch (e) {} return d; });
    } catch (e) { p = hit(tk); }

    p.then(function (d) {
      var n = Number(d.value);
      if (elHeute) elHeute.textContent = (n === 1)
        ? "Heute hat schon 1 Kursmitglied hier Mathe geübt."
        : "Heute haben schon " + n + " Kursmitglieder hier Mathe geübt.";
      if (box) box.style.display = "";
    }).catch(function () {});
  });
})();
