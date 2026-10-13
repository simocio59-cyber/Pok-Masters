// ===== jeu4.js : enchères, amis, échanges, onglet Plus, démarrage =====
const sortK=ks=>ks.sort((a,b)=>kr(b)-kr(a)||baseOf(keyId(a))-baseOf(keyId(b)));
let FRQ=[],TIN=[],TOUT=[],FC={},TW=null,AUC=null,animT=false;

/* ===== Navigation ===== */
function go(v){
 if(B&&v!=='battle')endBattle('hidden');
 cur=v;$$('.view').forEach(x=>x.classList.toggle('on',x.id==='v-'+v));
 $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 window.scrollTo(0,0);
 if(v==='booster')updatePack();if(v==='cards')renderCards();if(v==='battle')renderBattle();
 if(v==='auction')renderAuc();if(v==='friends'){FC={};renderReqs();renderFriends()}if(v==='more')renderMore();
}

/* ===== Enchères ===== */
const AUC_R=[2,3,3,4,4,5,5,6,7],BOTS=['Pierre','Ondine','Régis','Flora','Iris','Lino','Cynthia','Aurore','Tili','Max'];
const aucKey=()=>'pm_auc2_'+me.uid;
const nextBid=p=>Math.max(p+5,Math.ceil(p*1.08/5)*5);
async function newLot(){
 const r=pick(AUC_R),id=await pickIdOfRarity(r),sh=r<7&&rnd(16)===0,k=r===7?id+'x':id+(sh?'s':'');
 const base=ABASE[r]*(sh?3:1);
 return{k,r,price:Math.round(base*(.6+Math.random()*.2)/5)*5,cap:Math.round(base*(r>=5?1.5:2.5)),who:'',end:Date.now()+(3+rnd(6))*60000};
}
const saveAuc=()=>{try{localStorage.setItem(aucKey(),JSON.stringify(AUC))}catch(e){}};
async function loadAuc(){
 try{AUC=JSON.parse(localStorage.getItem(aucKey())||'null')}catch(e){AUC=null}
 if(!AUC||!Array.isArray(AUC.lots))AUC={lots:[]};
 AUC.lots=AUC.lots.filter(l=>l&&l.k&&!l.done);
 while(AUC.lots.length<4)AUC.lots.push(await newLot());
 await loadMetas(AUC.lots.map(l=>keyId(l.k)));saveAuc();if(cur==='auction')renderAuc();
}
const tLeft=e=>{const s=Math.max(0,Math.ceil((e-Date.now())/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function renderAuc(){
 if(!AUC||!U){$('#aucList').innerHTML='<p class="muted">Chargement des enchères…</p>';return}
 $('#aucList').innerHTML=AUC.lots.map((L,i)=>{
  const has=(U.cards||{})[L.k]>0,bid=L.who?nextBid(L.price):L.price,r=kr(L.k);
  return `<div class="box lot"><div>${pcard(L.k,0)}</div><div><b>${nameK(L.k)}</b><div style="color:${RC[r]};font-weight:800;font-size:13px">${RAR[r]} ${RNAME[r]}</div>
  <div style="font-size:12px;margin:4px 0;color:${has?'#4ade80':'#fde047'}">${has?'✅ Tu l\'as déjà':'🆕 Tu ne la possèdes pas encore !'}</div>
  <div>💰 <b>${fmt(L.price)} ${PD}</b></div><div class="muted">${L.who==='me'?'🙋 Tu mènes !':L.who?'🤖 '+esc(L.who)+' mène':'Aucune enchère'} · ⏱ <span data-end="${L.end}">${tLeft(L.end)}</span></div>
  <button class="${L.who==='me'?'bg':'bp'}" data-bid="${i}" style="width:100%;margin-top:6px" ${L.who==='me'?'disabled':''}>${L.who==='me'?'✅ Tu mènes':'Enchérir '+fmt(bid)+' '+PD}</button></div></div>`}).join('');
}
function bidAuc(i){
 const L=AUC.lots[i];if(!L||L.done||L.who==='me')return;
 const bid=L.who?nextBid(L.price):L.price;
 if((U.coins||0)<bid)return toast('Pas assez de Pokédollars');
 L.price=bid;L.who='me';if(L.end-Date.now()<20000)L.end+=15000;
 saveAuc();renderAuc();toast('Enchère placée ! 🔨');
}
async function finishLot(i){
 const L=AUC.lots[i];L.done=1;saveAuc();
 if(L.who==='me'){
  if((U.coins||0)>=L.price){try{await uref().update({coins:increment(-L.price),['cards.'+L.k]:increment(1)});toast(`🔨 Gagné : ${META[keyId(L.k)]?.n||'carte'} pour ${fmt(L.price)} ${PD} !`,3500)}catch(e){toast('Erreur de sauvegarde')}}
  else toast(`Pas assez de ${PD} pour payer l'enchère…`,3500);
 }
 const n=await newLot();await loadMetas([keyId(n.k)]);AUC.lots[i]=n;saveAuc();if(cur==='auction')renderAuc();
}
function tickAuc(){
 if(!AUC||!U)return;let ch=false;const now=Date.now();
 AUC.lots.forEach((L,i)=>{
  if(L.done)return;
  if(now>=L.end){finishLot(i);ch=true;return}
  const nb=nextBid(L.price);
  if((L.who==='me'&&Math.random()<.06&&nb<=L.cap)||(L.who!=='me'&&Math.random()<.008&&nb<=L.cap*.6)){
   const was=L.who==='me';L.price=L.who?nb:L.price;L.who=pick(BOTS);if(L.end-now<20000)L.end+=15000;ch=true;
   if(was)toast(`🤖 ${L.who} a surenchéri !`);
  }
 });
 if(ch){saveAuc();if(cur==='auction')renderAuc()}
 else if(cur==='auction')$$('[data-end]').forEach(s=>s.textContent=tLeft(+s.dataset.end));
}

/* ===== Amis ===== */
function badge(){const n=FRQ.length+TIN.length,b=$('#fBadge');b.textContent=n;b.style.display=n?'block':'none'}
async function genCode(){
 const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 for(let t=0;t<6;t++){let c='';for(let i=0;i<6;i++)c+=A[rnd(A.length)];
  const s=await db.collection('users').where('friendCode','==',c).limit(1).get();if(s.empty)return c}
 return 'P'+Date.now().toString(36).toUpperCase().slice(-5);
}
async function sendFR(){
 const c=$('#addCode').value.trim().toUpperCase();if(c.length<4)return toast('Entre le code de ton ami');
 if(c===U.friendCode)return toast("C'est ton propre code 😄");
 const s=await db.collection('users').where('friendCode','==',c).limit(1).get();
 if(s.empty)return toast('Code introuvable');
 const fu=s.docs[0].id;if((U.friends||[]).includes(fu))return toast('Vous êtes déjà amis');
 const back=FRQ.find(r=>r.from===fu);if(back)return acceptFR(back.id);
 await db.collection('friendRequests').doc(me.uid+'_'+fu).set({from:me.uid,fromName:U.pseudo||'Dresseur',to:fu,at:Date.now()});
 $('#addCode').value='';toast('Demande envoyée ! 📨');
}
async function acceptFR(id){
 const r=FRQ.find(x=>x.id===id);if(!r)return;const b=db.batch();
 b.update(uref(),{friends:arrayUnion(r.from)});b.update(db.collection('users').doc(r.from),{friends:arrayUnion(me.uid)});
 b.delete(db.collection('friendRequests').doc(id));
 try{await b.commit();toast('Nouvel ami ! 🎉')}catch(e){toast('Erreur, réessaie')}
}
const declineFR=id=>db.collection('friendRequests').doc(id).delete();
function removeFriend(fu){
 openSheet(`<h3>Retirer cet ami ?</h3><div class="row"><button onclick="closeSheet()">Annuler</button><button id="rmOk" class="br">Retirer</button></div>`);
 $('#rmOk').onclick=async()=>{const b=db.batch();b.update(uref(),{friends:arrayRemove(fu)});b.update(db.collection('users').doc(fu),{friends:arrayRemove(me.uid)});await b.commit();closeSheet();toast('Ami retiré')};
}
async function renderFriends(){
 const fl=U.friends||[];
 if(!fl.length){$('#frList').innerHTML='<p class="muted">Pas encore d\'ami. Partage ton code !</p>';return}
 const ds=await Promise.all(fl.map(u=>FC[u]!==undefined?FC[u]:db.collection('users').doc(u).get().then(s=>FC[u]=s.exists?s.data():null).catch(()=>null)));
 $('#frList').innerHTML=fl.map((u,i)=>{const d=ds[i];if(!d)return '';const c=d.cards||{},nb=Object.keys(c).filter(k=>c[k]>0).length;
  return `<div class="li"><div class="grow"><b>${esc(d.pseudo||'Dresseur')}</b><div class="muted">${nb} cartes différentes · vague ${d.bestWave||0}</div></div><button data-see="${u}">👁️</button><button class="bb" data-tr="${u}">🔄</button><button data-rm="${u}">❌</button></div>`}).join('');
}
async function seeFriend(fu){
 const s=await db.collection('users').doc(fu).get();if(!s.exists)return toast('Introuvable');
 const d=s.data(),sc=d.showcase||[],c=d.cards||{};await loadMetas(sc.map(keyId));
 const nb=Object.values(c).reduce((a,b)=>a+(b>0?b:0),0);
 openSheet(`<h3>⭐ Vitrine de ${esc(d.pseudo)}</h3><p class="muted">${nb} cartes · ${Object.keys(c).filter(k=>c[k]>0).length} différentes · Record : vague ${d.bestWave||0}</p><div class="cgrid">${sc.map(k=>pcard(k,0,{eager:true})).join('')||'<p class="muted">Vitrine vide</p>'}</div><div class="row" style="margin-top:12px"><button onclick="closeSheet()">Fermer</button><button class="bb" id="sfT">🔄 Échanger</button></div>`);
 $('#sfT').onclick=()=>tradeWizard(fu);
}

/* ===== Échanges ===== */
async function tradeWizard(fu){
 const s=await db.collection('users').doc(fu).get();if(!s.exists)return toast('Introuvable');
 const d=s.data(),fc=d.cards||{};
 openSheet('<div class="ctr" style="padding:30px"><div class="swirl" style="margin:auto"></div></div>',true);
 await loadMetas([...Object.keys(fc),...Object.keys(U.cards||{})].map(keyId));
 TW={fu,fname:d.pseudo||'Ami',fc,want:[],give:[],step:1};drawTW();
}
function drawTW(){
 const t=TW,st=t.step,mine=U.cards||{};
 let h=`<div class="muted">Étape ${st} / 3 · Échange avec <b>${esc(t.fname)}</b></div>`;
 if(st<3){
  const src=st===1?t.fc:mine,arr=st===1?t.want:t.give,ks=sortK(Object.keys(src).filter(k=>src[k]>0));
  h+=`<h3>${st===1?'🎯 Choisis les cartes que tu veux':'🎁 Choisis les cartes que tu donnes'} (5 max)</h3><div class="cgrid" id="twG">${ks.map(k=>pcard(k,src[k],{sel:arr.includes(k)})).join('')||'<p class="muted">Aucune carte</p>'}</div>
  <div class="row" style="position:sticky;bottom:-20px;background:#111a2e;padding:10px 0"><button id="twB">${st===1?'Annuler':'⬅️ Retour'}</button><button id="twN" class="bb">Suivant ➡️ (${arr.length})</button></div>`;
 }else{
  h+=`<h3>✨ Tu reçois</h3><div class="tlane">${t.want.map(k=>pcard(k,0)).join('')||'<span class="muted">Rien</span>'}</div><h3>🎁 Tu donnes</h3><div class="tlane">${t.give.map(k=>pcard(k,0)).join('')||'<span class="muted">Rien</span>'}</div>
  <div class="row" style="margin-top:14px"><button id="twB">⬅️ Retour</button><button id="twN" class="bp">📨 Envoyer</button></div>`;
 }
 openSheet(h,true);
 const g=$('#twG');if(g)g.onclick=e=>{const c=e.target.closest('.card');if(!c)return;const arr=st===1?t.want:t.give,k=c.dataset.k,i=arr.indexOf(k);
  if(i>=0)arr.splice(i,1);else{if(arr.length>=5)return toast('5 cartes max');arr.push(k)}c.classList.toggle('sel');$('#twN').textContent=`Suivant ➡️ (${arr.length})`};
 $('#twB').onclick=()=>{if(st===1){TW=null;closeSheet()}else{t.step--;drawTW()}};
 $('#twN').onclick=()=>{if(st<3){t.step++;drawTW()}else sendTrade()};
}
async function sendTrade(){
 const t=TW;if(!t.want.length&&!t.give.length)return toast('Choisis au moins une carte');
 if(t.give.some(k=>!((U.cards||{})[k]>0)))return toast("Tu n'as plus une de ces cartes");
 try{await db.collection('trades').add({from:me.uid,fromName:U.pseudo||'Dresseur',to:t.fu,toName:t.fname,give:t.give,want:t.want,status:'pending',at:Date.now()});
  TW=null;closeSheet();toast('Proposition envoyée ! 📨')}catch(e){toast('Erreur, réessaie')}
}
async function viewTrade(id){
 const t=TIN.find(x=>x.id===id);if(!t)return;await loadMetas([...t.give,...t.want].map(keyId));
 const ok=t.want.every(k=>(U.cards||{})[k]>0);
 openSheet(`<h3>🔄 Proposition de ${esc(t.fromName)}</h3><h3>✨ Tu reçois</h3><div class="tlane">${t.give.map(k=>pcard(k,0)).join('')||'<span class="muted">Rien</span>'}</div><h3>🎁 Tu donnes</h3><div class="tlane">${t.want.map(k=>pcard(k,0)).join('')||'<span class="muted">Rien</span>'}</div>
 ${ok?'':'<p class="ctr" style="color:#f87171">Tu n\'as plus toutes les cartes demandées.</p>'}<div class="row" style="margin-top:14px"><button id="tvNo" class="br">Refuser</button><button id="tvOk" class="bg" ${ok?'':'disabled'}>Accepter</button></div>`);
 $('#tvNo').onclick=async()=>{await db.collection('trades').doc(id).update({status:'declined'});closeSheet();toast('Échange refusé')};
 $('#tvOk').onclick=()=>acceptTrade(t);
}
async function acceptTrade(t){
 $('#tvOk').disabled=true;
 const tr=db.collection('trades').doc(t.id),ra=db.collection('users').doc(t.from),rb=uref();
 try{
  await db.runTransaction(async tx=>{
   const st=await tx.get(tr),sa=await tx.get(ra),sb=await tx.get(rb);
   if(!st.exists||st.data().status!=='pending')throw new Error('gone');
   const da={},dm={};
   t.give.forEach(k=>{da[k]=(da[k]||0)-1;dm[k]=(dm[k]||0)+1});
   t.want.forEach(k=>{dm[k]=(dm[k]||0)-1;da[k]=(da[k]||0)+1});
   const build=(d,delta)=>{const c=d.cards||{},up={},rm=[];
    for(const k in delta){const n=(c[k]||0)+delta[k];if(n<0)throw new Error('miss');if(n===0){up['cards.'+k]=deleteField();rm.push(k)}else up['cards.'+k]=n}
    if(rm.some(k=>(d.showcase||[]).includes(k)))up.showcase=arrayRemove(...rm);return up};
   const ua=build(sa.data(),da),ub=build(sb.data(),dm);
   tx.update(ra,ua);tx.update(rb,ub);tx.update(tr,{status:'done',doneAt:Date.now()});
  });
 }catch(e){
  closeSheet();
  if(e.message==='miss'){toast('Une des cartes n\'est plus disponible');tr.update({status:'declined'}).catch(()=>{})}
  else if(e.message==='gone')toast('Cet échange n\'existe plus');else toast('Erreur, réessaie');
  return;
 }
 closeSheet();await tradeAnim(t.want,t.give,t.fromName);
}
async function tradeAnim(send,get,who){
 animT=true;const f=$('#tfx');
 if(send.length){
  f.innerHTML=`<div class="fxmsg">🔄 Échange avec ${esc(who)}</div><div class="tlane" id="tS">${send.map(k=>pcard(k,0,{eager:true})).join('')}</div><div class="muted">Tu envoies…</div>`;f.classList.add('on');
  await sleep(700);$$('#tS .card').forEach((c,i)=>{c.style.animationDelay=i*.12+'s';c.classList.add('tup')});await sleep(1800);
 }
 f.innerHTML=`<div class="fxmsg" style="--c:#f0abfc">✨ Tu reçois de ${esc(who)} !</div><div class="tlane">${get.map((k,i)=>pcard(k,0,{eager:true}).replace('class="card','style="animation-delay:'+(i*.15)+'s" class="tdown card')).join('')||'<span class="muted">Rien (c\'était un cadeau !)</span>'}</div><button id="tOk" class="bp" style="min-width:200px">Super !</button>`;
 f.classList.add('on');burst('#f0abfc',4,f);
 await new Promise(r=>$('#tOk').onclick=r);
 f.classList.remove('on');f.innerHTML='';animT=false;checkDoneTrades();
}
async function checkDoneTrades(){
 if(animT)return;const sk='pm_seen_'+me.uid;let seen=[];try{seen=JSON.parse(localStorage.getItem(sk)||'[]')}catch(e){}
 for(const t of TOUT){
  if(t.status==='declined'){toast(`${t.toName} a refusé ton échange`);db.collection('trades').doc(t.id).delete().catch(()=>{});continue}
  if(t.status==='done'&&!seen.includes(t.id)){
   seen.push(t.id);localStorage.setItem(sk,JSON.stringify(seen.slice(-50)));
   await loadMetas([...t.give,...t.want].map(keyId));
   db.collection('trades').doc(t.id).delete().catch(()=>{});
   return tradeAnim(t.give,t.want,t.toName);
  }
 }
}
function renderReqs(){
 const mini=ks=>ks.map(k=>`<img src="${SPR(keyId(k))}" style="width:30px;height:30px;vertical-align:middle" alt="">`).join('')||'rien';
 $('#frReq').innerHTML=FRQ.length?`<div class="box"><h3>📩 Demandes d'ami</h3>${FRQ.map(r=>`<div class="li"><div class="grow"><b>${esc(r.fromName)}</b></div><button class="bg" data-a="${r.id}">Accepter</button><button data-d="${r.id}">Refuser</button></div>`).join('')}</div>`:'';
 $('#trIn').innerHTML=TIN.length?`<div class="box"><h3>🔄 Échanges reçus</h3>${TIN.map(t=>`<div class="li"><div class="grow"><b>${esc(t.fromName)}</b><div class="muted">Te donne ${mini(t.give)} contre ${mini(t.want)}</div></div><button class="bb" data-t="${t.id}">Voir</button></div>`).join('')}</div>`:'';
 const po=TOUT.filter(t=>t.status==='pending');
 $('#trOut').innerHTML=po.length?`<div class="box"><h3>⏳ Mes propositions</h3>${po.map(t=>`<div class="li"><div class="grow"><b>${esc(t.toName)}</b><div class="muted">Tu donnes ${mini(t.give)} contre ${mini(t.want)}</div></div><button data-c="${t.id}">Annuler</button></div>`).join('')}</div>`:'';
 badge();
}

/* ===== Onglet Plus ===== */
function renderMore(){
 const p=$('#pseudo');if(document.activeElement!==p)p.value=U.pseudo||'';
 const sc=U.showcase||[];
 $('#showG').innerHTML=sc.map(k=>pcard(k,0)).join('')||'<p class="muted">Vitrine vide</p>';
 $('#odds').innerHTML=RNAME.map((n,i)=>`<div><span style="color:${RC[i]};font-weight:800">${RAR[i]} ${n}</span><b>${String(ODDS[i]).replace('.',',')} %</b></div>`).join('')+`<div><span>✨ Shiny</span><b>1 / ${SHINY}</b></div>`;
 const c=U.cards||{},ks=Object.keys(c).filter(k=>c[k]>0);
 $('#myStats').innerHTML=`🃏 ${ks.reduce((a,k)=>a+c[k],0)} cartes · ${new Set(ks.map(keyId)).size} Pokémon différents<br>✨ ${ks.filter(keySh).length} shiny · 🌈 ${ks.filter(keyEx).length} EX<br>🏆 Record combat : vague ${U.bestWave||0}`;
}
async function savePseudo(){
 const v=$('#pseudo').value.trim();if(v.length<2)return toast('2 caractères minimum');
 await uref().update({pseudo:v.slice(0,16)});toast('Pseudo enregistré ✅');
}
async function usePromo(){
 const c=$('#promo').value.trim().toUpperCase(),v=PROMO[c];if(!v)return toast('Code invalide');
 try{await db.runTransaction(async tx=>{const s=await tx.get(uref());if((s.data().usedCodes||[]).includes(c))throw new Error('used');tx.update(uref(),{coins:increment(v),usedCodes:arrayUnion(c)})});
  $('#promo').value='';toast(`🎁 +${v} ${PD} !`)}
 catch(e){toast(e.message==='used'?'Code déjà utilisé sur ce compte':'Erreur, réessaie')}
}

/* ===== Démarrage ===== */
let firstSnap=true;
function onUser(){
 renderTop();updatePack();$('#myCode').textContent=U.friendCode||'…';
 if(firstSnap){firstSnap=false;$('#loading').hidden=true;$('#login').hidden=true;$('#app').hidden=false;go('booster');return}
 if(cur==='cards')renderCards();if(cur==='battle')renderBattle();if(cur==='more')renderMore();if(cur==='friends')renderFriends();
}
async function startApp(user){
 me=user;const ref=uref(),s=await ref.get();
 if(!s.exists){
  await ref.set({pseudo:(user.displayName||'Dresseur').split(' ')[0].slice(0,16),coins:300,boosters:BOOST_MAX,lastBoost:Date.now(),cards:{},showcase:[],friends:[],bestWave:0,friendCode:await genCode(),usedCodes:[]});
 }else{
  const d=s.data(),up={};
  if('email' in d)up.email=deleteField();if(!d.friendCode)up.friendCode=await genCode();
  if((d.boosters||0)>BOOST_MAX)up.boosters=BOOST_MAX;if(!d.pseudo)up.pseudo='Dresseur';
  if(Object.keys(up).length)await ref.update(up);
 }
 ref.onSnapshot(d=>{U=d.data()||{};onUser()});
 db.collection('friendRequests').where('to','==',me.uid).onSnapshot(s=>{FRQ=s.docs.map(d=>({id:d.id,...d.data()}));renderReqs()});
 db.collection('trades').where('to','==',me.uid).onSnapshot(s=>{TIN=s.docs.map(d=>({id:d.id,...d.data()})).filter(t=>t.status==='pending');renderReqs()});
 db.collection('trades').where('from','==',me.uid).onSnapshot(s=>{TOUT=s.docs.map(d=>({id:d.id,...d.data()}));renderReqs();checkDoneTrades()});
 loadAuc();
}

/* ===== Boutons ===== */
initFilters();initBattle();
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b&&U)go(b.dataset.v)};
$('#sheetBg').onclick=e=>{if(e.target.id==='sheetBg'&&!sheetLock)closeSheet()};
$('#openBtn').onclick=()=>openBooster(false);$('#buyBtn').onclick=buyConfirm;
$('#pack').onclick=()=>{if(opening)return;if(boostState().n>0)openBooster(false);else buyConfirm()};
$('#aucList').onclick=e=>{const b=e.target.closest('[data-bid]');if(b)bidAuc(+b.dataset.bid)};
$('#addBtn').onclick=sendFR;
$('#v-friends').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.a)acceptFR(d.a);else if(d.d)declineFR(d.d);else if(d.t)viewTrade(d.t);
 else if(d.c)db.collection('trades').doc(d.c).delete().then(()=>toast('Proposition annulée'));
 else if(d.see)seeFriend(d.see);else if(d.tr)tradeWizard(d.tr);else if(d.rm)removeFriend(d.rm)});
$('#pseudoBtn').onclick=savePseudo;$('#promoBtn').onclick=usePromo;
$('#showG').onclick=e=>{const c=e.target.closest('.card');if(c)toggleShow(c.dataset.k)};
$('#logout').onclick=async()=>{if(B)await endBattle('quit');await auth.signOut();location.reload()};
$('#loginBtn').onclick=()=>{const p=new firebase.auth.GoogleAuthProvider();
 auth.signInWithPopup(p).catch(e=>{const c=e.code||'';if(c.includes('popup-blocked')||c.includes('not-supported'))auth.signInWithRedirect(p);else if(!c.includes('closed-by-user')&&!c.includes('cancelled'))toast('Erreur : '+c)})};
setInterval(()=>{if(!U)return;renderTop();if(cur==='booster'&&!opening)updatePack();tickAuc()},1000);
auth.getRedirectResult().catch(()=>{});
auth.onAuthStateChanged(u=>{
 if(u){if(!started){started=true;startApp(u).catch(e=>{console.error(e);$('#loading p').textContent='⚠️ Erreur : '+(e.message||e)})}}
 else{$('#loading').hidden=true;$('#app').hidden=true;$('#login').hidden=false}
});
window.P4=1;
// ===== FIN jeu4.js =====
