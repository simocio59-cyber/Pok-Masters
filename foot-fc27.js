// ===== foot-fc27.js — Notes officielles EA SPORTS FC 27 (FootMasters) =====
// A charger APRES foot-data.js et AVANT foot-jeu.js
(function () {
  'use strict';
  var VERSION = 'fc27-1';

  // Format : Nom[/autre ecriture]|Poste (GK/DF/MF/FW)|Note FC 27|Club
  var FC27 = [
    // ---------- Top mondial ----------
    'Kylian Mbappé|FW|91|Real Madrid',
    'Erling Haaland|FW|91|Manchester City',
    'Rodri|MF|90|FC Barcelona',
    'Ousmane Dembélé|FW|90|Paris Saint-Germain',
    'Vitinha|MF|90|Paris Saint-Germain',
    'Harry Kane|FW|90|Bayern',
    'Michael Olise|FW|90|Bayern',
    'Pedri|MF|90|FC Barcelona',
    'Lamine Yamal|FW|90|FC Barcelona',
    'Thibaut Courtois|GK|90|Real Madrid',
    'Jude Bellingham|MF|90|Real Madrid',
    'Gabriel Magalhães/Gabriel|DF|89|Arsenal',
    'Gianluigi Donnarumma|GK|89|Manchester City',
    'Bruno Fernandes|MF|89|Manchester United',
    'Khvicha Kvaratskhelia|FW|89|Paris Saint-Germain',
    'Nuno Mendes|DF|89|Paris Saint-Germain',
    'Willian Pacho|DF|89|Paris Saint-Germain',
    'Lionel Messi|FW|89|Inter Miami',
    'Vinícius Júnior/Vinícius Jr.|FW|89|Real Madrid',
    'Jan Oblak|GK|88|Atlético Madrid',
    'Declan Rice|MF|88|Arsenal',
    'William Saliba|DF|88|Arsenal',
    'Virgil van Dijk|DF|88|Liverpool',
    'Achraf Hakimi|DF|88|Paris Saint-Germain',
    'João Neves|MF|88|Paris Saint-Germain',
    'Joshua Kimmich|MF|88|Bayern',
    'Luis Díaz|FW|88|Bayern',
    'Raphinha|FW|88|FC Barcelona',
    // ---------- Ligue 1 ----------
    'Marquinhos|DF|87|Paris Saint-Germain',
    'Fabián Ruiz|MF|86|Paris Saint-Germain',
    'Désiré Doué|FW|86|Paris Saint-Germain',
    'Bradley Barcola|FW|85|Paris Saint-Germain',
    'Ferran Torres|FW|84|Paris Saint-Germain',
    'Matvey Safonov|GK|83|Paris Saint-Germain',
    'Warren Zaïre-Emery|MF|83|Paris Saint-Germain',
    'Florian Thauvin|FW|82|RC Lens',
    'Corentin Tolisso|MF|82|Lyonnais',
    'Denis Zakaria|MF|81|Monaco',
    'Matthieu Udol|DF|81|RC Lens',
    'Adrien Thomasson|MF|81|RC Lens',
    'Brice Samba|GK|81|Rennais',
    'Robin Risser|GK|81|RC Lens',
    'Lucas Hernández|DF|81|Paris Saint-Germain',
    'Dominik Greif|GK|81|Lyonnais',
    'Maghnes Akliouche|MF|81|Paris Saint-Germain',
    'Amine Gouiri|FW|80|Marseille',
    'Jonathan Clauss|DF|77|OGC Nice',
    // ---------- Premier League ----------
    'David Raya|GK|88|Arsenal',
    'Alisson/Alisson Becker|GK|87|Liverpool',
    'Rúben Dias|DF|87|Manchester City',
    'Bukayo Saka|FW|87|Arsenal',
    'Dominik Szoboszlai|MF|86|Liverpool',
    'Alexander Isak|FW|86|Liverpool',
    'Martin Ødegaard|MF|86|Arsenal',
    'Viktor Gyökeres|FW|86|Arsenal',
    'Florian Wirtz|MF|86|Liverpool',
    'Enzo Fernández|MF|86|Chelsea',
    'Rayan Cherki|MF|86|Manchester City',
    'Moisés Caicedo|MF|86|Chelsea',
    'Bruno Guimarães|MF|86|Newcastle',
    'Granit Xhaka|MF|85|Sunderland',
    'Sandro Tonali|MF|85|Tottenham',
    'Youri Tielemans|MF|85|Manchester United',
    'Antoine Semenyo|FW|85|Manchester City',
    'Jordan Pickford|GK|85|Everton',
    'Cole Palmer|MF|85|Chelsea',
    'Emiliano Martínez|GK|85|Aston Villa',
    // ---------- LaLiga ----------
    'Federico Valverde|MF|87|Real Madrid',
    'Julián Álvarez|FW|86|Atlético Madrid',
    'Pau Cubarsí|DF|86|FC Barcelona',
    'Marc Cucurella|DF|86|Real Madrid',
    'Joan García|GK|86|FC Barcelona',
    'Unai Simón|GK|85|Athletic',
    'Ante Budimir|FW|82|Osasuna',
    'Péter Gulácsi|GK|82|Villarreal',
    'Iago Aspas|FW|81|Celta',
    // ---------- Bundesliga ----------
    'Dayot Upamecano|DF|87|Bayern',
    'Nico Schlotterbeck|DF|87|Dortmund',
    'Gregor Kobel|GK|87|Dortmund',
    'Jonathan Tah|DF|87|Bayern',
    'Jamal Musiala|MF|87|Bayern',
    'Serhou Guirassy|FW|85|Dortmund',
    'Konrad Laimer|DF|85|Bayern',
    'Deniz Undav|FW|85|Stuttgart',
    'Felix Nmecha|MF|85|Dortmund',
    'Oliver Baumann|GK|84|Hoffenheim',
    'Aleix García|MF|84|Leverkusen',
    'Waldemar Anton|DF|84|Dortmund',
    'Angelo Stiller|MF|83|Stuttgart',
    'Patrik Schick|FW|83|Leverkusen',
    'Ismael Saibari|MF|83|Bayern',
    'David Raum|DF|83|Leipzig',
    'Aleksandar Pavlović|MF|83|Bayern',
    'Exequiel Palacios|MF|83|Leverkusen',
    'Willi Orbán|DF|83|Leipzig',
    'Maximilian Mittelstädt|DF|83|Stuttgart',
    'Kim Min-jae|DF|83|Bayern',
    'Serge Gnabry|FW|83|Bayern',
    'Matthias Ginter|DF|83|Freiburg',
    // ---------- Serie A ----------
    'Lautaro Martínez|FW|87|Inter Milan/Internazionale',
    'Mike Maignan|GK|87|AC Milan',
    'Nicolò Barella|MF|87|Inter Milan/Internazionale',
    'Scott McTominay|MF|86|Napoli',
    'Federico Dimarco|DF|86|Inter Milan/Internazionale',
    'Bremer/Gleison Bremer|DF|86|Juventus',
    'Marco Carnesecchi|GK|86|Atalanta',
    'Alessandro Bastoni|DF|86|Inter Milan/Internazionale',
    'Luka Modrić|MF|85|AC Milan',
    'Kevin De Bruyne|MF|85|Napoli',
    'Hakan Çalhanoğlu|MF|85|Inter Milan/Internazionale',
    'Adrien Rabiot|MF|85|AC Milan',
    'Paulo Dybala|FW|85|Roma',
    'Marcus Thuram|FW|85|Inter Milan/Internazionale',
    'Mile Svilar|GK|85|Roma',
    'Kenan Yıldız|FW|84|Juventus',
    'Nico Paz|MF|84|Como',
    'Gianluca Mancini|DF|84|Roma',
    'Manuel Locatelli|MF|84|Juventus',
    'Wladimiro Falcone|GK|84|Lecce',
    'Amir Rrahmani|DF|83|Napoli',
    'Christian Pulisic|FW|83|AC Milan',
    'Manuel Akanji|DF|83|Inter Milan/Internazionale',
    'Evan Ndicka|DF|83|Roma',
    'Donyell Malen|FW|83|Roma',
    'Stanislav Lobotka|MF|83|Napoli'
  ];

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function toast(msg, ok) {
    function show() {
      var d = document.createElement('div');
      d.textContent = msg;
      d.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);' +
        'background:' + (ok ? '#1b7f3b' : '#a33') + ';color:#fff;padding:10px 16px;' +
        'border-radius:12px;font:600 14px system-ui,sans-serif;z-index:99999;' +
        'box-shadow:0 4px 14px rgba(0,0,0,.35);max-width:90%;text-align:center';
      document.body.appendChild(d);
      setTimeout(function () { d.remove(); }, 4500);
    }
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
  }

  var F = window.FOOT;
  if (!F || typeof F.stars !== 'string') {
    console.warn('[FC27] window.FOOT.stars introuvable : foot-fc27.js doit etre charge APRES foot-data.js');
    toast('⚠️ Notes FC 27 non appliquées (ordre des fichiers)', false);
    return;
  }

  try {
    // ---- Clubs du jeu ----
    var CLUBS = [];
    var rawClubs = Array.isArray(F.clubs) ? F.clubs : String(F.clubs || '').split(/\r?\n|;/);
    rawClubs.forEach(function (l) {
      if (typeof l === 'string') {
        var p = l.split('|');
        if (p.length >= 5 && p[0].trim()) CLUBS.push({ id: p[0].trim(), k: norm(p[1]) + ' ' + norm(p[4]) });
      } else if (l && typeof l === 'object' && l.id) {
        CLUBS.push({ id: l.id, k: norm(l.nom || l.name || l.n) + ' ' + norm(l.wiki || l.w || l.page) });
      }
    });
    function findClub(hints) {
      var h = String(hints || '').split('/');
      for (var i = 0; i < h.length; i++) {
        var k = norm(h[i]);
        if (!k) continue;
        for (var j = 0; j < CLUBS.length; j++) if (CLUBS[j].k.indexOf(k) >= 0) return CLUBS[j].id;
      }
      return null;
    }

    // ---- Stars actuelles ----
    var entries = [], index = Object.create(null), posCount = Object.create(null);
    F.stars.split(';').forEach(function (s) {
      s = s.trim();
      if (!s) return;
      var f = s.split('|');
      entries.push(f);
      if (f.length >= 3) {
        var k = norm(f[0]);
        (index[k] = index[k] || []).push(entries.length - 1);
        var po = (f[1] || '').trim();
        posCount[po] = (posCount[po] || 0) + 1;
      }
    });

    // ---- Meme ecriture des postes que foot-data.js ----
    var SCHEMES = [
      { GK: 'GK', DF: 'DF', MF: 'MF', FW: 'FW' },
      { GK: 'G', DF: 'D', MF: 'M', FW: 'A' },
      { GK: 'GB', DF: 'DEF', MF: 'MIL', FW: 'ATT' },
      { GK: 'GAR', DF: 'DEF', MF: 'MIL', FW: 'ATT' },
      { GK: 'GK', DF: 'DEF', MF: 'MID', FW: 'ATT' }
    ];
    var best = SCHEMES[0], bestScore = -1;
    SCHEMES.forEach(function (sc) {
      var n = 0;
      ['GK', 'DF', 'MF', 'FW'].forEach(function (k) { n += posCount[sc[k]] || 0; });
      if (n > bestScore) { bestScore = n; best = sc; }
    });

    // ---- Application des notes FC 27 ----
    var official = {}, upd = 0, add = 0, skipped = [];
    FC27.forEach(function (line) {
      var p = line.split('|');
      if (p.length < 4) return;
      var names = p[0].split('/');
      var note = String(parseInt(p[2], 10));
      var hits = [];
      names.forEach(function (n) {
        var k = norm(n);
        official[k] = +note;
        if (index[k]) hits = hits.concat(index[k]);
      });
      if (hits.length) {
        hits.forEach(function (i) { entries[i][2] = note; });
        upd++;
        return;
      }
      var cid = findClub(p[3]);
      if (!cid) { skipped.push(names[0]); return; }
      names.forEach(function (n) {
        entries.push([n.trim(), best[p[1]] || p[1], note, cid]);
        var k = norm(n);
        (index[k] = index[k] || []).push(entries.length - 1);
      });
      add++;
    });

    F.stars = entries.map(function (f) { return f.join('|'); }).join(';');

    // ---- Vide le cache des effectifs une fois (pour appliquer les nouvelles notes) ----
    var first = false;
    try {
      if (localStorage.getItem('fm_fc27') !== VERSION) {
        first = true;
        var del = [];
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key && key.indexOf('fm_squads') === 0) del.push(key);
        }
        del.forEach(function (key) { localStorage.removeItem(key); });
        localStorage.setItem('fm_fc27', VERSION);
      }
    } catch (e) {}

    var total = upd + add;
    console.log('[FC27] ' + upd + ' notes mises a jour, ' + add + ' joueurs ajoutes' +
      (skipped.length ? ' | ignores (club absent du jeu) : ' + skipped.join(', ') : ''));
    if (!total) toast('⚠️ Notes FC 27 : aucune note appliquée', false);
    else if (first) toast('✅ Notes officielles EA FC 27 chargées (' + total + ' stars)', true);

    window.FOOT_FC27 = { version: VERSION, official: official, updated: upd, added: add, skipped: skipped };
  } catch (err) {
    console.error('[FC27] Erreur :', err);
    toast('⚠️ Erreur dans foot-fc27.js', false);
  }
})();
// ===== FIN foot-fc27.js =====
