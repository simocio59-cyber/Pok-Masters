// ===== foot-l1.js — FootMasters : toute la Ligue 1 2026-27 =====
// À mettre dans index.html APRÈS foot-data.js et AVANT foot-jeu.js.
// - ajoute les 18 clubs de Ligue 1 2026-27 (les clubs absents sont créés)
// - met les effectifs ACTUELS (lus sur Wikipédia, mis à jour tous les 3 jours)
// - garde les notes déjà connues, estime les autres (les notes FC 27 passent par-dessus)
// - garde les anciens joueurs que tu possèdes : tu ne perds aucune carte
// (Rien à modifier ici.)
(function () {
  'use strict';
  var KEY = 'fm_l1_v1', RL = 'fm_l1_rl', TTL = 3 * 24 * 3600 * 1000, T0 = Date.now();

  // k=code, w=page Wikipédia (anglais), n=nom, s=sigle, c1/c2=couleurs, b=niveau du club, re=pour le retrouver
  var CLUBS = [
    {k:'psg',  w:'Paris Saint-Germain F.C.', n:'Paris Saint-Germain',    s:'PSG',   c1:'#004170', c2:'#DA291C', b:82, re:/paris saint|paris sg|^psg$/},
    {k:'rcl',  w:'RC Lens',                  n:'RC Lens',                s:'RCL',   c1:'#FFD100', c2:'#E30613', b:77, re:/\blens\b/},
    {k:'losc', w:'Lille OSC',                n:'LOSC Lille',             s:'LOSC',  c1:'#E01E13', c2:'#1F2C5C', b:77, re:/lille|losc/},
    {k:'ol',   w:'Olympique Lyonnais',       n:'Olympique Lyonnais',     s:'OL',    c1:'#14387F', c2:'#DA001A', b:77, re:/lyon/},
    {k:'om',   w:'Olympique de Marseille',   n:'Olympique de Marseille', s:'OM',    c1:'#2FAEE0', c2:'#0B2D57', b:78, re:/marseille/},
    {k:'srfc', w:'Stade Rennais F.C.',       n:'Stade Rennais',          s:'SRFC',  c1:'#E13327', c2:'#111111', b:76, re:/renn/},
    {k:'asm',  w:'AS Monaco FC',             n:'AS Monaco',              s:'ASM',   c1:'#E2001A', c2:'#FFFFFF', b:78, re:/monaco/},
    {k:'rcsa', w:'RC Strasbourg Alsace',     n:'RC Strasbourg',          s:'RCSA',  c1:'#009FE3', c2:'#FFFFFF', b:75, re:/strasbourg/},
    {k:'tfc',  w:'Toulouse FC',              n:'Toulouse FC',            s:'TFC',   c1:'#5B2C83', c2:'#FFFFFF', b:73, re:/toulouse/},
    {k:'fcl',  w:'FC Lorient',               n:'FC Lorient',             s:'FCL',   c1:'#F58220', c2:'#111111', b:72, re:/lorient/},
    {k:'pfc',  w:'Paris FC',                 n:'Paris FC',               s:'PFC',   c1:'#0F1E3D', c2:'#6CACE4', b:73, re:/^paris f ?c$/},
    {k:'sb29', w:'Stade Brestois 29',        n:'Stade Brestois',         s:'SB29',  c1:'#E30613', c2:'#FFFFFF', b:73, re:/brest/},
    {k:'ogcn', w:'OGC Nice',                 n:'OGC Nice',               s:'OGCN',  c1:'#C8102E', c2:'#111111', b:75, re:/\bnice\b/},
    {k:'sco',  w:'Angers SCO',               n:'Angers SCO',             s:'SCO',   c1:'#111111', c2:'#FFFFFF', b:71, re:/angers/},
    {k:'aja',  w:'AJ Auxerre',               n:'AJ Auxerre',             s:'AJA',   c1:'#0055A4', c2:'#FFFFFF', b:72, re:/auxerre/},
    {k:'hac',  w:'Le Havre AC',              n:'Le Havre AC',            s:'HAC',   c1:'#6CACE4', c2:'#0B2D57', b:71, re:/havre/},
    {k:'estac',w:'ES Troyes AC',             n:'ESTAC Troyes',           s:'ESTAC', c1:'#0055A4', c2:'#FFFFFF', b:69, re:/troyes|estac/},
    {k:'lmfc', w:'Le Mans FC',               n:'Le Mans FC',             s:'LMFC',  c1:'#D71920', c2:'#FFD100', b:69, re:/le mans/}
  ];

  /* ---------- petits outils ---------- */
  function N(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  var XT = { 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'ł': 'l', 'đ': 'd', 'ı': 'i', 'ð': 'd', 'þ': 'th' };
  function K(s) { return String(s == null ? '' : s).toLowerCase().replace(/[øæœßłđıðþ]/g, function (c) { return XT[c]; }).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''); }
  function K2(s) { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function est(b, n, lk) { var h = hash(K(n)), r = lk ? b - 8 + h % 10 : b - 11 + h % 6; return Math.max(50, Math.min(95, r)); }
  function samePerson(a, b) {
    a = String(a || '').replace(/_/g, ' ').trim(); b = String(b || '').replace(/_/g, ' ').trim();
    if (!a || !b || N(a) === N(b)) return true;
    return !(a.indexOf('(') >= 0 && b.indexOf('(') >= 0);
  }

  /* ---------- petit message en haut de l'écran ---------- */
  function banner(t) {
    function put() {
      var b = document.getElementById('l1Ban');
      if (!b) {
        b = document.createElement('div'); b.id = 'l1Ban';
        b.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:99999;background:rgba(15,20,30,.94);color:#fff;padding:10px 16px;border-radius:12px;font:600 14px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.45);max-width:92vw;text-align:center;pointer-events:none';
        document.body.appendChild(b);
      }
      b.textContent = t;
    }
    if (document.body) put(); else document.addEventListener('DOMContentLoaded', put);
  }
  function hide(ms) { setTimeout(function () { var b = document.getElementById('l1Ban'); if (b && b.parentNode) b.parentNode.removeChild(b); }, ms || 0); }

  /* ---------- lecture des effectifs sur Wikipédia ---------- */
  function grab(s, i) {
    var d = 0;
    for (var k = i; k < s.length - 1; k++) {
      var c = s.charAt(k), c2 = s.charAt(k + 1);
      if (c === '{' && c2 === '{') { d++; k++; }
      else if (c === '}' && c2 === '}') { d--; k++; if (d === 0) return s.slice(i + 2, k - 1); }
    }
    return null;
  }
  function params(b) {
    var parts = [], cur = '', d = 0;
    for (var k = 0; k < b.length; k++) {
      var c = b.charAt(k), c2 = b.charAt(k + 1);
      if ((c === '{' && c2 === '{') || (c === '[' && c2 === '[')) { d++; cur += c + c2; k++; continue; }
      if ((c === '}' && c2 === '}') || (c === ']' && c2 === ']')) { d--; cur += c + c2; k++; continue; }
      if (c === '|' && d === 0) { parts.push(cur); cur = ''; continue; }
      cur += c;
    }
    parts.push(cur);
    var o = {};
    for (var i = 1; i < parts.length; i++) {
      var q = parts[i].indexOf('=');
      if (q > 0) o[parts[i].slice(0, q).trim().toLowerCase()] = parts[i].slice(q + 1).trim();
    }
    return o;
  }
  function who(v) {
    v = String(v || '').replace(/<[^>]*>/g, '').trim();
    var m = v.match(/\{\{\s*sort\s*name\s*\|([^{}]*)\}\}/i);
    if (m) {
      var P = [], O = {};
      m[1].split('|').forEach(function (x) { x = x.trim(); var q = x.indexOf('='); if (q > 0) O[x.slice(0, q).trim().toLowerCase()] = x.slice(q + 1).trim(); else P.push(x); });
      var disp = ((P[0] || '') + ' ' + (P[1] || '')).trim();
      var link = O.nolink ? '' : (P[2] || (O.dab ? disp + ' (' + O.dab + ')' : disp));
      return { n: disp, w: link, l: !!link };
    }
    m = v.match(/

$$
\[([^
$$

|]+)(?:\|([^\]]+))?\]\]/);
    if (m) { var t = m[1].trim(); return { n: (m[2] || t.replace(/\s*$[^)]*$\s*$/, '')).trim(), w: t, l: true }; }
    return { n: v.replace(/\{\{[^{}]*\}\}/g, '').replace(/'{2,}/g, '').trim(), w: '', l: false };
  }
  function pc(p) {
    p = String(p || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (p === 'GK' || p === 'G') return 'G';
    if (p === 'DF' || p === 'D' || p === 'DEF') return 'D';
    if (p === 'MF' || p === 'M' || p === 'MID') return 'M';
    if (p === 'FW' || p === 'F' || p === 'FWD' || p === 'ATT') return 'A';
    return 'M';
  }
  function parseSquad(txt) {
    txt = String(txt || '').replace(/<!--[\s\S]*?-->/g, '').replace(/<ref[^>]*\/>/gi, '').replace(/<ref[\s\S]*?<\/ref>/gi, '');
    var m = /\{\{\s*(?:fs|football[ _]squad)[ _]player\s*\|/i.exec(txt);
    if (!m) return [];
    var reE = /\{\{\s*(?:fs|football[ _]squad)[ _]end/ig; reE.lastIndex = m.index;
    var e = reE.exec(txt);
    var block = txt.slice(m.index, e ? e.index : m.index + 40000);
    var re = /\{\{\s*(?:fs|football[ _]squad)[ _]player\s*\|/ig, mm, out = [], seen = {};
    while ((mm = re.exec(block)) && out.length < 45) {
      var body = grab(block, mm.index); if (!body) continue;
      var P = params(body), w = who(P.name);
      var n = w.n.replace(/[|;]/g, ' ').replace(/\s+/g, ' ').trim();
      var k = K(n);
      if (!n || n.length > 40 || !k || seen[k]) continue;
      seen[k] = 1;
      out.push([n, pc(P.pos), w.w.replace(/[|;]/g, ' ').trim().replace(/ /g, '_'), w.l ? 1 : 0]);
    }
    return out.length >= 11 ? out : [];
  }
  function fetchClub(C) {
    var u = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&prop=wikitext&redirects=1&origin=*&page=' + encodeURIComponent(C.w);
    var ctl = window.AbortController ? new AbortController() : null;
    var tm = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : 0;
    return fetch(u, ctl ? { signal: ctl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(tm); return parseSquad(j && j.parse && j.parse.wikitext); })
      .catch(function () { clearTimeout(tm); return null; });
  }

  /* ---------- s'adapter au format de foot-data.js ---------- */
  function detectPos(T) {
    var cnt = {}, form = {};
    T.forEach(function (t) {
      if (!t || typeof t.j !== 'string') return;
      t.j.split(';').forEach(function (e) {
        var p = (e.split('|')[1] || '').trim(); if (!p) return;
        var u = p.toUpperCase(); cnt[u] = (cnt[u] || 0) + 1; if (!form[u]) form[u] = p;
      });
    });
    var C = {
      G: ['GK', 'G', 'GB', 'GAR', 'POR', 'GOAL', 'GARDIEN'],
      D: ['DF', 'DEF', 'D', 'DC', 'CB', 'LB', 'RB', 'DD', 'DG', 'LWB', 'RWB', 'LAT'],
      M: ['MF', 'MIL', 'M', 'MC', 'CM', 'CDM', 'CAM', 'MDC', 'MOC', 'DM', 'AM', 'LM', 'RM', 'MD', 'MG'],
      A: ['FW', 'ATT', 'A', 'AT', 'ST', 'BU', 'F', 'CF', 'LW', 'RW', 'AG', 'AD', 'SS']
    };
    var def = { G: 'GK', D: 'DF', M: 'MF', A: 'FW' }, out = {};
    Object.keys(C).forEach(function (k) {
      var best = null, bn = 0;
      C[k].forEach(function (c) { if ((cnt[c] || 0) > bn) { bn = cnt[c]; best = c; } });
      out[k] = best ? form[best] : def[k];
    });
    return out;
  }
  function ownedSet() {
    var s = new Set();
    try {
      var S = JSON.parse(localStorage.getItem('footmasters_v1') || 'null');
      var col = (S && S.col) || {};
      Object.keys(col).forEach(function (id) { if (col[id]) { s.add(K(id)); s.add(K2(id)); } });
    } catch (e) {}
    return s;
  }
  function leagueValue(D, cand) {
    var T = D.teams, cnt = new Map(), best = null, bn = 0;
    cand.forEach(function (c) {
      c.forEach(function (i) {
        var l = T[i].l; if (l == null || l === '') return;
        var n = (cnt.get(l) || 0) + 1; cnt.set(l, n); if (n > bn) { bn = n; best = l; }
      });
    });
    if (bn) return best;
    var Ls = Array.isArray(D.leagues) ? D.leagues : [], s = null, pick = -1;
    for (var i = 0; i < T.length; i++) { if (T[i] && T[i].l != null) { s = T[i].l; break; } }
    function txt(L) { return typeof L === 'string' ? L : JSON.stringify(L || {}); }
    Ls.forEach(function (L, i) { if (pick < 0 && /ligue\s*1\b/i.test(txt(L))) pick = i; });
    if (pick < 0) Ls.forEach(function (L, i) { if (pick < 0 && /ligue(?!\s*2)/i.test(txt(L))) pick = i; });
    if (pick >= 0) {
      var L = Ls[pick];
      if (typeof s === 'number') return pick;
      if (typeof L === 'string') return L;
      for (var k in L) { var v = L[k]; if (T.some(function (t) { return t && t.l === v; })) return v; }
      return L.id || L.k || L.code || L.n || L.name || 'Ligue 1';
    }
    if (Ls.length && Ls.every(function (x) { return typeof x === 'string'; }) && Ls.indexOf('Ligue 1') < 0) Ls.push('Ligue 1');
    return 'Ligue 1';
  }

  /* ---------- mise à jour des données du jeu ---------- */
  function apply(D, cache) {
    if (!D || !Array.isArray(D.teams) || !cache || !cache.c) return 0;
    var T = D.teams;
    var E = T.map(function (t) {
      if (!t || typeof t.j !== 'string') return null;
      return t.j.split(';').map(function (s) { return s.trim(); }).filter(Boolean)
        .map(function (s) { return s.split('|').map(function (x) { return x.trim(); }); });
    });

    // 1) clubs déjà présents dans le jeu
    var cand = CLUBS.map(function (C) {
      var r = []; T.forEach(function (t, i) { if (E[i] && C.re.test(N(t.n))) r.push(i); }); return r;
    });
    var LV = leagueValue(D, cand), used = {};
    var idx = CLUBS.map(function (C, ci) {
      var c = cand[ci].filter(function (i) { return !used[i]; });
      if (!c.length) return -1;
      var same = c.filter(function (i) { return T[i].l === LV; });
      var i0 = (same.length ? same : c)[0]; used[i0] = 1; return i0;
    });

    var POS = detectPos(T), OWN = ownedSet();
    function owned(n) { return OWN.has(K(n)) || OWN.has(K2(n)); }
    var G = new Map();
    E.forEach(function (arr, ti) {
      if (arr) arr.forEach(function (f) { var k = K(f[0]); if (!k) return; if (!G.has(k)) G.set(k, []); G.get(k).push({ ti: ti, f: f }); });
    });

    // 2) effectifs actuels
    var AS = new Map(), NJ = CLUBS.map(function () { return null; });
    CLUBS.forEach(function (C, ci) {
      var sq = cache.c[C.k]; if (!Array.isArray(sq) || sq.length < 11) return;
      var ti = idx[ci], mine = {}, list = [];
      if (ti >= 0) E[ti].forEach(function (f) { mine[K(f[0])] = f; });
      sq.forEach(function (p) {
        var n = String(p[0] || ''), k = K(n); if (!k || AS.has(k)) return;
        var w = String(p[2] || ''), old = mine[k];
        if (!old) { var g = G.get(k) || []; for (var q = 0; q < g.length; q++) { if (samePerson(g[q].f[3], w)) { old = g[q].f; break; } } }
        var f = old ? old.slice() : [n];
        f[1] = (old && old[1]) || POS[p[1]] || POS.M;
        f[2] = (old && +old[2]) ? old[2] : String(est(C.b, n, p[3]));
        f[3] = (old && old[3]) || w;
        list.push(f); AS.set(k, { ci: ci, w: f[3] });
      });
      NJ[ci] = list;
    });

    // 3) anciens joueurs de ces clubs que TU possèdes : on les garde
    var replaced = {};
    CLUBS.forEach(function (C, ci) { if (idx[ci] >= 0 && NJ[ci]) replaced[idx[ci]] = 1; });
    CLUBS.forEach(function (C, ci) {
      var ti = idx[ci]; if (ti < 0 || !NJ[ci]) return;
      E[ti].forEach(function (f) {
        var k = K(f[0]); if (!k || AS.has(k) || !owned(f[0])) return;
        var ailleurs = (G.get(k) || []).some(function (o) { return o.ti !== ti && !replaced[o.ti]; });
        if (ailleurs) return;
        NJ[ci].push(f); AS.set(k, { ci: ci, w: f[3] });
      });
    });

    // 4) les joueurs arrivés en Ligue 1 sont retirés de leur ancien club
    var OUT = E.map(function (arr, ti) {
      if (!arr) return null;
      if (replaced[ti]) return NJ[idx.indexOf(ti)];
      var keep = arr.filter(function (f) { var a = AS.get(K(f[0])); return !a || !samePerson(f[3], a.w); });
      return (keep.length === arr.length || !keep.length) ? null : keep;
    });

    // 5) on enregistre tout
    function str(list) { return list.map(function (f) { return f.join('|'); }).join(';'); }
    OUT.forEach(function (arr, ti) { if (arr) T[ti].j = str(arr); });
    var add = [];
    CLUBS.forEach(function (C, ci) {
      if (idx[ci] < 0 && NJ[ci] && NJ[ci].length) add.push({ n: C.n, s: C.s, l: LV, c1: C.c1, c2: C.c2, j: str(NJ[ci]) });
    });
    if (add.length) {
      var last = -1; T.forEach(function (t, i) { if (t && t.l === LV) last = i; });
      if (last >= 0) Array.prototype.splice.apply(T, [last + 1, 0].concat(add)); else Array.prototype.push.apply(T, add);
    }
    return NJ.filter(Boolean).length;
  }

  /* ---------- démarrage ---------- */
  var cache = null;
  try { cache = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { cache = null; }
  if (!cache || !cache.c || typeof cache.c !== 'object') cache = null;
  var applied = 0, late = !!window.FM;

  function run(D) {
    if (!cache) return;
    try { applied = apply(D, cache); } catch (e) { try { console.warn('[foot-l1]', e); } catch (_) {} }
  }
  function hook() {
    var v, done = false;
    try {
      Object.defineProperty(window, 'FOOT', {
        configurable: true, enumerable: true,
        get: function () {
          if (v && !done) { var cs = document.currentScript; if (!(cs && /foot-data/i.test(cs.src || ''))) { done = true; run(v); } }
          return v;
        },
        set: function (x) { v = x; }
      });
    } catch (e) {}
  }
  if (!late) { if (window.FOOT) run(window.FOOT); else hook(); }

  function refresh(first) {
    if (first) banner('⏳ Chargement des effectifs de Ligue 1 2026-27…');
    return Promise.all(CLUBS.map(function (C) { return fetchClub(C); })).then(function (res) {
      var old = (cache && cache.c) || {}, c = {}, ok = 0;
      CLUBS.forEach(function (C, i) {
        if (res[i] && res[i].length >= 11) { c[C.k] = res[i]; ok++; }
        else if (old[C.k]) c[C.k] = old[C.k];
      });
      if (!ok) {
        if (first) { banner('⚠️ Effectifs de Ligue 1 indisponibles pour l’instant (connexion ?). Le jeu marche quand même.'); hide(6000); }
        return;
      }
      var saved = false;
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), c: c })); saved = true; } catch (e) {}
      if (!first) return;
      var deja = true;
      try { deja = sessionStorage.getItem(RL) === '1'; if (!deja) sessionStorage.setItem(RL, '1'); } catch (e) { deja = true; }
      if (saved && !deja && Date.now() - T0 < 25000) {
        banner('✅ Ligue 1 prête (' + ok + '/' + CLUBS.length + ' clubs) ! Rechargement…');
        setTimeout(function () { location.reload(); }, 1200);
      } else {
        banner(saved ? '✅ Ligue 1 prête ! Recharge la page pour la voir.' : '⚠️ Impossible d’enregistrer la Ligue 1 (mémoire pleine ?).');
        hide(7000);
      }
    });
  }

  window.FOOT_L1 = {
    clubs: CLUBS.map(function (C) { return C.n; }),
    nb: function () { return applied; },
    refresh: function () { try { localStorage.removeItem(KEY); sessionStorage.removeItem(RL); } catch (e) {} location.reload(); }
  };

  setTimeout(function () {
    if (late) { banner('⚠️ foot-l1.js est mal placé : dans index.html, sa ligne doit être AU-DESSUS de celle de foot-jeu.js.'); hide(10000); }
    if (!cache) { refresh(!late); return; }
    var age = Date.now() - (cache.t || 0), miss = 0;
    CLUBS.forEach(function (C) { if (!cache.c[C.k]) miss++; });
    if (age > TTL || (miss && age > 3600 * 1000)) refresh(false);
  }, 500);
})();
// ===== FIN foot-l1.js =====
