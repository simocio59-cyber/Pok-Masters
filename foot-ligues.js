/* FootMasters - foot-ligues.js - version 1 (Premier League 2026-27) */
/* Doit etre charge APRES foot-data.js et AVANT foot-jeu.js */
(function () {
  'use strict';

  /* Caracteres fragiles ecrits avec des codes (le chat les abime) */
  var OB = String.fromCharCode(91);
  var CB = String.fromCharCode(93);
  var LT = String.fromCharCode(60);
  var NL = String.fromCharCode(10);

  var TTL = 3 * 24 * 3600 * 1000;
  var RL = 'fm_lg_rl';
  var journal = [];

  /* ========== LES LIGUES ========== */
  var LIGUES = [
    {
      code: 'PL', nom: 'Premier League', cle: 'fm_pl_v1', re: /premier league|angleterre|england|epl/,
      clubs: [
        { k: 'ars', w: 'Arsenal F.C.', n: 'Arsenal', s: 'ARS', c1: '#EF0107', c2: '#FFFFFF', b: 83, re: /arsenal/ },
        { k: 'avl', w: 'Aston Villa F.C.', n: 'Aston Villa', s: 'AVL', c1: '#670E36', c2: '#95BFE5', b: 79, re: /aston/ },
        { k: 'bou', w: 'AFC Bournemouth', n: 'Bournemouth', s: 'BOU', c1: '#DA291C', c2: '#000000', b: 76, re: /bournemouth/ },
        { k: 'bre', w: 'Brentford F.C.', n: 'Brentford', s: 'BRE', c1: '#E30613', c2: '#FFFFFF', b: 76, re: /brentford/ },
        { k: 'bha', w: 'Brighton & Hove Albion F.C.', n: 'Brighton', s: 'BHA', c1: '#0057B8', c2: '#FFFFFF', b: 77, re: /brighton/ },
        { k: 'che', w: 'Chelsea F.C.', n: 'Chelsea', s: 'CHE', c1: '#034694', c2: '#FFFFFF', b: 81, re: /chelsea/ },
        { k: 'cov', w: 'Coventry City F.C.', n: 'Coventry City', s: 'COV', c1: '#59CBE8', c2: '#FFFFFF', b: 72, re: /coventry/ },
        { k: 'cry', w: 'Crystal Palace F.C.', n: 'Crystal Palace', s: 'CRY', c1: '#1B458F', c2: '#C4122E', b: 77, re: /palace/ },
        { k: 'eve', w: 'Everton F.C.', n: 'Everton', s: 'EVE', c1: '#003399', c2: '#FFFFFF', b: 76, re: /everton/ },
        { k: 'ful', w: 'Fulham F.C.', n: 'Fulham', s: 'FUL', c1: '#111111', c2: '#FFFFFF', b: 76, re: /fulham/ },
        { k: 'hul', w: 'Hull City A.F.C.', n: 'Hull City', s: 'HUL', c1: '#F5A12D', c2: '#000000', b: 71, re: /hull/ },
        { k: 'ips', w: 'Ipswich Town F.C.', n: 'Ipswich Town', s: 'IPS', c1: '#0044A9', c2: '#FFFFFF', b: 72, re: /ipswich/ },
        { k: 'lee', w: 'Leeds United F.C.', n: 'Leeds United', s: 'LEE', c1: '#1D428A', c2: '#FFCD00', b: 74, re: /leeds/ },
        { k: 'liv', w: 'Liverpool F.C.', n: 'Liverpool', s: 'LIV', c1: '#C8102E', c2: '#FFFFFF', b: 83, re: /liverpool/ },
        { k: 'mci', w: 'Manchester City F.C.', n: 'Manchester City', s: 'MCI', c1: '#6CABDD', c2: '#1C2C5B', b: 83, re: /manchester c|man c/ },
        { k: 'mun', w: 'Manchester United F.C.', n: 'Manchester United', s: 'MUN', c1: '#DA291C', c2: '#000000', b: 79, re: /manchester u|man u/ },
        { k: 'new', w: 'Newcastle United F.C.', n: 'Newcastle', s: 'NEW', c1: '#241F20', c2: '#FFFFFF', b: 79, re: /newcastle/ },
        { k: 'nfo', w: 'Nottingham Forest F.C.', n: 'Nottingham Forest', s: 'NFO', c1: '#DD0000', c2: '#FFFFFF', b: 77, re: /nott/ },
        { k: 'sun', w: 'Sunderland A.F.C.', n: 'Sunderland', s: 'SUN', c1: '#EB172B', c2: '#FFFFFF', b: 74, re: /sunderland/ },
        { k: 'tot', w: 'Tottenham Hotspur F.C.', n: 'Tottenham', s: 'TOT', c1: '#132257', c2: '#FFFFFF', b: 79, re: /tottenham|spurs/ }
      ]
    }
  ];

  var STOP = /loan|academy|reserve|under|youth|development|women|u21|u23|u-21|u-23|retired|former|notable|staff|management|coach|captain|record|honour|award|personnel/;

  /* ========== OUTILS ========== */
  function erreur(m) {
    journal.push('ERREUR ' + m);
    try {
      if (window.FM_ERR && window.FM_ERR.push) window.FM_ERR.push('Ligues : ' + m);
    } catch (e) {}
  }

  function bas(s) {
    return String(s || '').replace(/[A-Z]/g, function (m) { return m.toLowerCase(); });
  }

  function norm(s) {
    s = String(s || '').toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    s = s.split('\u00f8').join('o').split('\u00e6').join('ae').split('\u00df').join('ss');
    s = s.split('\u0142').join('l').split('\u0111').join('d').split('\u0131').join('i');
    return s.replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function base(t) {
    t = String(t || '');
    var p = t.indexOf(' (');
    return norm(p === -1 ? t : t.slice(0, p));
  }

  function nbMots(s) {
    return s ? s.split(' ').length : 0;
  }

  function propre(s) {
    s = String(s || '');
    s = s.split(OB).join('').split(CB).join('');
    s = s.split("'''").join('').split("''").join('');
    s = s.split('{{').join('').split('}}').join('');
    s = s.split('|').join(' ').split(';').join(' ');
    return s.replace(/\s+/g, ' ').trim();
  }

  /* ========== JOUEURS : Nom|POS|note|wikiTitle ========== */
  function parseJ(j) {
    var out = [];
    String(j || '').split(';').forEach(function (x) {
      if (!x) return;
      var f = x.split('|');
      out.push({ n: f[0] || '', p: f[1] || '', r: f[2] || '', t: f[3] || '', raw: f });
    });
    return out;
  }

  function joinJ(list) {
    return list.map(function (p) {
      var f;
      if (p.raw) {
        f = p.raw.slice();
        if (!f[3] && p.t) {
          while (f.length < 3) f.push('');
          f[3] = propre(p.t);
        }
      } else {
        f = [propre(p.n), p.p, String(p.r)];
        if (p.t) f.push(propre(p.t));
      }
      return f.join('|');
    }).join(';');
  }

  /* ========== POSTES ET NOTES ========== */
  function detectPos(D) {
    var vu = {}, res = {};
    D.teams.forEach(function (t) {
      parseJ(t.j).forEach(function (p) { if (p.p) vu[p.p] = 1; });
    });
    var CAND = {
      GK: ['GK', 'G', 'GB', 'POR', 'GAR', 'Gardien'],
      DF: ['DEF', 'DF', 'D', 'DC', 'CB', 'D\u00e9fenseur', 'Defenseur'],
      MF: ['MID', 'MF', 'M', 'MIL', 'MC', 'CM', 'Milieu'],
      FW: ['ATT', 'FW', 'A', 'F', 'ST', 'BU', 'AT', 'FWD', 'Attaquant']
    };
    Object.keys(CAND).forEach(function (k) {
      var l = CAND[k], i, x;
      res[k] = k;
      for (i = 0; i < l.length; i++) {
        x = l[i];
        if (vu[x]) { res[k] = x; return; }
        if (vu[x.toLowerCase()]) { res[k] = x.toLowerCase(); return; }
      }
    });
    return res;
  }

  function mapPos(pm, wp) {
    var c = String(wp || '').trim().toUpperCase().charAt(0);
    if (c === 'G') return pm.GK;
    if (c === 'D') return pm.DF;
    if (c === 'F' || c === 'A' || c === 'S') return pm.FW;
    return pm.MF;
  }

  function estime(b, no, nom) {
    var h = 0, i, s = String(nom || ''), r;
    for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
    r = b - 4 + (h % 5) - 2;
    no = parseInt(no, 10) || 0;
    if (no > 0 && no < 12) r += 2;
    if (no > 39) r -= 5;
    if (r > b) r = b;
    if (r < 58) r = 58;
    return r;
  }

  /* ========== CARTES QUE TU POSSEDES (on ne les casse jamais) ========== */
  function ownedFn(D) {
    var oui = function () { return true; };
    var non = function () { return false; };
    var col = null, set = {}, seps = ['|', '_', ':', ';', ',', '#', '/', '@'];
    try {
      var S = JSON.parse(localStorage.getItem('footmasters_v1') || 'null');
      col = S && S.col ? S.col : null;
    } catch (e) {
      return oui;
    }
    if (!col || typeof col !== 'object' || !Object.keys(col).length) return non;

    function ajoute(s) {
      if (typeof s !== 'string' || !s) return;
      var parts = [s], k0 = norm(s);
      seps.forEach(function (sp) {
        var nv = [];
        parts.forEach(function (x) { x.split(sp).forEach(function (y) { nv.push(y); }); });
        parts = nv;
      });
      if (k0) set[k0] = 1;
      parts.forEach(function (x) { var k = norm(x); if (k) set[k] = 1; });
    }

    Object.keys(col).forEach(function (id) {
      var v = col[id];
      ajoute(id);
      if (typeof v === 'string') ajoute(v);
      else if (v && typeof v === 'object') Object.keys(v).forEach(function (kk) { ajoute(v[kk]); });
    });

    var teste = function (n, t) {
      return !!(set[norm(n)] || (t && set[norm(t)]));
    };
    var lisible = D.teams.some(function (t) {
      return parseJ(t.j).some(function (p) { return teste(p.n, p.t); });
    });
    return lisible ? teste : oui;
  }

  /* ========== LIGUE ET CLUBS ========== */
  function leagueValue(D, L) {
    var cnt = {}, best = null, bestN = 0, i, it, key;
    D.teams.forEach(function (t) {
      var nn = norm(t.n), j, k;
      for (j = 0; j < L.clubs.length; j++) {
        if (L.clubs[j].re.test(nn)) {
          k = String(t.l);
          cnt[k] = (cnt[k] || 0) + 1;
          if (cnt[k] > bestN) { bestN = cnt[k]; best = t.l; }
          break;
        }
      }
    });
    if (bestN > 3) return best;

    var lg = D.leagues, refs = {}, num = typeof D.teams[0].l === 'number';
    D.teams.forEach(function (t) { refs[String(t.l)] = 1; });

    if (Array.isArray(lg)) {
      for (i = 0; i < lg.length; i++) {
        it = lg[i];
        if (L.re.test(norm(typeof it === 'string' ? it : JSON.stringify(it)))) {
          if (num) return i;
          if (typeof it === 'string') return it;
          for (key in it) { if (refs[String(it[key])]) return it[key]; }
          return it.k || it.id || it.code || it.n || L.nom;
        }
      }
      if (!lg.length || typeof lg[0] === 'string') {
        lg.push(L.nom);
        return num ? lg.length - 1 : L.nom;
      }
      var o = {}, ref = null, f0 = lg[0];
      for (key in f0) {
        o[key] = typeof f0[key] === 'string' ? L.nom : f0[key];
        if (refs[String(f0[key])]) ref = key;
      }
      if (ref) o[ref] = L.code;
      lg.push(o);
      return num ? lg.length - 1 : (ref ? L.code : L.nom);
    }

    if (lg && typeof lg === 'object') {
      var cles = Object.keys(lg);
      var parCle = cles.some(function (k) { return refs[k]; });
      for (i = 0; i < cles.length; i++) {
        key = cles[i];
        it = lg[key];
        if (L.re.test(norm(key + ' ' + (typeof it === 'string' ? it : JSON.stringify(it))))) {
          return (parCle || typeof it !== 'string') ? key : it;
        }
      }
      var premiereCle = cles.length ? cles[0] : null;
      var f1 = premiereCle !== null ? lg[premiereCle] : null, o2 = {};
      if (f1 && typeof f1 === 'object') {
        for (key in f1) o2[key] = typeof f1[key] === 'string' ? L.nom : f1[key];
        lg[L.code] = o2;
      } else {
        lg[L.code] = L.nom;
      }
      return L.code;
    }
    return L.nom;
  }

  function trouverClub(D, c, LV, pris) {
    var i, t, cn = norm(c.n);
    for (i = 0; i < D.teams.length; i++) {
      t = D.teams[i];
      if (pris.indexOf(t) === -1 && String(t.l) === String(LV) && c.re.test(norm(t.n))) return t;
    }
    for (i = 0; i < D.teams.length; i++) {
      t = D.teams[i];
      if (pris.indexOf(t) === -1 && norm(t.n) === cn) return t;
    }
    return null;
  }

  function inserer(D, t, LV) {
    var i, der = -1;
    for (i = 0; i < D.teams.length; i++) {
      if (String(D.teams[i].l) === String(LV)) der = i;
    }
    if (der === -1) D.teams.push(t);
    else D.teams.splice(der + 1, 0, t);
  }

  function proche(a, b) {
    if (!a || !b) return false;
    var A = a.split(' '), B = b.split(' ');
    var la = A[A.length - 1], lb = B[B.length - 1];
    if (la !== lb || la.length < 3) return false;
    if (A.length === 1 || B.length === 1) return true;
    return A[0].charAt(0) === B[0].charAt(0);
  }

  function chercher(vieux, utilises, wn, wt) {
    var nt = wt ? norm(wt) : '', bt = wt ? base(wt) : '', nn = norm(wn), i, o, on;
    for (i = 0; i < vieux.length; i++) {
      o = vieux[i];
      if (utilises.indexOf(o) === -1 && nt && o.t && norm(o.t) === nt) return o;
    }
    for (i = 0; i < vieux.length; i++) {
      o = vieux[i];
      on = norm(o.n);
      if (utilises.indexOf(o) === -1 && (on === nn || (bt && on === bt))) return o;
    }
    for (i = 0; i < vieux.length; i++) {
      o = vieux[i];
      on = norm(o.n);
      if (utilises.indexOf(o) === -1 && (proche(on, nn) || (bt && proche(on, bt)))) return o;
    }
    return null;
  }

  /* ========== APPLIQUER LES EFFECTIFS ========== */
  function appliquer(D, L, cache, info) {
    var LV = leagueValue(D, L);
    var pm = detectPos(D);
    var possede = ownedFn(D);
    var glob = {}, pris = [], carte = {}, trouves = 0, place = {}, lots = [];

    function marquer(n, t) {
      var a = norm(n);
      if (t) place['t:' + norm(t)] = 1;
      if (nbMots(a) >= 2) place['n:' + a] = 1;
    }

    D.teams.forEach(function (t) {
      parseJ(t.j).forEach(function (p) {
        var e = { team: t, p: p }, nn = norm(p.n), kt = 't:' + norm(p.t);
        if (p.t && !glob[kt]) glob[kt] = e;
        if (nbMots(nn) >= 2 && !glob['n:' + nn]) glob['n:' + nn] = e;
      });
    });

    L.clubs.forEach(function (c) {
      var t = trouverClub(D, c, LV, pris);
      if (!t) return;
      pris.push(t);
      carte[c.k] = t;
      if (String(t.l) === String(LV)) trouves++;
    });

    L.clubs.forEach(function (c) {
      var liste = cache.c[c.k], t = carte[c.k] || null;
      if (!liste || liste.length < 11) {
        if (t) t.l = LV;
        return;
      }
      var vieux = t ? parseJ(t.j) : [], utilises = [], out = [];
      liste.forEach(function (w) {
        var wn = w[0], wp = w[1], wno = w[2], wt = w[3] || '';
        var m = chercher(vieux, utilises, wn, wt), g = null, p;
        if (m) {
          utilises.push(m);
          p = { n: m.n, p: m.p, r: m.r, t: m.t || wt, raw: m.raw };
        } else {
          if (wt) g = glob['t:' + norm(wt)] || null;
          if (!g && nbMots(norm(wn)) >= 2) g = glob['n:' + norm(wn)] || null;
          if (g && g.team !== t) p = { n: g.p.n, p: g.p.p, r: g.p.r, t: g.p.t || wt, raw: g.p.raw };
          else p = { n: wn, p: mapPos(pm, wp), r: estime(c.b, wno, wn), t: wt };
        }
        out.push(p);
        marquer(p.n, p.t);
        marquer(wn, wt);
      });
      lots.push({
        c: c, t: t, out: out,
        reste: vieux.filter(function (o) { return utilises.indexOf(o) === -1; })
      });
    });

    lots.forEach(function (x) {
      x.reste.forEach(function (o) {
        var nn = norm(o.n);
        var ailleurs = (o.t && place['t:' + norm(o.t)]) || (nbMots(nn) >= 2 && place['n:' + nn]);
        if (!ailleurs && possede(o.n, o.t)) {
          x.out.push(o);
          info.garde.push(o.n);
        }
      });
      var j = joinJ(x.out);
      if (x.t) {
        x.t.j = j;
        x.t.l = LV;
        info.maj++;
      } else {
        x.t = { n: x.c.n, s: x.c.s, l: LV, c1: x.c.c1, c2: x.c.c2, j: j };
        inserer(D, x.t, LV);
        pris.push(x.t);
        info.ajout++;
      }
      info.nb += x.out.length;
    });

    var frais = lots.map(function (x) { return x.t; });

    /* Transferts : on retire le joueur de son ancien club */
    D.teams.forEach(function (t) {
      if (frais.indexOf(t) !== -1) return;
      var l = parseJ(t.j);
      var reste = l.filter(function (p) {
        if (p.t) return !place['t:' + norm(p.t)];
        var nn = norm(p.n);
        return !(nbMots(nn) >= 2 && place['n:' + nn]);
      });
      if (reste.length !== l.length && reste.length >= 11) t.j = joinJ(reste);
    });

    /* Clubs relegues : retires, sauf si tu as une de leurs cartes */
    if (trouves >= 10) {
      D.teams.slice().forEach(function (t) {
        if (String(t.l) !== String(LV) || pris.indexOf(t) !== -1) return;
        var cartes = parseJ(t.j).some(function (p) { return possede(p.n, p.t); });
        if (cartes) {
          info.garde.push(t.n + ' (relegue, garde car tu as ses cartes)');
        } else {
          D.teams.splice(D.teams.indexOf(t), 1);
          info.retire.push(t.n);
        }
      });
    }
    info.ligue = LV;
  }

  /* ========== LECTURE WIKIPEDIA ========== */
  function decouper(s) {
    var parts = [], d = 0, cur = '', i, two, ch;
    for (i = 0; i < s.length; i++) {
      two = s.substr(i, 2);
      if (two === '{{' || two === OB + OB) { d++; cur += two; i++; continue; }
      if ((two === '}}' || two === CB + CB) && d > 0) { d--; cur += two; i++; continue; }
      ch = s.charAt(i);
      if (ch === '|' && d === 0) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    return parts;
  }

  function fermeture(t, i) {
    var d = 0, k, two;
    for (k = i; k < t.length - 1; k++) {
      two = t.substr(k, 2);
      if (two === '{{') { d++; k++; }
      else if (two === '}}') { d--; if (d === 0) return k; k++; }
    }
    return -1;
  }

  function premierFs(lo) {
    var best = -1;
    ['{{fs player', '{{ fs player', '{{football squad player'].forEach(function (m) {
      var x = lo.indexOf(m);
      if (x !== -1 && (best === -1 || x < best)) best = x;
    });
    return best;
  }

  function finSection(lo, start) {
    var pos = start, nb = 1, nl, fin, ligne, joueur;
    while (true) {
      nl = lo.indexOf(NL, pos);
      if (nl === -1) return lo.length;
      fin = lo.indexOf(NL, nl + 1);
      if (fin === -1) fin = lo.length;
      ligne = lo.slice(nl + 1, fin);
      joueur = ligne.indexOf('fs player') !== -1 || ligne.indexOf('football squad player') !== -1;
      if (joueur) nb++;
      else if (ligne.slice(0, 2) === '==') { if (STOP.test(ligne)) return nl; }
      else if (ligne.indexOf('out on loan') !== -1 && nb > 10) return nl;
      else if (ligne.indexOf('fs end') !== -1 && nb > 15) return fin;
      pos = nl + 1;
    }
  }

  function modeles(t, lo, from, to) {
    var out = [], i = from, tete, e;
    while (true) {
      i = lo.indexOf('{{', i);
      if (i === -1 || i >= to) break;
      tete = lo.slice(i + 2, i + 40).replace(/^\s+/, '');
      if (tete.indexOf('fs player') === 0 || tete.indexOf('football squad player') === 0) {
        e = fermeture(t, i);
        if (e === -1) break;
        out.push(t.slice(i + 2, e));
        i = e + 2;
      } else {
        i += 2;
      }
    }
    return out;
  }

  function nomJoueur(v) {
    v = String(v || '');
    var p = v.indexOf(LT), n = '', t = '', e, inner, ps, i, mots;
    if (p !== -1) v = v.slice(0, p);
    v = v.split('&' + 'nbsp;').join(' ');
    var lv = bas(v), iL = v.indexOf(OB + OB), iS = lv.indexOf('{{sortname');
    if (iS !== -1 && (iL === -1 || iS < iL)) {
      e = fermeture(v, iS);
      inner = e === -1 ? v.slice(iS + 2) : v.slice(iS + 2, e);
      ps = decouper(inner);
      mots = [];
      for (i = 1; i < ps.length; i++) {
        if (ps[i].indexOf('=') === -1) mots.push(ps[i].trim());
      }
      n = ((mots[0] || '') + ' ' + (mots[1] || '')).trim();
      t = mots[2] || n;
    } else if (iL !== -1) {
      e = v.indexOf(CB + CB, iL);
      inner = e === -1 ? v.slice(iL + 2) : v.slice(iL + 2, e);
      i = inner.indexOf('|');
      if (i !== -1) { t = inner.slice(0, i).trim(); n = inner.slice(i + 1).trim(); }
      else { t = inner.trim(); n = t; }
    } else {
      n = v.replace(/\{\{[^}]*\}\}/g, '').trim();
      t = n;
    }
    n = propre(n);
    t = propre(t);
    if (!n) n = t;
    if (!n) return null;
    return { n: n, t: t };
  }

  function lireEffectif(t) {
    var lo = bas(t), start = premierFs(lo), out = [], vus = {};
    if (start === -1) return out;
    modeles(t, lo, start, finSection(lo, start)).forEach(function (s) {
      var parts = decouper(s), P = {}, i, eq, nm, k;
      for (i = 1; i < parts.length; i++) {
        eq = parts[i].indexOf('=');
        if (eq === -1) continue;
        P[parts[i].slice(0, eq).trim().toLowerCase()] = parts[i].slice(eq + 1).trim();
      }
      nm = nomJoueur(P.name || '');
      if (!nm) return;
      k = norm(nm.n);
      if (!k || vus[k]) return;
      vus[k] = 1;
      out.push([nm.n, String(P.pos || '').trim().toUpperCase(), parseInt(P.no, 10) || 0, nm.t]);
    });
    return out;
  }

  function lireClub(c) {
    var url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2' +
      '&prop=wikitext&redirects=1&origin=*&page=' + encodeURIComponent(c.w);
    return fetch(url).then(function (r) { return r.json(); }).then(function (js) {
      var wt = js && js.parse ? js.parse.wikitext : null, liste;
      if (wt && typeof wt === 'object') wt = wt['*'];
      if (!wt) { journal.push(c.k + ' : page vide'); return null; }
      liste = lireEffectif(String(wt));
      journal.push(c.k + ' : ' + liste.length + ' joueurs');
      return liste.length > 10 ? liste : null;
    }).catch(function (e) {
      journal.push(c.k + ' : ' + e);
      return null;
    });
  }

  /* ========== CHARGEMENT ========== */
  function lireCache(cle) {
    try {
      var c = JSON.parse(localStorage.getItem(cle) || 'null');
      if (c && c.c && typeof c.t === 'number') return c;
    } catch (e) {}
    return null;
  }

  function banniere(txt) {
    function montrer() {
      if (document.getElementById('fmLgLoad')) return;
      var b = document.createElement('div'), st = b.style;
      b.id = 'fmLgLoad';
      b.textContent = txt;
      st.position = 'fixed';
      st.left = '50%';
      st.top = '60px';
      st.transform = 'translateX(-50%)';
      st.background = '#0f172a';
      st.color = '#ffffff';
      st.padding = '10px 16px';
      st.borderRadius = '12px';
      st.font = '600 14px system-ui, sans-serif';
      st.zIndex = '99999';
      st.boxShadow = '0 4px 16px rgba(0,0,0,0.45)';
      st.maxWidth = '90%';
      st.textAlign = 'center';
      document.body.appendChild(b);
    }
    if (document.body) montrer();
    else document.addEventListener('DOMContentLoaded', montrer);
  }

  function charger(liste) {
    if (!window.fetch) return;
    var deja = false, res = {}, taches = [], i = 0, actifs = 0, fini = false;
    try { deja = sessionStorage.getItem(RL) === '1'; } catch (e) {}
    var premier = liste.some(function (x) { return x.premier; });
    if (premier && !deja) banniere('\u23f3 Premier League : chargement des effectifs... (une seule fois)');
    liste.forEach(function (x) {
      x.L.clubs.forEach(function (c) { taches.push({ L: x.L, c: c }); });
    });

    function terminer() {
      if (fini) return;
      fini = true;
      var recharger = false;
      liste.forEach(function (x) {
        var L = x.L, recu = res[L.code] || {}, ancien = lireCache(L.cle);
        var tout = ancien ? ancien.c : {}, k, nb, t;
        for (k in recu) tout[k] = recu[k];
        nb = Object.keys(tout).length;
        if (!nb) return;
        t = Date.now();
        if (nb < 15) t = t - TTL + 6 * 3600 * 1000;
        try {
          localStorage.setItem(L.cle, JSON.stringify({ v: 1, t: t, c: tout }));
          if (x.premier) recharger = true;
        } catch (e) {
          erreur('sauvegarde ' + L.code + ' : ' + e);
        }
      });
      var b = document.getElementById('fmLgLoad');
      if (b && b.parentNode) b.parentNode.removeChild(b);
      if (recharger && !deja) {
        try { sessionStorage.setItem(RL, '1'); } catch (e) {}
        location.reload();
      }
    }

    function lancer(tk) {
      actifs++;
      lireClub(tk.c).then(function (l) {
        if (l) {
          if (!res[tk.L.code]) res[tk.L.code] = {};
          res[tk.L.code][tk.c.k] = l;
        }
        actifs--;
        suivant();
      });
    }

    function suivant() {
      if (fini) return;
      if (i >= taches.length && actifs === 0) { terminer(); return; }
      while (actifs < 4 && i < taches.length) {
        lancer(taches[i]);
        i++;
      }
    }

    setTimeout(terminer, 45000);
    suivant();
  }

  /* ========== DEMARRAGE ========== */
  var D = window.FOOT;
  if (!D || !D.teams || !D.teams.length) {
    erreur('window.FOOT introuvable');
    window.FOOT_PL = { version: 1, erreur: 'FOOT introuvable', journal: journal };
    return;
  }

  var aCharger = [];
  LIGUES.forEach(function (L) {
    var info = {
      version: 1, nom: L.nom, clubs: L.clubs.length, maj: 0, ajout: 0, nb: 0,
      retire: [], garde: [], source: 'aucune', ligue: null, journal: journal
    };
    info.refresh = function () {
      try { localStorage.removeItem(L.cle); sessionStorage.removeItem(RL); } catch (e) {}
      location.reload();
    };
    var cache = lireCache(L.cle);
    if (cache) {
      try {
        appliquer(D, L, cache, info);
        info.source = 'cache';
      } catch (e) {
        erreur(L.code + ' : ' + e);
      }
    }
    if (!cache || Date.now() - cache.t > TTL) aCharger.push({ L: L, premier: !cache });
    window['FOOT_' + L.code] = info;
  });

  if (aCharger.length) {
    try { charger(aCharger); } catch (e) { erreur('chargement : ' + e); }
  }
})();
/* FIN foot-ligues.js */
