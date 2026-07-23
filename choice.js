/*
  Auswahl-Aufgaben (Multiple Choice zur Selbstkontrolle).
  Pro .choice-Block ist die richtige Option in data-correct hinterlegt.
  Nach dem Anklicken: richtig/falsch + optionale Erklärung.
*/
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.choice').forEach(function (box) {
    var correct = box.dataset.correct;
    var fb   = box.querySelector('.feedback');
    var link = box.querySelector('.weg-link');
    var weg  = box.querySelector('.weg');
    var opts = box.querySelectorAll('.opt');
    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        opts.forEach(function (b) { b.classList.remove('sel'); });
        btn.classList.add('sel');
        if (btn.dataset.val === correct) { fb.textContent = '✓ Richtig'; fb.className = 'feedback ok'; }
        else { fb.textContent = '✗ Noch nicht richtig'; fb.className = 'feedback nein'; }
        if (link) link.style.display = 'inline-block';
      });
    });
    if (link && weg) link.addEventListener('click', function () {
      var v = (weg.style.display === 'none' || weg.style.display === '');
      weg.style.display = v ? 'block' : 'none';
      link.textContent = v ? 'Erklärung verbergen' : 'Erklärung anzeigen';
    });
  });
});
