/*
  Selbstkontrolle für die .check-Blöcke.
  Erkennt ZWEI Antwort-Arten automatisch anhand von data-loesung:
   • Zahlen (auch mehrere, mit ; , oder Leerzeichen getrennt) -> Vergleich als Zahlenmenge.
   • Terme mit Variablen -> robuster Term-Vergleich:
        Leerzeichen egal · ³/² = ^3/^2 · ·/* egal · Reihenfolge der Summanden egal ·
        Reihenfolge der Variablen in einem Produkt egal (z. B. kz = zk).
  Hinweis: kein volles Computeralgebra-System – die Antwort sollte in der erwarteten
  Form stehen (z. B. ausmultipliziert bzw. ausgeklammert wie in der Aufgabe verlangt).
*/
document.addEventListener("DOMContentLoaded", function () {

  function canonRaw(s) {
    var map = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
    return (s || "").toLowerCase()
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, function (m) {
        return "^" + m.replace(/./g, function (c) { return map[c]; });
      })
      .replace(/[−–—]/g, "-")     // verschiedene Minuszeichen
      .replace(/[·*×∙]/g, "")     // Malzeichen entfernen
      .replace(/\s+/g, "");       // alle Leerzeichen entfernen
  }
  function splitSum(s) {
    var res = [], depth = 0, cur = "", i, c;
    for (i = 0; i < s.length; i++) {
      c = s[i];
      if (c === "(") depth++; else if (c === ")") depth--;
      if ((c === "+" || c === "-") && depth === 0 && i > 0) { res.push(cur); cur = c; }
      else cur += c;
    }
    if (cur) res.push(cur);
    return res.map(function (t) { return (t[0] === "+" || t[0] === "-") ? t : "+" + t; });
  }
  function normMonom(term) {
    var sign = term[0], body = term.slice(1);
    if (body.indexOf("(") >= 0 || body.indexOf("/") >= 0) return sign + body;
    var m = body.match(/^(\d+(?:\.\d+)?)?(.*)$/);
    var coeff = m[1] || "", rest = m[2] || "";
    var re = /([a-z])(\^\d+)?/g, g, groups = [], consumed = "";
    while ((g = re.exec(rest)) !== null) { groups.push(g[1] + (g[2] || "")); consumed += g[0]; }
    if (consumed !== rest) return sign + body;
    groups.sort();
    if (coeff === "1" && groups.length) coeff = "";
    return sign + coeff + groups.join("");
  }
  function canonExpr(s) {
    s = canonRaw(s); if (!s) return "";
    var t = splitSum(s).map(normMonom); t.sort(); return t.join("");
  }
  function numSet(str) {
    var s = (str || "").toLowerCase()
      .replace(/x\s*_?\d*\s*=/g, " ").replace(/[a-zäöüß]/g, " ")
      .replace(/[;,]/g, " ").replace(/−/g, "-");
    var arr = s.split(/\s+/).filter(Boolean).map(Number).filter(function (n) { return !isNaN(n); });
    return arr.map(function (n) { return Math.round(n * 1e6) / 1e6; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; })
      .sort(function (a, b) { return a - b; }).join("|");
  }
  function istAusdruck(soll) { return /[a-z]/i.test(soll) && soll.indexOf(";") < 0; }
  function passt(eingabe, soll) {
    return istAusdruck(soll) ? canonExpr(eingabe) === canonExpr(soll)
                             : numSet(eingabe) === numSet(soll);
  }

  document.querySelectorAll(".check").forEach(function (box) {
    var soll = box.dataset.loesung;
    var btn  = box.querySelector(".pruefen");
    var inp  = box.querySelector(".antwort");
    var fb   = box.querySelector(".feedback");
    var link = box.querySelector(".weg-link");
    var weg  = box.querySelector(".weg");
    function pruefe() {
      if (!inp.value.trim()) { fb.textContent = "Bitte etwas eingeben."; fb.className = "feedback"; return; }
      if (passt(inp.value, soll)) { fb.textContent = "✓ Richtig"; fb.className = "feedback ok"; }
      else { fb.textContent = "✗ Noch nicht richtig"; fb.className = "feedback nein"; }
      if (link) link.style.display = "inline-block";
    }
    if (btn) btn.addEventListener("click", pruefe);
    if (inp) inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); pruefe(); }
    });
    if (link && weg) link.addEventListener("click", function () {
      var v = (weg.style.display === "none" || weg.style.display === "");
      weg.style.display = v ? "block" : "none";
      link.textContent = v ? "Lösungsweg verbergen" : "Lösungsweg anzeigen";
    });
  });
});
