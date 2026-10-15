// ===== foot-fc27.js — Notes officielles EA SPORTS FC 27 (FootMasters) =====
(function () {
  'use strict';
  var VERSION = 'fc27-3';
  // Signale tout de suite que le fichier est bien charge (enleve le bandeau rouge)
  window.FOOT_FC27 = { version: VERSION, ok: false, info: 'en attente' };

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
      setTimeout(function () { d.remove(); }, 5000);
    }
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
  }

  // ---- Trouve les donnees de foot-data.js, quelle que soit leur forme ----
  function findData() {
    var c = [];
    try { if (typeof FOOT !== 'undefined') c.push(FOOT); } catch (e) {}
    try { if (typeof FOOT_DATA !== 'undefined') c.push(FOOT_DATA); } catch (e) {}
    c.push(window.FOOT, window.FOOT_DATA);
    for (var i = 0; i < c.length; i++) {
      var d = c[i];
      if (d && typeof d === 'object' && d.stars) return d;
    }
    return null;
  }

  var NAME_K = ['n', 'name', 'nom'];
  var POS_K = ['p', 'pos', 'poste', 'position'];
  var NOTE_K = ['o', 'note', 'r', 'rating', 'ovr'];
  var CLUB_K = ['c', 'club', 'clubId', 'team', 't'];
  function pick(o, keys) {
    for (var i = 0; i < keys.length; i++) if (o[keys[i]] !== undefined) return keys[i];
    return null;
  }

  function apply() {
    var st = window.FOOT_FC27;
    if (st.ok) return true;
    var F = findData();
    if (!F) { st.info = 'données de foot-data.js introuvables'; return false; }

    try {
      var S = F.stars, isStr = typeof S === 'string';
      if (!isStr && !Array.isArray(S)) { st.info = 'format des stars inconnu'; return false; }

      // Lecture des stars
      var raw = isStr ? S.split(';') : S;
      var rows = [], sample = null, keys = null;
      raw.forEach(function (it, i) {
        var r = null;
        if (typeof it === 'string') {
          var t = it.trim();
          if (!t) return;
          r = { kind: 'str', f: t.split('|'), i: i };
        } else if (Array.isArray(it)) r = { kind: 'arr', f: it, i: i };
        else if (it && typeof it === 'object') r = { kind: 'obj', o: it, i: i };
        if (!r) return;
        if (!sample) sample = r;
        rows.push(r);
      });
      if (sample && sample.kind === 'obj') {
        keys = { n: pick(sample.o, NAME_K), p: pick(sample.o, POS_K), o: pick(sample.o, NOTE_K), c: pick(sample.o, CLUB_K) };
        if (!keys.n || !keys.o) { st.info = 'champs des stars inconnus'; return false; }
      }
      function getName(r) { return r.kind === 'obj' ? r.o[keys.n] : r.f[0]; }
      function getPos(r) { return r.kind === 'obj' ? (keys.p ? r.o[keys.p] : '') : r.f[1]; }
      function setNote(r, n) {
        if (r.kind === 'obj') r.o[keys.o] = typeof r.o[keys.o] === 'number' ? n : String(n);
        else r.f[2] = typeof r.f[2] === 'number' ? n : String(n);
      }

      // Clubs du jeu
      var CLUBS = [];
      var rc = F.clubs;
      var rawClubs = Array.isArray(rc) ? rc : String(rc || '').split(/\r?\n|;/);
      rawClubs.forEach(function (l) {
        if (typeof l === 'string') {
          var p = l.split('|');
          if (p.length >= 2 && p[0].trim()) CLUBS.push({ id: p[0].trim(), k: norm(p[1]) + ' ' + norm(p[4]) });
        } else if (Array.isArray(l) && l.length >= 2) {
          CLUBS.push({ id: l[0], k: norm(l[1]) + ' ' + norm(l[4]) });
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

      // Index des noms + ecriture des postes
      var index = Object.create(null), posCount = Object.create(null);
      rows.forEach(function (r, i) {
        if (r.kind !== 'obj' && r.f.length < 3) return;
        var k = norm(getName(r));
        if (!k) return;
        (index[k] = index[k] || []).push(i);
        var po = String(getPos(r) || '').trim();
        posCount[po] = (posCount[po] || 0) + 1;
      });
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

      function makeRow(name, pos, note, cid) {
        var kind = sample ? sample.kind : 'str';
        if (kind === 'obj') {
          if (!keys.c) return null;
          var o = {};
          o[keys.n] = name;
          if (keys.p) o[keys.p] = pos;
          o[keys.o] = typeof sample.o[keys.o] === 'number' ? note : String(note);
          o[keys.c] = cid;
          return { kind: 'obj', o: o, i: -1 };
        }
        var num = kind === 'arr' && typeof sample.f[2] === 'number';
        return { kind: kind, f: [name, pos, num ? note : String(note), cid], i: -1 };
      }

      // Application des notes
      var official = {}, upd = 0, add = 0, skipped = [];
      FC27.forEach(function (line) {
        var p = line.split('|');
        if (p.length < 4) return;
        var names = p[0].split('/');
        var note = parseInt(p[2], 10);
        var hits = [];
        names.forEach(function (n) {
          var k = norm(n);
          official[k] = note;
          if (index[k]) hits = hits.concat(index[k]);
        });
        if (hits.length) {
          hits.forEach(function (i) { setNote(rows[i], note); });
          upd++;
          return;
        }
        var cid = findClub(p[3]);
        var row = cid ? makeRow(names[0].trim(), best[p[1]] || p[1], note, cid) : null;
        if (!row) { skipped.push(names[0]); return; }
        rows.push(row);
        add++;
      });

      // Ecriture
      if (isStr) {
        F.stars = rows.map(function (r) { return r.f.join('|'); }).join(';');
      } else {
        rows.forEach(function (r) {
          var v = r.kind === 'obj' ? r.o : (r.kind === 'arr' ? r.f : r.f.join('|'));
          if (r.i >= 0) S[r.i] = v; else S.push(v);
        });
      }

      // Vide une fois le cache des effectifs
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
      st.ok = total > 0;
      st.info = upd + ' notes mises à jour, ' + add + ' joueurs ajoutés';
      st.official = official; st.updated = upd; st.added = add; st.skipped = skipped;
      console.log('[FC27] ' + st.info + (skipped.length ? ' | ignorés : ' + skipped.join(', ') : ''));
      if (!total) { st.info = 'aucun joueur reconnu'; return false; }
      if (first) toast('✅ Notes officielles EA FC 27 chargées (' + total + ' stars)', true);
      return true;
    } catch (err) {
      console.error('[FC27] Erreur :', err);
      st.info = 'erreur : ' + err.message;
      return false;
    }
  }

  if (!apply()) {
    document.addEventListener('DOMContentLoaded', function () { apply(); });
    setTimeout(function () {
      if (!window.FOOT_FC27.ok) {
        apply();
        if (!window.FOOT_FC27.ok) toast('⚠️ Notes FC 27 non appliquées : ' + window.FOOT_FC27.info, false);
      }
    }, 3000);
  }
})();
// ===== FIN foot-fc27.js =====
