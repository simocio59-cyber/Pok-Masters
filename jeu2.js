// ===== jeu2.js : onglet Cartes + moteur de combat =====
// makeQ(lvl) est dans jeu3.js. Elle renvoie {cat,text,img:{id,mode}|null,opts:[{label,img}],ans,long,expl,extra}

/* ===== Onglet Cartes ===== */
function initFilters(){
 $('#cfR').innerHTML='<option value="">Toutes raretés</option>'+RNAME.map((n,i)=>`<option value="${i}">${RAR[i]} ${n}</option>`).join('');
 $('#cfG').innerHTML='<option value="">Toutes générations</option>'+GENS.map((g,i)=>`<option value="${i+1}">Gén. ${i+1} · ${g[2]}</option>`).join('');
 $('#cfT').innerHTML='<option value="">Tous les types</option>'+TK.map(t=>`<option value="${t}">${tn(t)}</option>`).join('');
 $('#cfS').innerHTML='<option value="num">Tri : numéro</option><option value="rar">Tri : rareté</option><option value="cnt">Tri : quantité</option>';
 ['#cq','#cfR','#cfG','#cfT','#cfS'].forEach(s=>{$(s).addEventListener('input',renderCards);$(s).addEventListener('change',renderCards)});
 const seg=m=>{cMode=m;$('#segMine').classList.toggle('on',m==='mine');$('#segDex').classList.toggle('on',m==='dex');renderCards()};
 $('#segMine').onclick=()=>seg('mine');$('#segDex').onclick=()=>seg('dex');
 $('#sellDups').onclick=sellAllDups;
 $('#cgrid').onclick=e=>{const c=e.target.closest('.card');if(!c)return;if(c.classList.contains('miss'))missingModal(+c.dataset.k);else cardModal(c.dataset.k)};
}
function renderCards(){
 if(!U)return;
 const q=norm($('#cq').value.trim()),fr=$('#cfR').value,fg=$('#cfG').value,ft=$('#cfT').value,so=$('#cfS').value,c=U.cards||{};
 const okF=(id,r)=>{const m=META[id];if(q&&!((m&&norm(m.n).includes(q))||String(baseOf(id))===q.replace(/^#?0*/,'')))return false;if(fr!==''&&r!==+fr)return false;if(fg&&genOf(id)!==+fg)return false;if(ft&&!(m&&m.t.includes(ft)))return false;return true};
 $('#sellDups').hidden=cMode!=='mine';
 if(cMode==='mine'){
  let ks=Object.keys(c).filter(k=>c[k]>0);
  const miss=needMetas(ks);if(miss.length)loadMetas(miss).then(()=>{if(cur==='cards')renderCards()});
  const tot=ks.reduce((a,k)=>a+c[k],0);
  ks=ks.filter(k=>okF(keyId(k),kr(k)));
  ks.sort(so==='rar'?(a,b)=>kr(b)-kr(a)||baseOf(keyId(a))-baseOf(keyId(b)):so==='cnt'?(a,b)=>c[b]-c[a]:(a,b)=>baseOf(keyId(a))-baseOf(keyId(b))||keyId(a)-keyId(b)||(a<b?-1:1));
  $('#cStats').textContent=`${ks.length} affichée(s) · ${tot} cartes au total`;
  $('#cgrid').innerHTML=ks.map(k=>pcard(k,c[k])).join('')||'<p class="muted">Aucune carte ici. Ouvre des boosters !</p>';
 }else{
  const own={};Object.keys(c).forEach(k=>{if(c[k]>0){const id=keyId(k);if(!own[id]||kr(k)>kr(own[id])||keySh(k))own[id]=k}});
  const ids=DEX.filter(id=>okF(id,rarityOf(id)));
  $('#cStats').textContent=`${Object.keys(own).length} / ${DEX.length} Pokémon découverts`;
  $('#cgrid').innerHTML=ids.map(id=>own[id]?pcard(own[id],0):missingCard(id)).join('');
 }
}
async function cardModal(k){
 const id=keyId(k);await withTO(getMeta(id),5000);
 const n=(U.cards||{})[k]||0,m=META[id],r=kr(k),inS=(U.showcase||[]).includes(k);
 const st=m?m.s.map((v,i)=>`<div class="sb"><span>${SN6[i]}</span><b>${v}</b><span><i style="width:${Math.min(100,v/1.8)}%"></i></span></div>`).join(''):'';
 openSheet(`${pcard(k,n,{big:true,eager:true})}<p class="ctr"><b style="color:${RC[r]}">${RNAME[r]}${keySh(k)?' · Shiny ✨':''}</b><br><span class="muted">${m?'Génération '+genOf(id)+' ('+GENS[genOf(id)-1][2]+') · ':''}Tu en as ×${n}</span></p><div class="box">${st}<div class="muted" style="margin-top:6px">${m&&m.h?`Taille ${m.h/10} m · Poids ${m.w/10} kg`:''}</div></div><div class="row"><button id="cmShow">${inS?'Retirer de la vitrine':'⭐ Vitrine'}</button><button id="cmSell" class="bg" ${n<1?'disabled':''}>Vendre 1 · +${sellPrice(k)} ${PD}</button></div>`);
 $('#cmShow').onclick=()=>toggleShow(k);$('#cmSell').onclick=()=>sellOne(k);
}
async function missingModal(id){await withTO(getMeta(id),5000);const m=META[id],r=rarityOf(id);
 openSheet(`<div class="card miss big" style="--rc:${RC[r]}"><div class="num">#${pad(baseOf(id))}</div><img src="${IMG(id)}" alt=""><div class="nm">${m?esc(m.n):'???'}</div><div class="rr">${RAR[r]}</div></div><p class="ctr">Tu n'as pas encore ce Pokémon.<br><b style="color:${RC[r]}">${RNAME[r]}</b> · ${ODDS[r]} % par carte</p><p class="ctr muted">Ouvre des boosters, gagne-le aux enchères ou échange-le avec un ami !</p><button style="width:100%" onclick="closeSheet()">OK</button>`)}
async function toggleShow(k){const s=U.showcase||[];if(s.includes(k))await uref().update({showcase:arrayRemove(k)});else{if(s.length>=6)return toast('Vitrine pleine (6 max)');await uref().update({showcase:arrayUnion(k)})}closeSheet();toast('Vitrine mise à jour ⭐')}
async function sellOne(k,ok){
 const n=(U.cards||{})[k]||0;if(n<1)return;
 if(n===1&&!ok){openSheet(`<h3>⚠️ C'est ta dernière carte</h3><p>Tu n'auras plus ${nameK(k)}. Vendre quand même pour <b>${sellPrice(k)} ${PD}</b> ?</p><div class="row"><button onclick="closeSheet()">Annuler</button><button id="soOk" class="br">Vendre</button></div>`);$('#soOk').onclick=()=>sellOne(k,true);return}
 const p=sellPrice(k),up={coins:increment(p)};
 if(n===1){up['cards.'+k]=deleteField();if((U.showcase||[]).includes(k))up.showcase=arrayRemove(k)}else up['cards.'+k]=increment(-1);
 await uref().update(up);closeSheet();toast(`Vendue ! +${p} ${PD} 💰`);
}
async function sellAllDups(){
 const c=U.cards||{};await loadMetas(Object.keys(c).map(keyId));
 let tot=0,nb=0;const up={};for(const k in c)if(c[k]>1){tot+=(c[k]-1)*sellPrice(k);nb+=c[k]-1;up['cards.'+k]=1}
 if(!nb)return toast('Aucun doublon à vendre');
 openSheet(`<h3>💰 Vendre tous les doublons ?</h3><p>${nb} carte(s) en double → <b>+${fmt(tot)} ${PD}</b><br><span class="muted">Tu gardes 1 exemplaire de chaque.</span></p><div class="row"><button onclick="closeSheet()">Annuler</button><button id="sdOk" class="bg">Vendre</button></div>`);
 $('#sdOk').onclick=async()=>{up.coins=increment(tot);await uref().update(up);closeSheet();toast(`+${fmt(tot)} ${PD} 💰`)};
}

/* ===== Combat : choix de l'équipe ===== */
function initBattle(){
 $('#teamBar').onclick=e=>{const s=e.target.closest('.slot');if(!s)return;const i=+s.dataset.i;if(team[i]){team.splice(i,1);renderBattle()}};
 $('#bPick').onclick=e=>{const c=e.target.closest('.card');if(!c)return;const k=c.dataset.k,i=team.indexOf(k);
  if(i>=0)team.splice(i,1);else{if(team.length>=3)return toast('Ton équipe est complète (3 max)');team.push(k)}renderBattle()};
 $('#bStart').onclick=startBattle;
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&B)endBattle('hidden')});
}
function renderBattle(){
 if(B||!U)return;
 $('#bSetup').hidden=false;$('#bArena').hidden=true;$('#bBest').textContent=U.bestWave||0;
 const c=U.cards||{},keys=Object.keys(c).filter(k=>c[k]>0);
 const miss=needMetas(keys);if(miss.length)loadMetas(miss).then(()=>{if(cur==='battle'&&!B)renderBattle()});
 team=team.filter(k=>c[k]>0);
 const best={};keys.forEach(k=>{const id=keyId(k);if(!best[id]||kr(k)>kr(best[id]))best[id]=k});
 const list=Object.values(best).sort((a,b)=>kr(b)-kr(a)||keyId(a)-keyId(b));
 team=team.filter(k=>list.includes(k));
 $('#teamBar').innerHTML=[0,1,2].map(i=>team[i]?`<div class="slot" data-i="${i}" style="border-style:solid;border-color:${RC[kr(team[i])]}"><img src="${IMG(keyId(team[i]),keySh(team[i]))}" alt="" onerror="imgErr(this,${keyId(team[i])})"></div>`:`<div class="slot" data-i="${i}">Emplacement ${i+1}</div>`).join('');
 $('#bPick').innerHTML=list.map(k=>pcard(k,0,{sel:team.includes(k)})).join('')||'<p class="muted">Ouvre des boosters pour avoir des Pokémon !</p>';
 $('#bStart').disabled=!team.length||team.length<Math.min(3,list.length);
}

/* ===== Combat : déroulement ===== */
const hpCol=p=>p>50?'#22c55e':p>25?'#f59e0b':'#ef4444';
function setHp(sel,hp,max){const e=$(sel);if(!e)return;const p=Math.max(0,hp/max*100);e.style.width=p+'%';e.style.background=hpCol(p)}
function hitFx(sel){const e=$(sel+'>img');if(!e)return;e.classList.remove('hit');void e.offsetWidth;e.classList.add('hit')}
function popTxt(t){const d=document.createElement('div');d.className='pop';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1300)}
const DEF_M={n:'Pokémon',t:['normal'],s:[50,50,50,50,50,50]};

async function startBattle(){
 if(B||!team.length)return;
 $('#bStart').disabled=true;
 await loadMetas(team.map(keyId));
 B={team:team.map(k=>{const id=keyId(k),max=100+kr(k)*10;return{k,id,sh:keySh(k),m:META[id]||DEF_M,hp:max,max}}),act:0,wave:0,lvl:0,earn:0,good:0,foe:null,foeHp:100,foeMax:100,q:null,nq:null,lock:true,timer:null};
 $('#bSetup').hidden=true;$('#bArena').hidden=false;
 $('#bArena').innerHTML='<div class="ctr" style="padding:40px 0"><div class="swirl" style="margin:auto"></div><p class="muted">Préparation du combat…</p></div>';
 B.nq=makeQ(0);
 await nextFoe();
}
async function nextFoe(){
 if(!B)return;const b=B;b.wave++;b.lvl=b.wave-1;
 const boss=b.wave%5===0;let id,m=null;
 for(let t=0;t<4&&!m;t++){id=boss?pick(LEG):1+rnd(NMAX);m=await withTO(getMeta(id),5000)}
 if(B!==b)return;
 if(!m){id=25;m=META[25]||{n:'Pikachu',t:['electric'],s:[35,55,40,50,50,90]}}
 b.foe={id,m,boss};b.foeMax=boss?150:100;b.foeHp=b.foeMax;
 renderArena();
 if(boss)toast('👑 Un Pokémon légendaire apparaît !');
 nextQ();
}
function renderArena(){
 if(!B)return;const a=B.team[B.act],f=B.foe,adv=bestEff(a.m.t,f.m.t)>1;
 $('#bArena').innerHTML=`<div class="arena">
 <div class="bhead"><span>${f.boss?'👑':'🌊'} Vague ${B.wave}</span><div class="mini">${B.team.map(p=>`<img src="${SPR(p.id)}" class="${p.hp<=0?'dead':''}" alt="" onerror="imgErr(this,${p.id},1)">`).join('')}</div><button id="bQuit" style="padding:5px 10px;font-size:12px">🏳️ Abandonner</button></div>
 <div class="vs">
  <div class="fbox me" id="fMe"><img src="${IMG(a.id,a.sh)}" alt="" onerror="imgErr(this,${a.id})"><div class="fn">${esc(a.m.n)}</div><div class="hpb"><i id="hpMe"></i></div><div class="types">${a.m.t.map(tyChip).join('')}</div></div>
  <div class="vsx">VS</div>
  <div class="fbox" id="fFoe"><img src="${IMG(f.id)}" alt="" onerror="imgErr(this,${f.id})"><div class="fn">${f.boss?'👑 ':''}${esc(f.m.n)}</div><div class="hpb"><i id="hpFoe"></i></div><div class="types">${f.m.t.map(tyChip).join('')}</div></div>
 </div>
 ${adv?'<div class="ctr" style="font-size:12px;color:#4ade80;font-weight:800;margin-top:4px">⚡ Avantage de type : +4 s et dégâts ×1,5</div>':''}
 <div class="tbar"><i id="tb" style="width:100%"></i></div>
 <div class="qz" id="qz"></div>
 <div class="gain"><span>💰 Gagné : <span id="gEarn">${fmt(B.earn)}</span> ${PD}</span><span style="color:#fde047">Prochaine bonne réponse : +<span id="gNext">${(B.good+1)*10}</span> ${PD}</span></div>
 </div>`;
 setHp('#hpMe',a.hp,a.max);setHp('#hpFoe',B.foeHp,B.foeMax);
 $('#bQuit').onclick=()=>endBattle('quit');
}
async function nextQ(){
 if(!B)return;const b=B;b.lock=true;clearInterval(b.timer);
 const qz=$('#qz');if(qz)qz.innerHTML='<div class="ctr muted" style="padding:24px 0">Question suivante…</div>';
 let q=null;try{q=await b.nq}catch(e){}
 if(B!==b)return;
 if(!q||!q.opts)q=await makeQ(b.lvl);
 if(B!==b)return;
 b.q=q;b.nq=makeQ(b.lvl);drawQ();
}
function drawQ(){
 const q=B.q;
 $('#qz').innerHTML=`<span class="qcat">${q.cat}</span>${q.img?`<div class="qimg ${q.img.mode||''}" id="qimg"><img src="${IMG(q.img.id)}" alt="" onerror="imgErr(this,${q.img.id})"></div>`:''}<div class="qt">${q.text}</div><div class="opts${q.long?' long':''}" id="opts">${q.opts.map((o,i)=>`<button data-i="${i}">${o.img?`<img src="${SPR(o.img)}" alt="" onerror="imgErr(this,${o.img},1)">`:''}<span>${esc(o.label)}</span></button>`).join('')}</div><div id="qx" class="muted ctr" style="margin-top:8px;min-height:18px"></div>`;
 $('#opts').onclick=e=>{const b=e.target.closest('button');if(b)answer(+b.dataset.i)};
 B.lock=false;startTimer();
}
function startTimer(){
 const b=B;clearInterval(b.timer);const a=b.team[b.act];
 b.dur=(Math.max(7,20-(b.wave-1)*.8)+(bestEff(a.m.t,b.foe.m.t)>1?4:0)+(b.q.extra||0))*1000;b.t0=Date.now();
 b.timer=setInterval(()=>{if(B!==b)return clearInterval(b.timer);const left=b.dur-(Date.now()-b.t0),el=$('#tb');if(el)el.style.width=Math.max(0,left/b.dur*100)+'%';if(left<=0){clearInterval(b.timer);answer(-1)}},100);
}
async function answer(i){
 if(!B||B.lock)return;const b=B;b.lock=true;clearInterval(b.timer);
 const q=b.q,ok=i===q.ans,a=b.team[b.act];
 $$('#opts button').forEach((x,j)=>{x.disabled=true;if(j===q.ans)x.classList.add('ok');else if(j===i)x.classList.add('bad')});
 const qi=$('#qimg');if(qi)qi.className='qimg';
 $('#qx').innerHTML=(ok?'✅ Bonne réponse ! ':i<0?'⏰ Temps écoulé ! ':'❌ Raté ! ')+(q.expl||'');
 if(ok){
  b.good++;const g=b.good*10;b.earn+=g;popTxt('+'+g+' '+PD);
  const d=Math.round((30+rnd(9))*(bestEff(a.m.t,b.foe.m.t)>1?1.5:1));
  b.foeHp=Math.max(0,b.foeHp-d);hitFx('#fFoe');setHp('#hpFoe',b.foeHp,b.foeMax);
 }else{a.hp=Math.max(0,a.hp-(22+b.lvl*6));hitFx('#fMe');setHp('#hpMe',a.hp,a.max)}
 $('#gEarn').textContent=fmt(b.earn);$('#gNext').textContent=(b.good+1)*10;
 await sleep(ok?1600:2600);if(B!==b)return;
 if(b.foeHp<=0){$('#fFoe').classList.add('ko');toast(`${b.foe.m.n} est K.O. ! 🎉`);await sleep(900);if(B!==b)return;return nextFoe()}
 if(a.hp<=0){
  $('#fMe').classList.add('ko');const n=b.team.findIndex(p=>p.hp>0);
  if(n<0){await sleep(800);return endBattle('ko')}
  toast(`${a.m.n} est K.O. ! ${b.team[n].m.n}, à toi !`);await sleep(1000);if(B!==b)return;
  b.act=n;renderArena();
 }
 nextQ();
}
async function endBattle(reason){
 if(!B)return;const b=B;B=null;clearInterval(b.timer);
 const rec=b.wave>(U.bestWave||0),up={};
 if(b.earn>0)up.coins=increment(b.earn);if(rec)up.bestWave=b.wave;
 try{if(Object.keys(up).length)await uref().update(up)}catch(e){toast('Erreur de sauvegarde')}
 const t=reason==='ko'?'💀 Ton équipe est K.O.':reason==='hidden'?'⏸️ Combat interrompu (appli quittée)':'🏳️ Combat terminé';
 openSheet(`<h3 class="ctr">${t}</h3><p class="ctr">Vague atteinte : <b>${b.wave}</b>${rec?' 🏆 Nouveau record !':''}<br>Bonnes réponses : <b>${b.good}</b></p><p class="ctr" style="font-size:26px;color:#fde047;font-weight:900;margin:6px 0 14px">+${fmt(b.earn)} ${PD}</p><button class="bp" style="width:100%" onclick="closeSheet()">OK</button>`);
 renderBattle();
}
window.P2=1;
// ===== FIN jeu2.js =====
