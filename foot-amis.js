// ===== foot-amis.js : amis et échanges (FootMasters) =====
(function(){
'use strict';
const FM=window.FM;
if(!FM){console.warn('[Amis] foot-jeu.js pas chargé');return}
const $=s=>document.querySelector(s),$$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=FM.esc,MAXC=5,ALPH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function codeOf(uid){let a=0x811c9dc5,b=5381;for(let i=0;i<uid.length;i++){const c=uid.charCodeAt(i);a=Math.imul(a^c,16777619)>>>0;b=(Math.imul(b,33)+c)>>>0}
  let s='';for(let i=0;i<6;i++){const v=i<3?a>>>(i*5):b>>>((i-3)*5);s+=ALPH[v&31]}return s}
let U=null,code='',links=[],inc=[],out=[],subs=[],err='';const fin=new Set();
function db(){return FM.db}
function myName(){return (U&&(U.displayName||(U.email||'').split('@')[0]))||'Joueur'}
function onErr(e){console.warn('[Amis]',e);if(e&&e.code==='permission-denied')err='rules';else if(e&&e.message)err=e.message;refresh()}
function badge(){const b=$('#amiBadge');if(!b)return;const n=inc.filter(t=>t.status==='pending').length;b.textContent=n;b.style.display=n?'inline-block':'none'}
function refresh(){badge();if(FM.cur==='ami')render()}
function stop(){subs.forEach(f=>{try{f()}catch(e){}});subs=[];links=[];inc=[];out=[]}
function docs(s){return s.docs.map(d=>Object.assign({id:d.id},d.data()))}
function start(u){stop();U=u||null;err='';code=U?codeOf(U.uid):'';
  if(!U||!db()){refresh();return}
  pub();
  subs.push(db().collection('footLinks').where('users','array-contains',U.uid).onSnapshot(s=>{links=docs(s);refresh()},onErr));
  subs.push(db().collection('footTrades').where('to','==',U.uid).onSnapshot(s=>{inc=docs(s);refresh()},onErr));
  subs.push(db().collection('footTrades').where('from','==',U.uid).onSnapshot(s=>{out=docs(s);
    out.forEach(t=>{if(!t.fromDone&&(t.status==='accepted'||t.status==='refused'))finalize(t.id)});refresh()},onErr));
  refresh()}
function pub(){if(!U||!db())return;
  db().collection('footCodes').doc(code).set({uid:U.uid,name:myName(),col:JSON.stringify(FM.S.col),t:Date.now()},{merge:true}).catch(onErr)}
function addCard(id,n){const S=FM.S;S.col[id]=Math.max(0,(S.col[id]||0)+n)}
function after(){FM.save();pub();FM.render()}
function pname(id){return FM.BY[id]?FM.BY[id].n:id}

// ----- Échanges -----
function send(f,give,want){const S=FM.S;
  for(const id of give)if(!(S.col[id]>0)){FM.toast('Tu n\'as plus '+esc(pname(id)));return}
  give.forEach(id=>addCard(id,-1));FM.save();FM.render();
  db().collection('footTrades').add({from:U.uid,fromName:myName(),to:f.uid,toName:f.name,give:give,want:want,status:'pending',fromDone:false,t:Date.now()})
  .then(()=>{pub();FM.toast(want.length?'📨 Proposition envoyée à <b>'+esc(f.name)+'</b>':'🎁 Cadeau envoyé à <b>'+esc(f.name)+'</b>')})
  .catch(e=>{give.forEach(id=>addCard(id,1));FM.save();FM.render();onErr(e)})}
function accept(t){const S=FM.S,miss=(t.want||[]).filter(id=>!(S.col[id]>0));
  if(miss.length){FM.toast('Tu n\'as plus : '+miss.map(id=>esc(pname(id))).join(', '));return}
  const ref=db().collection('footTrades').doc(t.id);
  db().runTransaction(tx=>tx.get(ref).then(s=>{const d=s.data();if(!d||d.status!=='pending')throw {code:'gone'};tx.update(ref,{status:'accepted',doneT:Date.now()});return d}))
  .then(d=>{(d.want||[]).forEach(x=>addCard(x,-1));(d.give||[]).forEach(x=>addCard(x,1));after();FM.toast('✅ C\'est fait ! Les cartes sont dans ta collection.')})
  .catch(e=>{if(e&&e.code==='gone')FM.toast('Cette proposition n\'est plus disponible');else onErr(e)})}
function refuse(t){const ref=db().collection('footTrades').doc(t.id);
  db().runTransaction(tx=>tx.get(ref).then(s=>{const d=s.data();if(!d||d.status!=='pending')throw {code:'gone'};tx.update(ref,{status:'refused',doneT:Date.now()})}))
  .then(()=>FM.toast('❌ Proposition refusée')).catch(e=>{if(e&&e.code==='gone')FM.toast('Cette proposition n\'est plus disponible');else onErr(e)})}
function cancel(t){const ref=db().collection('footTrades').doc(t.id);
  db().runTransaction(tx=>tx.get(ref).then(s=>{const d=s.data();if(!d||d.status!=='pending'||d.fromDone)throw {code:'gone'};tx.update(ref,{status:'cancelled',fromDone:true,doneT:Date.now()});return d}))
  .then(d=>{(d.give||[]).forEach(x=>addCard(x,1));after();FM.toast('↩️ Proposition annulée, tes cartes te sont rendues')})
  .catch(e=>{if(e&&e.code==='gone')FM.toast('Ton ami a déjà répondu');else onErr(e)})}
function finalize(id){if(fin.has(id))return;fin.add(id);const ref=db().collection('footTrades').doc(id);
  db().runTransaction(tx=>tx.get(ref).then(s=>{const d=s.data();if(!d||d.fromDone||(d.status!=='accepted'&&d.status!=='refused'))return null;tx.update(ref,{fromDone:true});return d}))
  .then(d=>{if(!d)return;const who='<b>'+esc(d.toName||'Ton ami')+'</b>';
    if(d.status==='accepted'){(d.want||[]).forEach(x=>addCard(x,1));FM.toast((d.want||[]).length?'🎉 '+who+' a accepté ton échange !':'🎁 '+who+' a accepté ton cadeau !')}
    else{(d.give||[]).forEach(x=>addCard(x,1));FM.toast('↩️ '+who+' a refusé : tes cartes te sont rendues')}
    after()})
  .catch(onErr).then(()=>fin.delete(id))}

// ----- Amis -----
function friends(){if(!U)return[];return links.map(l=>{const fid=(l.users||[]).find(x=>x!==U.uid);return{uid:fid,name:(l.names||{})[fid]||'Ami',link:l.id}}).filter(f=>f.uid)}
async function addFriend(){const inp=$('#aCode');const c=(inp.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(c.length!==6){FM.toast('Le code doit faire 6 caractères');return}
  if(c===code){FM.toast('C\'est ton propre code 😄');return}
  try{const s=await db().collection('footCodes').doc(c).get();
    if(!s.exists){FM.toast('Code inconnu. Ton ami doit se connecter au jeu une fois.');return}
    const f=s.data();if(links.some(l=>(l.users||[]).includes(f.uid))){FM.toast('Vous êtes déjà amis 👍');return}
    const id=[U.uid,f.uid].sort().join('_'),names={};names[U.uid]=myName();names[f.uid]=f.name||'Ami';
    await db().collection('footLinks').doc(id).set({users:[U.uid,f.uid],names:names,t:Date.now()});
    inp.value='';FM.toast('✅ <b>'+esc(f.name||'Ami')+'</b> ajouté à tes amis !')}catch(e){onErr(e)}}
async function friendCol(fid){
  try{if(FM.colName){const s=await db().collection(FM.colName).doc(fid).get();const d=s.exists?s.data():null;if(d&&d.foot)return JSON.parse(d.foot).col||{}}}catch(e){}
  try{const s=await db().collection('footCodes').doc(codeOf(fid)).get();const d=s.exists?s.data():null;if(d&&d.col)return JSON.parse(d.col)}catch(e){}
  return null}

// ----- Choix des cartes -----
async function picker(f,gift){let fc={};
  if(!gift){FM.modal('<p class="center">⏳ Chargement de la collection de <b>'+esc(f.name)+'</b>…</p>');fc=await friendCol(f.uid);
    if(!fc){FM.modal('<p class="center">Impossible de lire la collection de <b>'+esc(f.name)+'</b>.<br><small>Il doit s\'être connecté au moins une fois.</small></p><div class="row"><button class="btn sec" id="pX">Fermer</button></div>');$('#pX').onclick=FM.closeModal;return}}
  const sel={g:[],w:[]},q={g:'',w:''};
  function sec(k,t){return '<p><b>'+t+'</b> <span class="muted">(max '+MAXC+') · <span id="n'+k+'">0</span> choisie(s)</span></p><input class="inp" id="q'+k+'" placeholder="🔎 Joueur ou club"><div class="tgrid" id="g'+k+'"></div>'}
  FM.modal('<h2 class="center">'+(gift?'🎁 Cadeau pour ':'🔁 Échange avec ')+esc(f.name)+'</h2>'+sec('g','Tu donnes')+(gift?'':sec('w','Tu reçois'))+
    '<div class="row"><button class="btn sec" id="pX">Annuler</button><button class="btn" id="pOk" disabled>'+(gift?'Envoyer le cadeau':'Proposer')+'</button></div>');
  function upd(){$('#ng').textContent=sel.g.length;if(!gift)$('#nw').textContent=sel.w.length;$('#pOk').disabled=!(sel.g.length&&(gift||sel.w.length))}
  function grid(k){const col=k==='g'?FM.S.col:fc,el=$('#g'+k);if(!el)return;const s=q[k].trim().toLowerCase();
    let ids=Object.keys(col).filter(id=>col[id]>0&&FM.BY[id]);
    if(s)ids=ids.filter(id=>{const p=FM.BY[id];return (p.n+' '+p.t.n).toLowerCase().includes(s)});
    ids.sort((a,b)=>(sel[k].includes(b)-sel[k].includes(a))||FM.BY[b].note-FM.BY[a].note);
    const tot=ids.length;ids=ids.slice(0,60);
    el.innerHTML=ids.length?ids.map(id=>'<div class="tpick'+(sel[k].includes(id)?' sel':'')+'" data-id="'+id+'">'+FM.cardHTML(FM.BY[id],{cnt:col[id]})+'</div>').join('')+
      (tot>60?'<p class="muted" style="grid-column:1/-1">… utilise la recherche pour voir les autres</p>':''):'<p class="muted" style="grid-column:1/-1">Aucune carte</p>';
    FM.loadImgs(el);
    $$('.tpick',el).forEach(d=>d.onclick=()=>{const id=d.dataset.id,a=sel[k],i=a.indexOf(id);
      if(i>=0)a.splice(i,1);else{if(a.length>=MAXC){FM.toast('Maximum '+MAXC+' cartes');return}a.push(id)}
      d.classList.toggle('sel');upd()})}
  (gift?['g']:['g','w']).forEach(k=>{grid(k);$('#q'+k).oninput=e=>{q[k]=e.target.value;grid(k)}});
  $('#pX').onclick=FM.closeModal;
  $('#pOk').onclick=()=>{const g=sel.g.slice(),w=gift?[]:sel.w.slice();FM.closeModal();send(f,g,w)}}

// ----- Affichage -----
function mini(ids){return '<div class="mini">'+(ids||[]).map(id=>FM.BY[id]?'<div>'+FM.cardHTML(FM.BY[id])+'</div>':'').join('')+'</div>'}
function histTxt(t){const mine=t.from===U.uid,o=esc((mine?t.toName:t.fromName)||'Ami'),g=!(t.want||[]).length;
  if(t.status==='accepted')return '✅ '+(g?(mine?'Cadeau envoyé à ':'Cadeau reçu de '):'Échange réussi avec ')+o;
  if(t.status==='refused')return '❌ '+(mine?o+' a refusé ta proposition':'Tu as refusé la proposition de '+o);
  return '↩️ '+(mine?'Tu as annulé ta proposition à ':'Proposition annulée par ')+o}
function render(){const el=$('#tab-ami');if(!el)return;badge();
  if(!FM.db){el.innerHTML='<div class="box center">⏳ Connexion en cours… (si ça dure, regarde l\'onglet 👤 Profil)</div>';return}
  if(!U){el.innerHTML='<div class="box center"><p>👥 Connecte-toi avec Google pour ajouter des amis et échanger des cartes.</p><button class="btn" id="goPro">Aller dans 👤 Profil</button></div>';$('#goPro').onclick=()=>FM.show('pro');return}
  const keep=$('#aCode')?$('#aCode').value:'';
  let h='';
  if(err==='rules')h+='<div class="box" style="border-color:#b71c1c"><b>⚠️ Firebase bloque les amis.</b><p class="muted">Il faut publier les règles Firestore (Firebase → Firestore Database → Règles).</p></div>';
  else if(err)h+='<div class="box muted">⚠️ '+esc(err)+'</div>';
  h+='<div class="box center"><p class="muted">Ton code ami</p><div class="fcode">'+code+'</div><button class="btn sec" id="cpy">📋 Copier</button>'+
    '<p class="muted" style="margin-top:14px">Ajouter un ami avec son code :</p><div class="row" style="margin-top:4px"><input class="inp" id="aCode" maxlength="6" placeholder="Ex : AB12CD" style="max-width:160px;text-transform:uppercase;margin:0"><button class="btn" id="aAdd">Ajouter</button></div></div>';
  const pin=inc.filter(t=>t.status==='pending').sort((a,b)=>b.t-a.t);
  if(pin.length)h+='<h2>📥 Propositions reçues</h2>'+pin.map(t=>'<div class="box"><p><b>'+esc(t.fromName||'Un ami')+'</b> '+((t.want||[]).length?'te propose un échange':'t\'offre un cadeau 🎁')+'</p>'+
    '<p class="muted">Tu reçois :</p>'+mini(t.give)+((t.want||[]).length?'<p class="muted">Tu donnes :</p>'+mini(t.want):'')+
    '<div class="row"><button class="btn sec" data-ref="'+t.id+'">Refuser</button><button class="btn" data-acc="'+t.id+'">Accepter</button></div></div>').join('');
  const fr=friends();
  h+='<h2>👥 Mes amis ('+fr.length+')</h2>';
  h+=fr.length?fr.map(f=>'<div class="frow"><b>'+esc(f.name)+'</b><span><button class="btn" data-tr="'+f.uid+'">🔁 Échanger</button> <button class="btn sec" data-gf="'+f.uid+'">🎁</button> <button class="btn sec" data-rm="'+f.uid+'">✖</button></span></div>').join('')
    :'<div class="box muted center">Pas encore d\'ami. Donne ton code à un ami et ajoute le sien !</div>';
  const pout=out.filter(t=>t.status==='pending').sort((a,b)=>b.t-a.t);
  if(pout.length)h+='<h2>📤 En attente de réponse</h2>'+pout.map(t=>'<div class="box"><p>Pour <b>'+esc(t.toName||'Ami')+'</b></p><p class="muted">Tu donnes :</p>'+mini(t.give)+
    ((t.want||[]).length?'<p class="muted">Tu demandes :</p>'+mini(t.want):'<p class="muted">🎁 Cadeau</p>')+
    '<div class="row"><button class="btn sec" data-can="'+t.id+'">Annuler</button></div></div>').join('');
  const hist=inc.concat(out).filter(t=>t.status!=='pending').sort((a,b)=>(b.doneT||b.t)-(a.doneT||a.t)).slice(0,6);
  if(hist.length)h+='<h2>📜 Historique</h2><div class="box">'+hist.map(t=>'<div class="hist">'+histTxt(t)+'</div>').join('')+'</div>';
  el.innerHTML=h;FM.loadImgs(el);
  const inp=$('#aCode');inp.value=keep;
  $('#cpy').onclick=()=>{if(navigator.clipboard)navigator.clipboard.writeText(code).then(()=>FM.toast('📋 Code copié : <b>'+code+'</b>'),()=>FM.toast('Ton code : <b>'+code+'</b>'));else FM.toast('Ton code : <b>'+code+'</b>')};
  $('#aAdd').onclick=addFriend;inp.onkeydown=e=>{if(e.key==='Enter')addFriend()};
  const byId=(arr,id)=>arr.find(x=>x.id===id),fOf=uid=>fr.find(x=>x.uid===uid);
  $$('[data-acc]',el).forEach(b=>b.onclick=()=>{const t=byId(inc,b.dataset.acc);if(t)accept(t)});
  $$('[data-ref]',el).forEach(b=>b.onclick=()=>{const t=byId(inc,b.dataset.ref);if(t)FM.ask('Refuser cette proposition ?',()=>refuse(t))});
  $$('[data-can]',el).forEach(b=>b.onclick=()=>{const t=byId(out,b.dataset.can);if(t)FM.ask('Annuler ta proposition ?',()=>cancel(t))});
  $$('[data-tr]',el).forEach(b=>b.onclick=()=>{const f=fOf(b.dataset.tr);if(f)picker(f,false)});
  $$('[data-gf]',el).forEach(b=>b.onclick=()=>{const f=fOf(b.dataset.gf);if(f)picker(f,true)});
  $$('[data-rm]',el).forEach(b=>b.onclick=()=>{const f=fOf(b.dataset.rm);if(f)FM.ask('Retirer <b>'+esc(f.name)+'</b> de tes amis ?',()=>db().collection('footLinks').doc(f.link).delete().then(()=>FM.toast('Ami retiré')).catch(onErr))});
}

window.FOOT_AMIS={render:render,code:()=>code};
FM.onUser.push(start);
if(FM.user)start(FM.user);
})();
// ===== FIN foot-amis.js =====
