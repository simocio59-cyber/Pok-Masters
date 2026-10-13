// ===== jeu1.js : base, données, cartes, boosters =====
const firebaseConfig={
 apiKey:"AIzaSyDceV0GEYc8U0RYdYpIVhDRWNLvI6S0N1o",
 authDomain:"pokemasters-fb446.firebaseapp.com",
 projectId:"pokemasters-fb446",
 storageBucket:"pokemasters-fb446.firebasestorage.app",
 messagingSenderId:"717761799225",
 appId:"1:717761799225:web:15d7464c7106fd8dcd99e8"
};
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth(),db=firebase.firestore(),FV=firebase.firestore.FieldValue;
const increment=n=>FV.increment(n),arrayUnion=(...a)=>FV.arrayUnion(...a),arrayRemove=(...a)=>FV.arrayRemove(...a),deleteField=()=>FV.delete();

/* ===== Outils ===== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const withTO=(p,ms)=>Promise.race([p,sleep(ms).then(()=>null)]);
const pad=n=>String(n).padStart(3,'0');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const fmt=n=>Math.round(n||0).toLocaleString('fr-FR');
function toast(t,ms=2400){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),ms)}

/* ===== Constantes ===== */
const PD='₽',BOOST_MS=10*60*1000,BOOST_MAX=3,BOOST_PRICE=150,PER_PACK=5,NMAX=1025,SHINY=64;
const ODDS=[49,30,14,4,1.5,1,0.3,0.2];
const RNAME=['Commune','Peu commune','Rare','Épique','Méga','Légendaire','Mythique','Ultra Rare EX'];
const RC=['#9ca3af','#22c55e','#3b82f6','#a855f7','#06b6d4','#f59e0b','#ec4899','#f0abfc'];
const RAR=['◆','◆◆','◆◆◆','◆◆◆◆','Ⓜ','★','★★','★★★'];
const SELL=[5,10,20,50,80,150,250,400],ABASE=[40,80,150,350,600,1000,1600,2500];
const PROMO={'POKEDOLLARS500':500};
const SN6=['PV','Attaque','Défense','Atq. Spé.','Déf. Spé.','Vitesse'];
const LEG=[144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,716,717,718,772,773,785,786,787,788,789,790,791,792,800,888,889,890,891,892,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1014,1015,1016,1017,1024];
const MYTH=[151,251,385,386,489,490,491,492,493,494,647,648,649,719,720,721,801,802,807,808,809,893,1025];
const LEGS=new Set(LEG),MYTHS=new Set(MYTH);
const MEGA={10033:[3,''],10034:[6,'X'],10035:[6,'Y'],10036:[9,''],10037:[65,''],10038:[94,''],10039:[115,''],10040:[127,''],10041:[130,''],10042:[142,''],10043:[150,'X'],10044:[150,'Y'],10045:[181,''],10046:[212,''],10047:[214,''],10048:[229,''],10049:[248,''],10050:[257,''],10051:[282,''],10052:[303,''],10053:[306,''],10054:[308,''],10055:[310,''],10056:[354,''],10057:[359,''],10058:[445,''],10059:[448,''],10060:[460,''],10062:[380,''],10063:[381,''],10064:[260,''],10065:[254,''],10066:[302,''],10067:[334,''],10068:[475,''],10069:[531,''],10070:[319,''],10071:[80,''],10072:[208,''],10073:[18,''],10074:[362,''],10075:[719,''],10076:[376,''],10079:[384,''],10087:[323,''],10088:[428,''],10089:[373,''],10090:[15,'']};
const MEGA_IDS=Object.keys(MEGA).map(Number);
const baseOf=id=>MEGA[id]?MEGA[id][0]:+id;
const EXP=[3,6,9,25,94,130,131,133,143,149,150,151,196,197,248,282,384,445,448,658,700,778,887];
const FB=[[10,13,16,19,21,129,161,163,263,265,396,399,504,506,659,661,731,734,819,821,915,917],[2,5,8,17,20,58,64,66,77,93],[18,26,31,38,45,55,65,68,94,134,135,136],[6,9,59,130,131,143,149,248,373,376,445,635,706,784,887,998]];
const GENS=[[1,151,'Kanto'],[152,251,'Johto'],[252,386,'Hoenn'],[387,493,'Sinnoh'],[494,649,'Unys'],[650,721,'Kalos'],[722,809,'Alola'],[810,905,'Galar'],[906,1025,'Paldea']];
const genOf=id=>{const b=baseOf(id);return GENS.findIndex(g=>b>=g[0]&&b<=g[1])+1};
const DEX=[];{const mb={};MEGA_IDS.forEach(m=>(mb[MEGA[m][0]]=mb[MEGA[m][0]]||[]).push(m));for(let i=1;i<=NMAX;i++){DEX.push(i);(mb[i]||[]).forEach(m=>DEX.push(m))}}
const TYPES={normal:['Normal','#9fa19f'],fire:['Feu','#e62829'],water:['Eau','#2980ef'],grass:['Plante','#3fa129'],electric:['Électrik','#d4a800'],ice:['Glace','#3dcef3'],fighting:['Combat','#ff8000'],poison:['Poison','#9141cb'],ground:['Sol','#915121'],flying:['Vol','#81b9ef'],psychic:['Psy','#ef4179'],bug:['Insecte','#91a119'],rock:['Roche','#afa981'],ghost:['Spectre','#704170'],dragon:['Dragon','#5060e1'],dark:['Ténèbres','#624d4e'],steel:['Acier','#60a1b8'],fairy:['Fée','#ef70ef']};
const TK=Object.keys(TYPES),tn=t=>TYPES[t]?TYPES[t][0]:t;
const CH={normal:['','rock steel','ghost'],fire:['grass ice bug steel','fire water rock dragon',''],water:['fire ground rock','water grass dragon',''],electric:['water flying','electric grass dragon','ground'],grass:['water ground rock','fire grass poison flying bug dragon steel',''],ice:['grass ground flying dragon','fire water ice steel',''],fighting:['normal ice rock dark steel','poison flying psychic bug fairy','ghost'],poison:['grass fairy','poison ground rock ghost','steel'],ground:['fire electric poison rock steel','grass bug','flying'],flying:['grass fighting bug','electric rock steel',''],psychic:['fighting poison','psychic steel','dark'],bug:['grass psychic dark','fire fighting poison flying ghost steel fairy',''],rock:['fire ice flying bug','fighting ground steel',''],ghost:['psychic ghost','dark','normal'],dragon:['dragon','steel','fairy'],dark:['psychic ghost','fighting dark fairy',''],steel:['ice rock fairy','fire water electric steel',''],fairy:['fighting dragon dark','fire poison steel','']};
const CHART={};for(const a in CH){CHART[a]={};const[s,h,z]=CH[a].map(x=>x?x.split(' '):[]);s.forEach(d=>CHART[a][d]=2);h.forEach(d=>CHART[a][d]=.5);z.forEach(d=>CHART[a][d]=0)}
const eff=(a,defs)=>defs.reduce((m,d)=>m*(CHART[a]?.[d]??1),1);
const bestEff=(atks,defs)=>Math.max(...atks.map(a=>eff(a,defs)));
const tyChip=t=>`<span class="ty" style="background:${TYPES[t]?.[1]||'#555'}">${tn(t)}</span>`;

/* ===== Données Pokémon ===== */
const API='https://pokeapi.co/api/v2/',ART='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const IMG=(id,sh)=>`${ART}other/official-artwork/${sh?'shiny/':''}${id}.png`,SPR=id=>`${ART}${id}.png`;
function imgErr(el,id,big){el.onerror=null;el.src=big?IMG(id):SPR(id)}
let META={};try{META=JSON.parse(localStorage.getItem('pm_meta_v5')||'{}')}catch(e){}
let mT;const saveMeta=()=>{clearTimeout(mT);mT=setTimeout(()=>{try{localStorage.setItem('pm_meta_v5',JSON.stringify(META))}catch(e){}},1000)};
const PEND={},TRIED=new Set();
function getMeta(id){id=+id;if(META[id])return Promise.resolve(META[id]);if(PEND[id])return PEND[id];
 return PEND[id]=(async()=>{try{
  const p=await fetch(API+'pokemon/'+id).then(r=>{if(!r.ok)throw 0;return r.json()});
  const sp=await fetch(p.species.url).then(r=>r.json());
  let n=(sp.names.find(x=>x.language.name==='fr')||{}).name||p.name;
  if(MEGA[id])n='Méga-'+n+(MEGA[id][1]?' '+MEGA[id][1]:'');
  const m={n,t:p.types.map(x=>x.type.name),s:p.stats.map(x=>x.base_stat),b:sp.id,w:p.weight,h:p.height};
  META[id]=m;saveMeta();return m;
 }catch(e){return null}finally{delete PEND[id]}})();
}
async function loadMetas(ids){ids=[...new Set(ids.map(Number))].filter(id=>id>0&&!META[id]);ids.forEach(id=>TRIED.add(id));for(let i=0;i<ids.length;i+=8)await Promise.all(ids.slice(i,i+8).map(getMeta))}
const keyId=k=>parseInt(k),keySh=k=>String(k).endsWith('s'),keyEx=k=>String(k).endsWith('x');
const needMetas=keys=>[...new Set(keys.map(keyId))].filter(id=>!META[id]&&!TRIED.has(id));
function rarityOf(id){if(MEGA[id])return 4;const b=baseOf(id);if(MYTHS.has(b))return 6;if(LEGS.has(b))return 5;const m=META[id];if(!m)return 0;const t=m.s.reduce((a,c)=>a+c,0);return t>=530?3:t>=450?2:t>=330?1:0}
const kr=k=>keyEx(k)?7:rarityOf(keyId(k));
const sellPrice=k=>SELL[kr(k)]*(keySh(k)?3:1);
const nameK=k=>esc((META[keyId(k)]?.n||'#'+keyId(k))+(keySh(k)?' ✨':'')+(keyEx(k)?' EX':''));
async function pickIdOfRarity(r){
 if(r===4)return pick(MEGA_IDS);if(r===5)return pick(LEG);if(r===6)return pick(MYTH);if(r===7)return pick(EXP);
 const cand=[];while(cand.length<6){const id=1+rnd(NMAX);if(!LEGS.has(id)&&!MYTHS.has(id))cand.push(id)}
 await withTO(Promise.all(cand.map(getMeta)),6000);
 const ok=cand.filter(id=>META[id]&&rarityOf(id)===r);if(ok.length)return pick(ok);
 const pool=Object.keys(META).map(Number).filter(id=>id<=NMAX&&rarityOf(id)===r);
 return pool.length?pick(pool):pick(FB[r]);
}
function rollRarity(){let x=Math.random()*100;for(let i=0;i<ODDS.length;i++){if((x-=ODDS[i])<0)return i}return 0}
async function rollPack(){
 const rs=Array.from({length:PER_PACK},rollRarity);if(!rs.some(r=>r>=1))rs[PER_PACK-1]=1;rs.sort((a,b)=>a-b);
 const keys=await Promise.all(rs.map(async r=>{const id=await pickIdOfRarity(r);return r===7?id+'x':id+(rnd(SHINY)===0?'s':'')}));
 await loadMetas(keys.map(keyId));return keys;
}

/* ===== Dos de carte ===== */
let BACK_OK=false;
(async()=>{for(const ext of ['png','jpg','jpeg','webp']){const ok=await new Promise(r=>{const i=new Image();i.onload=()=>r(true);i.onerror=()=>r(false);i.src='dos-carte.'+ext});if(ok){BACK_OK=true;document.documentElement.style.setProperty('--backimg',`url("dos-carte.${ext}")`);break}}})();

/* ===== Booster Pokéball sans écriture ===== */
$$('#pack .lbl,#pack .lbl2').forEach(e=>e.remove());

/* ===== État ===== */
let me=null,U=null,cur='booster',started=false,opening=false,B=null,team=[],cMode='mine',sheetLock=false;
const uref=()=>db.collection('users').doc(me.uid);
function openSheet(h,lock){$('#sheet').innerHTML='<div class="grab"></div>'+h;$('#sheetBg').classList.add('on');sheetLock=!!lock;$('#sheet').scrollTop=0}
function closeSheet(){$('#sheetBg').classList.remove('on');sheetLock=false}
function showFx(h){const f=$('#fx');f.innerHTML=h;f.classList.add('on')}
function hideFx(){const f=$('#fx');f.classList.remove('on');f.innerHTML=''}

/* ===== Cartes ===== */
function pcard(k,n,o={}){
 k=String(k);const id=keyId(k),sh=keySh(k),ex=keyEx(k),m=META[id],r=kr(k),c=RC[r];
 const im=`<img src="${IMG(id,sh)}"${o.eager?'':' loading="lazy"'} alt="" onerror="imgErr(this,${id})">`;
 const cnt=n>1?`<div class="cnt">×${n}</div>`:'',nw=o.isNew?'<div class="new">NOUVEAU</div>':'',tg=o.tag?`<div class="tag" style="background:${o.tagColor||'#000a'}">${o.tag}</div>`:'';
 const nm=m?esc(m.n):'#'+pad(baseOf(id)),cls=`card${o.sel?' sel':''}${o.big?' big':''}`;
 if(ex){const tc=m&&TYPES[m.t[0]]?TYPES[m.t[0]][1]:'#a855f7';return `<div class="${cls} ex" data-k="${k}" style="--rc:${c};--tc:${tc}"><div class="art"></div>${im}<div class="hp">PV ${m?m.s[0]*2+60:'?'}</div>${cnt}${tg}<div class="exi"><div class="nm">${nm} <i>ex</i></div><div class="rr">${RAR[7]}</div></div>${nw}</div>`}
 return `<div class="${cls}${sh?' sh':''}" data-k="${k}" style="--rc:${c}"><div class="num">#${pad(baseOf(id))}</div>${cnt}${tg}${im}<div class="nm">${nm}</div><div class="rr">${RAR[r]}</div><div class="types">${m?m.t.map(tyChip).join(''):''}</div>${nw}</div>`;
}
function missingCard(id){const m=META[id],r=rarityOf(id);return `<div class="card miss" data-k="${id}" style="--rc:${RC[r]}"><div class="num">#${pad(baseOf(id))}</div><img src="${SPR(id)}" loading="lazy" alt="" onerror="imgErr(this,${id},1)"><div class="nm">${m?esc(m.n):'???'}</div><div class="rr">${m||r>=4?RAR[r]:'?'}</div></div>`}

/* ===== Boosters ===== */
function boostState(){
 let n=Math.min(U.boosters??0,BOOST_MAX),last=U.lastBoost||Date.now();const now=Date.now();
 if(n>=BOOST_MAX)return{n:BOOST_MAX,last:now,full:true,next:0};
 const g=Math.floor((now-last)/BOOST_MS);if(g>0){n=Math.min(BOOST_MAX,n+g);last+=g*BOOST_MS}
 if(n>=BOOST_MAX)return{n,last:now,full:true,next:0};
 return{n,last,full:false,next:last+BOOST_MS-now};
}
function renderTop(){if(!U)return;const s=boostState();$('#coins').textContent=fmt(U.coins)+' '+PD;$('#boosters').textContent='🎁 '+s.n+'/'+BOOST_MAX;
 if(s.full)$('#timer').textContent='⏱ plein';else{const sec=Math.ceil(s.next/1000);$('#timer').textContent='⏱ '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}}
function updatePack(){if(!U)return;const s=boostState();$('#pack').className='pack '+(s.n>0?'ready':'empty');$('#openBtn').disabled=s.n<1||opening;$('#buyBtn').disabled=opening;
 $('#bInfo').textContent=s.n>0?`${s.n} booster${s.n>1?'s':''} disponible${s.n>1?'s':''}`:'Plus de booster gratuit';
 $('#bNext').textContent=s.full?'Stock plein':'Prochain booster dans '+$('#timer').textContent.replace('⏱ ','')}
function buyConfirm(){openSheet(`<h3>🛒 Acheter un booster ?</h3><p>Prix : <b>${BOOST_PRICE} ${PD}</b><br><span class="muted">Tu as ${fmt(U.coins)} ${PD}</span></p><div class="row"><button onclick="closeSheet()">Annuler</button><button id="bcOk" class="bp" ${(U.coins||0)<BOOST_PRICE?'disabled':''}>Acheter et ouvrir</button></div>`);$('#bcOk').onclick=()=>{closeSheet();openBooster(true)}}
async function openBooster(buy){
 if(opening)return;const s=boostState();
 if(buy?(U.coins||0)<BOOST_PRICE:s.n<1)return toast(buy?'Pas assez de Pokédollars':'Plus de booster gratuit');
 opening=true;updatePack();
 const pr=rollPack().catch(()=>null);
 await tearPack();
 showFx('<div class="swirl"></div><div class="muted">Ouverture…</div>');
 const keys=await pr,fail=t=>{opening=false;hideFx();updatePack();toast(t)};
 if(!keys)return fail('Erreur réseau, réessaie');
 const s2=boostState(),up={};
 if(buy){if((U.coins||0)<BOOST_PRICE)return fail('Pas assez de Pokédollars');up.coins=increment(-BOOST_PRICE)}
 else{if(s2.n<1)return fail('Plus de booster');up.boosters=s2.n-1;up.lastBoost=s2.full?Date.now():s2.last}
 const cnt={},isNew={};keys.forEach(k=>cnt[k]=(cnt[k]||0)+1);
 for(const k in cnt){isNew[k]=!((U.cards||{})[k]>0);up['cards.'+k]=increment(cnt[k])}
 try{await uref().update(up)}catch(e){return fail('Erreur de sauvegarde')}
 await revealFlow(keys,isNew);
 opening=false;hideFx();updatePack();
}
/* Toucher = ouvre tout de suite · Glisser sur la ligne = déchirer */
function tearPack(){return new Promise(res=>{
 showFx(`<div class="fxmsg" style="font-size:17px">👆 Touche le booster pour l'ouvrir<br><span class="muted" style="font-size:14px;font-weight:600">ou glisse ton doigt sur la ligne pour le déchirer ✂️</span></div><div class="pk" id="pk"><div class="ptop"></div><div class="pbot"></div><div class="dash"></div><div class="cut" id="cut"></div></div>`);
 const pk=$('#pk'),cut=$('#cut');let x0=null,y0=0,mv=0,done=false;
 const finish=()=>{if(done)return;done=true;cut.style.transition='width .25s';cut.style.width='100%';
  setTimeout(()=>{pk.classList.add('torn');burst('#fff',1);setTimeout(res,650)},250)};
 pk.onpointerdown=e=>{if(done)return;x0=e.clientX;y0=e.clientY;mv=0;try{pk.setPointerCapture(e.pointerId)}catch(_){}};
 pk.onpointermove=e=>{if(x0==null||done)return;const dx=Math.abs(e.clientX-x0);mv=Math.max(mv,dx,Math.abs(e.clientY-y0));
  const p=Math.min(1,dx/(pk.offsetWidth*.7));cut.style.width=p*100+'%';if(p>=1)finish()};
 pk.onpointerup=()=>{if(x0==null||done)return;const tap=mv<12;x0=null;if(tap)finish();else cut.style.width='0'};
 pk.onpointercancel=()=>{x0=null;if(!done)cut.style.width='0'};
})}
function fxOf(k){const r=kr(k),sh=keySh(k);let l=r;if(sh)l=Math.max(l,4);const m=['','','Rare !','Épique !','MÉGA-ÉVOLUTION !','LÉGENDAIRE !','MYTHIQUE !!','ULTRA RARE EX !!!'][r];return{g:RC[r],c:sh?'#fde047':RC[r],l,m:(sh?'✨ SHINY ✨ ':'')+m}}
function burst(c,lvl,host){host=host||$('#fx');if(!lvl)return;
 if(lvl>=2){host.querySelectorAll('.rays').forEach(x=>x.remove());const r=document.createElement('div');r.className='rays';r.style.setProperty('--c',c);host.appendChild(r)}
 const n=6+lvl*6;for(let i=0;i<n;i++){const p=document.createElement('i');p.className='pt';const a=Math.random()*6.283,d=70+Math.random()*(110+lvl*35);p.style.cssText=`--c:${c};--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;animation-delay:${Math.random()*.15}s`;host.appendChild(p);setTimeout(()=>p.remove(),1400)}
 if(lvl>=5){const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),800)}
}
/* Toucher la carte = elle se retourne tout de suite + effet selon la rareté */
function revealFlow(keys,isNew){return new Promise(res=>{
 let i=0,busy=false;
 const summary=()=>{showFx(`<h2>Ton booster 🎉</h2><div class="cgrid" style="width:100%;max-width:560px">${keys.map(k=>pcard(k,0,{isNew:isNew[k],eager:true})).join('')}</div><button id="fxOk" class="bp" style="min-width:200px">Super !</button>`);$('#fxOk').onclick=res};
 const show=()=>{
  if(i>=keys.length)return summary();
  const k=keys[i],fx=fxOf(k);
  showFx(`<div class="muted">Carte ${i+1} / ${keys.length}</div><div class="flip${BACK_OK?' hasBack':''}" id="flip" style="--g:${fx.g}"><div class="fin"><div class="fface fbk${BACK_OK?'':' fb'}"></div><div class="fface ffr">${pcard(k,0,{isNew:isNew[k],eager:true,big:true})}</div></div></div><div class="fxmsg" id="fxm" style="--c:${fx.c}"></div><div class="muted" id="fxh">Touche la carte pour la retourner</div><button id="fxAll">Tout révéler ⏩</button>`);
  const fl=$('#flip');let st=0;
  fl.onclick=async()=>{if(busy)return;
   if(st===0){busy=true;fl.classList.add('open');
    await sleep(280);
    burst(fx.c,fx.l);if(fx.m)$('#fxm').textContent=fx.m;
    if(fx.l>=3){fl.classList.add('wow');fl.style.filter=`drop-shadow(0 0 24px ${fx.g})`}
    $('#fxh').textContent=i<keys.length-1?'Touche pour la carte suivante':'Touche pour voir le résumé';
    st=1;await sleep(250);busy=false;
   }else{i++;show()}};
  $('#fxAll').onclick=()=>{if(!busy)summary()};
 };
 show();
})}
window.P1=1;
// ===== FIN jeu1.js =====
