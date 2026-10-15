/* FootMasters - foot-images.js - version 2 (vraies photos uniquement, aucun dessin) */
(function () {
  'use strict';

  var CLE = 'fm_img_v2';
  var REESSAI = 24 * 3600 * 1000;
  var SDB = 'https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=';

  try { localStorage.removeItem('fm_img_v1'); } catch (e) {}
  var cache = {};
  try { cache = JSON.parse(localStorage.getItem(CLE) || '{}') || {}; } catch (e) { cache = {}; }

  var enCours = {}, attente = {}, fileTitres = [], fileJoueurs = [], actifs = 0;
  var stats = { photos: 0, introuvables: 0, requetes: 0 };
  var manquants = {};
  var index = null, indexNb = -1;

  /* ========== OUTILS ========== */
  function norm(s) {
    s = String(s || '').toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    s = s.split('\u00f8').join('o').split('\u00e6').join('ae').split('\u00df').join('ss');
    s = s.split('\u0142').join('l').split('\u0111').join('d').split('\u0131').join('i');
    return s.replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function mots(n) {
    return norm(n).split(' ').filter(function (w) { return w.length > 1; });
  }

  function base(t) {
    t = String(t || '').split('_').join(' ');
    var p = t.indexOf(' (');
    return (p === -1 ? t : t.slice(0, p)).trim();
  }

  /* Le nom de la page doit correspondre au nom du joueur */
  function correspond(titre, nom) {
    var t = ' ' + norm(titre) + ' ', m = mots(nom);
    if (!m.length) return false;
    if (t.indexOf(' ' + m[m.length - 1] + ' ') === -1) return false;
    if (m.length >= 2 && t.indexOf(' ' + m[0] + ' ') === -1 && t.indexOf(' ' + m[0].charAt(0) + ' ') === -1) return false;
    return true;
  }

  /* La page doit parler d'un footballeur */
  function estFoot(s) {
    return /foot|soccer|fussball|futbol|futebol|calci|voetbal|goalkeeper|gardien|striker|midfielder|defender|portero|torwart/.test(norm(s));
  }

  var tSave = null;
  function sauver() {
    if (tSave) return;
    tSave = setTimeout(function () {
      tSave = null;
      try { localStorage.setItem(CLE, JSON.stringify(cache)); } catch (e) {}
    }, 1500);
  }

  /* ========== RETROUVER LE JOUEUR DANS LES DONNEES ========== */
  function construireIndex() {
    var D = window.FOOT;
    if (!D || !D.teams) return null;
    if (index && indexNb === D.teams.length) return index;
    index = { noms: {}, liste: [] };
    D.teams.forEach(function (t) {
      String(t.j || '').split(';').forEach(function (x) {
        if (!x) return;
        var f = x.split('|'), n = norm(f[0]);
        if (!n) return;
        var e = { n: f[0], t: String(f[3] || '').trim(), team: t, nn: n };
        if (!index.noms[n]) index.noms[n] = [];
        index.noms[n].push(e);
        index.liste.push(e);
      });
    });
    indexNb = D.teams.length;
    return index;
  }

  function memeClub(team, tn) {
    if (!tn || !team) return false;
    var a = norm(team.n), s = norm(team.s);
    return tn === a || (a && tn.indexOf(a) !== -1) || (a && a.indexOf(tn) !== -1) || (s && tn === s);
  }

  function trouverJoueur(nm, tm) {
    var I = construireIndex(), nn = norm(nm), tn = norm(tm), c, i;
    if (!I || !nn) return null;
    c = I.noms[nn] || [];
    if (!c.length) {
      c = I.liste.filter(function (e) {
        return e.nn.length > nn.length &&
          (e.nn.slice(e.nn.length - nn.length - 1) === ' ' + nn || e.nn.indexOf(nn + ' ') === 0);
      });
    }
    for (i = 0; i < c.length; i++) { if (memeClub(c[i].team, tn)) return c[i]; }
    return c[0] || null;
  }

  /* ========== REQUETES ========== */
  function api(host, params) {
    stats.requetes++;
    var u = 'https://' + host + '/w/api.php?format=json&formatversion=2&origin=*&' + params;
    return fetch(u).then(function (r) { return r.json(); });
  }

  function filePath(f) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/' +
      encodeURIComponent(String(f).split(' ').join('_')) + '?width=400';
  }

  function tester(u) {
    return new Promise(function (ok) {
      var im = new Image(), fin = false;
      function f(v) { if (!fin) { fin = true; ok(v); } }
      im.onload = function () { f(im.naturalWidth > 0); };
      im.onerror = function () { f(false); };
      setTimeout(function () { f(false); }, 20000);
      im.src = u;
    });
  }

  /* Source : photo officielle Wikidata */
  function p18(q) {
    if (!q) return Promise.resolve('');
    return api('www.wikidata.org', 'action=wbgetclaims&property=P18&entity=' + encodeURIComponent(q))
      .then(function (js) {
        var c = js && js.claims && js.claims.P18, v;
        if (!c || !c.length) return '';
        v = c[0].mainsnak && c[0].mainsnak.datavalue && c[0].mainsnak.datavalue.value;
        return v ? filePath(v) : '';
      })
      .catch(function () { return ''; });
  }

  /* Source : recherche sur un Wikipedia (en, fr, es, de, it, pt) */
  function rechercheWiki(lang, x) {
    return api(lang + '.wikipedia.org',
      'action=query&generator=search&gsrlimit=6&gsrnamespace=0' +
      '&prop=pageimages%7Cdescription%7Cpageprops&ppprop=wikibase_item&piprop=thumbnail&pithumbsize=400' +
      '&gsrsearch=' + encodeURIComponent(x.n))
      .then(function (js) {
        var pages = ((js && js.query && js.query.pages) || []).slice(), i, p, qids = [];
        pages.sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
        for (i = 0; i < pages.length; i++) {
          p = pages[i];
          if (!correspond(p.title, x.n)) continue;
          if (!estFoot(String(p.description || '') + ' ' + p.title)) continue;
          if (p.thumbnail && p.thumbnail.source) return p.thumbnail.source;
          if (p.pageprops && p.pageprops.wikibase_item) qids.push(p.pageprops.wikibase_item);
        }
        return qids.length ? p18(qids[0]) : '';
      })
      .catch(function () { return ''; });
  }

  /* Source : recherche Wikidata */
  function wikidataRecherche(x) {
    return api('www.wikidata.org',
      'action=wbsearchentities&type=item&language=en&uselang=en&limit=8&search=' + encodeURIComponent(x.n))
      .then(function (js) {
        var r = (js && js.search) || [], ok = [], i, j = 0;
        for (i = 0; i < r.length; i++) {
          if (estFoot(r[i].description) && correspond(r[i].label || '', x.n)) ok.push(r[i].id);
        }
        function essai() {
          if (j >= ok.length || j >= 3) return '';
          return p18(ok[j++]).then(function (u) { return u || essai(); });
        }
        return essai();
      })
      .catch(function () { return ''; });
  }

  /* Source : TheSportsDB (1 requete toutes les 2,2 secondes maximum) */
  var prochainSDB = 0;
  function sportsdb(x) {
    var maintenant = Date.now();
    var att = Math.max(0, prochainSDB - maintenant);
    prochainSDB = Math.max(maintenant, prochainSDB) + 2200;
    return new Promise(function (ok) { setTimeout(ok, att); })
      .then(function () {
        stats.requetes++;
        return fetch(SDB + encodeURIComponent(x.n.split(' ').join('_'))).then(function (r) { return r.json(); });
      })
      .then(function (js) {
        var l = (js && (js.player || js.players)) || [], i, p, u;
        for (i = 0; i < l.length; i++) {
          p = l[i];
          if (!p || String(p.strSport || '').toLowerCase() !== 'soccer') continue;
          if (!correspond(p.strPlayer, x.n)) continue;
          u = p.strCutout || p.strThumb || p.strRender;
          if (u) return u;
        }
        return '';
      })
      .catch(function () { return ''; });
  }

  /* Source : Wikimedia Commons (le nom complet doit etre dans le nom de la photo) */
  function commons(x) {
    var m = mots(x.n).filter(function (w) { return w.length > 2; });
    if (m.length < 2) return Promise.resolve('');
    return api('commons.wikimedia.org',
      'action=query&generator=search&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url&iiurlwidth=400' +
      '&gsrsearch=' + encodeURIComponent(x.n))
      .then(function (js) {
        var pages = (js && js.query && js.query.pages) || [], bons = [];
        pages.forEach(function (p) {
          var t = ' ' + norm(p.title) + ' ', lt = String(p.title || '').toLowerCase();
          var photo = lt.indexOf('.jpg') !== -1 || lt.indexOf('.jpeg') !== -1 || lt.indexOf('.png') !== -1 || lt.indexOf('.webp') !== -1;
          if (!photo || !p.imageinfo || !p.imageinfo[0]) return;
          var tous = m.every(function (w) { return t.indexOf(' ' + w + ' ') !== -1; });
          if (!tous) return;
          bons.push({
            s: /foot|soccer|match|training|fc|cf|afc|team|squad/.test(t) ? 0 : 1,
            i: p.index || 0,
            u: p.imageinfo[0].thumburl || p.imageinfo[0].url
          });
        });
        bons.sort(function (a, b) { return a.s - b.s || a.i - b.i; });
        return bons.length ? bons[0].u : '';
      })
      .catch(function () { return ''; });
  }

  /* On essaie toutes les sources, une par une, jusqu'a trouver une vraie photo */
  function chercherJoueur(x) {
    var l = [
      function () { return p18(x.q); },
      function () { return rechercheWiki('en', x); },
      function () { return rechercheWiki('fr', x); },
      function () { return wikidataRecherche(x); },
      function () { return sportsdb(x); },
      function () { return rechercheWiki('es', x); },
      function () { return rechercheWiki('de', x); },
      function () { return rechercheWiki('it', x); },
      function () { return rechercheWiki('pt', x); },
      function () { return commons(x); }
    ], i = 0;
    function suivant() {
      if (i >= l.length) return Promise.resolve('');
      var f = l[i];
      i++;
      return Promise.resolve().then(f).catch(function () { return ''; }).then(function (u) {
        if (!u) return suivant();
        return tester(u).then(function (ok) { return ok ? u : suivant(); });
      });
    }
    return suivant();
  }

  /* ========== FILES D'ATTENTE ========== */
  function fini(k, u, nom) {
    cache[k] = { u: u || '', t: Date.now() };
    sauver();
    delete enCours[k];
    if (u) { stats.photos++; delete manquants[k]; }
    else { stats.introuvables++; manquants[k] = nom || k; }
    var cartes = attente[k] || [];
    delete attente[k];
    if (u) cartes.forEach(function (card) { try { traiter(card); } catch (e) {} });
  }

  function viderTitres() {
    var lot = fileTitres.splice(0, 40);
    if (!lot.length) return;
    actifs++;
    var titres = lot.map(function (x) { return x.t; });
    api('en.wikipedia.org',
      'action=query&prop=pageimages%7Cpageprops&ppprop=wikibase_item&piprop=thumbnail&pithumbsize=400&pilimit=50&redirects=1' +
      '&titles=' + encodeURIComponent(titres.join('|')))
      .then(function (js) {
        var q = (js && js.query) || {}, alias = {}, img = {}, qid = {};
        (q.normalized || []).forEach(function (a) { alias[a.from] = a.to; });
        (q.redirects || []).forEach(function (a) { alias[a.from] = a.to; });
        (q.pages || []).forEach(function (p) {
          if (p.thumbnail && p.thumbnail.source) img[p.title] = p.thumbnail.source;
          if (p.pageprops && p.pageprops.wikibase_item) qid[p.title] = p.pageprops.wikibase_item;
        });
        lot.forEach(function (x) {
          var t = x.t, n = 0;
          while (alias[t] && n < 4) { t = alias[t]; n++; }
          if (img[t]) fini(x.k, img[t], x.n);
          else { x.q = qid[t] || ''; fileJoueurs.push(x); }
        });
      })
      .catch(function () {
        lot.forEach(function (x) { fileJoueurs.push(x); });
      })
      .then(function () {
        actifs--;
        pompe();
      });
  }

  function lancerJoueur() {
    var x = fileJoueurs.shift();
    if (!x) return;
    actifs++;
    chercherJoueur(x).then(function (u) {
      fini(x.k, u, x.n);
      actifs--;
      pompe();
    });
  }

  function pompe() {
    while (actifs < 3 && (fileTitres.length || fileJoueurs.length)) {
      if (fileTitres.length) viderTitres();
      else lancerJoueur();
    }
  }

  var tPompe = null;
  function demander(k, j, nm) {
    if (enCours[k]) return;
    enCours[k] = 1;
    var t = j && j.t ? j.t : '';
    var x = { k: k, n: t ? base(t) : (j && j.n ? j.n : nm), t: t, q: '' };
    if (!x.n) x.n = nm;
    if (t) fileTitres.push(x);
    else fileJoueurs.push(x);
    if (tPompe) return;
    tPompe = setTimeout(function () { tPompe = null; pompe(); }, 400);
  }

  /* ========== POSER LA PHOTO SUR LA CARTE ========== */
  function poser(card, u, k) {
    var ph = card.querySelector('.ph');
    if (!ph) {
      ph = document.createElement('div');
      ph.className = 'ph';
      card.insertBefore(ph, card.firstChild);
    }
    var img = document.createElement('img');
    img.setAttribute('data-fm', '1');
    img.setAttribute('data-fmk', k);
    img.alt = '';
    img.onload = function () {
      var ini = card.querySelector('.ini');
      if (ini) ini.style.display = 'none';
    };
    img.onerror = function () {
      if (img.parentNode) img.parentNode.removeChild(img);
      var ini = card.querySelector('.ini');
      if (ini) ini.style.display = '';
      delete cache[k];
      sauver();
    };
    img.src = u;
    ph.appendChild(img);
  }

  function texte(card, sel) {
    var e = card.querySelector(sel);
    return e ? String(e.textContent || '').trim() : '';
  }

  function traiter(card) {
    if (card.classList.contains('lock')) return;
    var nm = texte(card, '.nm');
    if (!nm) return;
    var tm = texte(card, '.tm');
    var k = norm(nm) + '|' + norm(tm);

    var imgs = card.querySelectorAll('img'), i, im, bonne = false;
    for (i = 0; i < imgs.length; i++) {
      im = imgs[i];
      if (im.getAttribute('data-fm') === '1') {
        if (im.getAttribute('data-fmk') === k && cache[k] && cache[k].u) return;
        if (im.parentNode) im.parentNode.removeChild(im);
        continue;
      }
      if (!im.getAttribute('src') || im.style.display === 'none') continue;
      if (im.complete && im.naturalWidth === 0) { im.style.display = 'none'; continue; }
      bonne = true;
    }
    if (bonne) return;

    var c = cache[k];
    if (c && c.u) { poser(card, c.u, k); return; }
    if (c && !c.u && Date.now() - c.t < REESSAI) return;
    if (!attente[k]) attente[k] = [];
    if (attente[k].indexOf(card) === -1) attente[k].push(card);
    if (window.fetch) demander(k, trouverJoueur(nm, tm), nm);
  }

  function scanner() {
    var cards = document.querySelectorAll('.card'), i;
    for (i = 0; i < cards.length; i++) {
      try { traiter(cards[i]); } catch (e) {}
    }
  }

  var tScan = null;
  function bientot() {
    if (tScan) return;
    tScan = setTimeout(function () { tScan = null; scanner(); }, 250);
  }

  function demarrer() {
    scanner();
    if (window.MutationObserver) {
      new MutationObserver(bientot).observe(document.body, { childList: true, subtree: true });
    }
    setInterval(scanner, 2000);
  }

  window.FOOT_IMG = {
    version: 2,
    stats: stats,
    manquants: function () {
      return Object.keys(manquants).map(function (k) { return manquants[k]; });
    },
    reessayer: function () {
      Object.keys(cache).forEach(function (k) { if (!cache[k].u) delete cache[k]; });
      try { localStorage.setItem(CLE, JSON.stringify(cache)); } catch (e) {}
      location.reload();
    },
    vider: function () {
      try { localStorage.removeItem(CLE); } catch (e) {}
      location.reload();
    }
  };

  if (document.body) demarrer();
  else document.addEventListener('DOMContentLoaded', demarrer);
})();
/* FIN foot-images.js */
