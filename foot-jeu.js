// ===== foot-jeu.js : moteur du jeu FootMasters =====
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const D=window.FOOT;
const RN=['Bronze','Argent','Or','Élite','Légende'];
const W_SLOT=[22,33,32,10,3], W_LAST=[0,0,70,23,7], W_AUC=[5,20,40,25,10];
const FREE_MAX=3, FREE_MS=2*3600*1000, PACK_PRICE=300, KEY='footmasters_v1';
const BOTS=['Zizou_75','Titi14','KM10_fan','LeButeur','Ultra_Massilia','DogueLillois','MisterFoot','LaPulga','CR7_Forever','Paname92','Tonton_Kop','Rouge&Noir'];

function slug(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function nk(s){return String(s||'').toLowerCase().replace(/ø/g,'o').replace(/ı/g,'i').replace(/ß/g,'ss').replace(/æ/g,'ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
function rar(n){return n>=90?4:n>=86?3:n>=82?2:n>=78?1:0}
function price(n){return Math.max(20,Math.round(50*Math.pow(1.18,n-74)/10)*10)}
function qs(p){return Math.max(10,Math.round(p.price*0.25/10)*10)}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function short(n){return n.length>15&&n.indexOf(' ')>0?n.slice(n.indexOf(' ')+1):n}
function fmt(ms){ms=Math.max(0,ms);const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?h+'h'+String(m).padStart(2,'0'):m+':'+String(x).padStart(2,'0')}
function wpick(w){const t=w.reduce((a,b)=>a+b,0);let r=Math.random()*t;for(let i=0;i<w.length;i++){if((r-=w[i])<0)return i}return w.length-1}
function rnd(a){return a[Math.floor(Math.random()*a.length)]}

// ---------- Notes officielles EA SPORTS FC 27 ----------
// Format : Nom/autre écriture | Poste | Note | Club
const FC27=[
'Kylian Mbappé|FW|91|rma','Erling Haaland|FW|91|mci','Rodri|MF|90|mci','Ousmane Dembélé|FW|90|psg','Vitinha|MF|90|psg',
'Harry Kane|FW|90|bay','Michael Olise|FW|90|bay','Pedri|MF|90|bar','Lamine Yamal|FW|90|bar','Thibaut Courtois|GK|90|rma',
'Jude Bellingham|MF|90|rma','Gabriel Magalhães/Gabriel|DF|89|ars','Gianluigi Donnarumma|GK|89|mci','Bruno Fernandes|MF|89|mun',
'Khvicha Kvaratskhelia|FW|89|psg','Nuno Mendes|DF|89|psg','Willian Pacho|DF|89|psg','Lionel Messi|FW|89|mia',
'Vinícius Júnior/Vinícius Jr./Vinicius Junior|FW|89|rma','Jan Oblak|GK|88|atm','Declan Rice|MF|88|ars','William Saliba|DF|88|ars',
'Virgil van Dijk|DF|88|liv','Achraf Hakimi|DF|88|psg','João Neves|MF|88|psg','Joshua Kimmich|MF|88|bay','Luis Díaz|FW|88|bay',
'Raphinha|FW|88|bar',
// Ligue 1
'Marquinhos|DF|87|psg','Fabián Ruiz|MF|86|psg','Désiré Doué|FW|86|psg','Bradley Barcola|FW|85|psg','Ferran Torres|FW|84|psg',
'Matvey Safonov|GK|83|psg','Warren Zaïre-Emery|MF|83|psg','Florian Thauvin|FW|82|rcl','Corentin Tolisso|MF|82|ol',
'Denis Zakaria|MF|81|asm','Matthieu Udol|DF|81|rcl','Adrien Thomasson|MF|81|rcl','Brice Samba|GK|81|srfc','Robin Risser|GK|81|rcl',
'Lucas Hernández|DF|81|psg','Dominik Greif|GK|81|ol','Maghnes Akliouche|MF|81|psg','Amine Gouiri|FW|80|om','Jonathan Clauss|DF|77|ogcn',
// Premier League
'David Raya|GK|88|ars','Alisson/Alisson Becker|GK|87|liv','Rúben Dias|DF|87|mci','Bukayo Saka|FW|87|ars','Dominik Szoboszlai|MF|86|liv',
'Alexander Isak|FW|86|liv','Martin Ødegaard|MF|86|ars','Viktor Gyökeres|FW|86|ars','Florian Wirtz|MF|86|liv','Enzo Fernández|MF|86|che',
'Rayan Cherki|MF|86|mci','Moisés Caicedo|MF|86|che','Bruno Guimarães|MF|86|new','Granit Xhaka|MF|85|sun','Sandro Tonali|MF|85|tot',
'Youri Tielemans|MF|85|mun','Antoine Semenyo|FW|85|mci','Jordan Pickford|GK|85|eve','Cole Palmer|MF|85|che','Emiliano Martínez|GK|85|avl',
// LaLiga
'Federico Valverde|MF|87|rma','Julián Álvarez|FW|86|atm','Pau Cubarsí|DF|86|bar','Marc Cucurella|DF|86|rma','Joan García|GK|86|bar',
'Unai Simón|GK|85|ath','Ante Budimir|FW|82|osa','Péter Gulácsi|GK|82|vil','Iago Aspas|FW|81|cel',
// Bundesliga
'Dayot Upamecano|DF|87|bay','Nico Schlotterbeck|DF|87|bvb','Gregor Kobel|GK|87|bvb','Jonathan Tah|DF|87|bay','Jamal Musiala|MF|87|bay',
'Serhou Guirassy|FW|85|bvb','Konrad Laimer|DF|85|bay','Deniz Undav|FW|85|vfb','Felix Nmecha|MF|85|bvb','Oliver Baumann|GK|84|hof',
'Aleix García|MF|84|b04','Waldemar Anton|DF|84|bvb','Angelo Stiller|MF|83|vfb','Patrik Schick|FW|83|b04','Ismael Saibari|MF|83|bay',
'David Raum|DF|83|rbl','Aleksandar Pavlović|MF|83|bay','Exequiel Palacios|MF|83|b04','Willi Orbán|DF|83|rbl',
'Maximilian Mittelstädt|DF|83|vfb','Kim Min-jae|DF|83|bay','Serge Gnabry|FW|83|bay','Matthias Ginter|DF|83|scf',
// Serie A
'Lautaro Martínez|FW|87|int','Mike Maignan|GK|87|acm','Nicolò Barella|MF|87|int','Scott McTominay|MF|86|nap',
'Federico Dimarco|DF|86|int','Bremer/Gleison Bremer|DF|86|juv','Marco Carnesecchi|GK|86|ata','Alessandro Bastoni|DF|86|int',
'Luka Modrić|MF|85|acm','Kevin De Bruyne|MF|85|nap','Hakan Çalhanoğlu|MF|85|int','Adrien Rabiot|MF|85|acm','Paulo Dybala|FW|85|rom',
'Marcus Thuram|FW|85|int','Mile Svilar|GK|85|rom','Kenan Yıldız|FW|84|juv','Nico Paz|MF|84|com','Gianluca Mancini|DF|84|rom',
'Manuel Locatelli|MF|84|juv','Wladimiro Falcone|GK|84|lec','Amir Rrahmani|DF|83|nap','Christian Pulisic|FW|83|acm',
'Manuel Akanji|DF|83|int','Evan Ndicka|DF|83|rom','Donyell Malen|FW|83|rom','Stanislav Lobotka|MF|83|nap'
];
const CLUB={rma:'Real Madrid,Real,RMA,RM',mci:'Manchester City,Man City,Man. City,City,MCI',bar:'FC Barcelone,Barcelone,FC Barcelona,Barcelona,Barça,BAR',
psg:'Paris Saint-Germain,PSG,Paris SG,Paris',bay:'Bayern Munich,Bayern,Bayern Munchen,FC Bayern,BAY',ars:'Arsenal,ARS',
mun:'Manchester United,Man United,Man Utd,MUN,MU',atm:'Atlético Madrid,Atlético de Madrid,Atlético,ATM',liv:'Liverpool,LIV',
rcl:'RC Lens,Lens,RCL',ol:'Olympique Lyonnais,Lyon,OL',asm:'AS Monaco,Monaco,ASM',srfc:'Stade Rennais,Rennes,SRFC',
om:'Olympique de Marseille,Marseille,OM',ogcn:'OGC Nice,Nice,OGCN',che:'Chelsea,CHE',new:'Newcastle,Newcastle United,NEW',
sun:'Sunderland,SUN',tot:'Tottenham,Tottenham Hotspur,Spurs,TOT',eve:'Everton,EVE',avl:'Aston Villa,AVL',
ath:'Athletic Bilbao,Athletic Club,Athletic,ATH',osa:'Osasuna,CA Osasuna,OSA',vil:'Villarreal,VIL',cel:'Celta Vigo,Celta de Vigo,Celta,CEL',
bvb:'Borussia Dortmund,Dortmund,BVB',vfb:'VfB Stuttgart,Stuttgart,VFB',hof:'Hoffenheim,TSG Hoffenheim,HOF',b04:'Bayer Leverkusen,Leverkusen,B04',
rbl:'RB Leipzig,Leipzig,RBL',scf:'SC Freiburg,Freiburg,Fribourg,SCF',int:'Inter Milan,Inter,Internazionale,INT',acm:'AC Milan,Milan,ACM',
nap:'Naples,Napoli,SSC Napoli,NAP',juv:'Juventus,Juve,JUV',ata:'Atalanta,ATA',rom:'AS Roma,Roma,ROM',com:'Como,COM',lec:'Lecce,LEC'};
const FCN={},FCL=[];
FC27.forEach(s=>{const a=s.split('|');if(a.length<4)return;const e={names:a[0].split('/'),pos:a[1],note:+a[2],club:a[3],done:false};FCL.push(e);e.names.forEach(n=>{FCN[nk(n)]=e})});

// ---------- Joueurs ----------
const PL=[],BY={},POOL=[[],[],[],[],[]];
D.teams.forEach(t=>{t.players=[];t.j.split(';').forEach(s=>{s=s.trim();if(!s)return;const a=s.split('|');
  const p={id:slug(a[0]),n:a[0].trim(),pos:(a[1]||'').trim(),note:+a[2]||75,w:(a[3]||a[0]).trim(),t:t};
  if(BY[p.id])return;
  const e=FCN[nk(p.n)]||FCN[nk(p.w)];if(e){p.note=e.note;p.fc=1;e.done=true}
  t.players.push(p);PL.push(p);BY[p.id]=p})});
// Stars FC 27 écrites autrement ou absentes : on les cherche dans leur club
const POSV={};PL.forEach(p=>{POSV[p.pos]=1});
const POSC={GK:['GB','G','GK','GAR','POR'],DF:['DEF','DC','D','DF','CB','DFC'],MF:['MIL','MC','M','MF','CM','MOC','MDC'],FW:['ATT','BU','A','FW','ST','AT']};
function posOf(k){const l=POSC[k]||[k];for(const x of l)if(POSV[x])return x;return l[0]}
function teamOf(c){const al=(CLUB[c]||'').split(',').map(nk).filter(Boolean);if(!al.length)return null;return D.teams.find(t=>al.includes(nk(t.n))||al.includes(nk(t.s)))}
FCL.forEach(e=>{if(e.done)return;const t=teamOf(e.club);if(!t)return;
  const w=e.names[0].trim().split(/\s+/),last=nk(w[w.length-1]),first=nk(w[0]).charAt(0);
  let p=t.players.find(x=>{const v=x.n.trim().split(/\s+/);if(nk(v[v.length-1])!==last)return false;return v.length<2||w.length<2||nk(v[0]).charAt(0)===first});
  if(p){p.note=e.note;p.fc=1;e.done=true;return}
  const n=e.names[0].trim(),id=slug(n);if(BY[id])return;
  p={id:id,n:n,pos:posOf(e.pos),note:e.note,w:n,t:t,fc:1};t.players.push(p);PL.push(p);BY[id]=p;e.done=true});
PL.forEach(p=>{p.r=rar(p.note);p.price=price(p.note);POOL[p.r].push(p)});
const FC_N=PL.filter(p=>p.fc).length;
console.log('[FC27] '+FC_N+' joueurs avec leur vraie note FC 27');

function pickR(r){while(r>0&&!POOL[r].length)r--;while(!POOL[r].length)r++;return rnd(POOL[r])}
function draw(){const out=[];for(let i=0;i<5;i++){let p,k=0;do{p=pickR(wpick(i===4?W_LAST:W_SLOT));k++}while(out.includes(p)&&k<20);out.push(p)}return out.sort((a,b)=>a.note-b.note)}

// ---------- Sauvegarde ----------
function blank(){return{coins:1000,col:{},free:FREE_MAX,freeT:Date.now(),lots:[],hist:[],opened:0,t:0}}
function fix(o){o=Object.assign(blank(),o||{});o.col=o.col||{};o.lots=(o.lots||[]).filter(L=>BY[L.pid]);o.hist=o.hist||[];return o}
let S;try{S=fix(JSON.parse(localStorage.getItem(KEY)))}catch(e){S=blank()}
function localSave(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function save(){S.t=Date.now();localSave();cloudSave()}
function recharge(){const n=Date.now();let ch=false;
  if(S.free>=FREE_MAX){S.freeT=n;return false}
  while(S.free<FREE_MAX&&n-S.freeT>=FREE_MS){S.free++;S.freeT+=FREE_MS;ch=true}
  if(S.free>=FREE_MAX)S.freeT=n;if(ch)save();return ch}

// ---------- Outils d'affichage ----------
function toast(m){const t=$('#toast');t.innerHTML=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2800)}
function modal(h){const m=$('#modal');m.innerHTML='<div class="mbox">'+h+'</div>';m.classList.add('on');m.onclick=e=>{if(e.target===m)closeModal()}}
function closeModal(){$('#modal').classList.remove('on');$('#modal').innerHTML=''}
function ask(msg,ok){modal('<p class="center">'+msg+'</p><div class="row"><button class="btn sec" id="mNo">Annuler</button><button class="btn" id="mYes">Oui</button></div>');$('#mNo').onclick=closeModal;$('#mYes').onclick=()=>{closeModal();ok()}}
function badge(t){return '<div class="bdg" style="background:linear-gradient(135deg,'+t.c1+' 50%,'+t.c2+' 50%)">'+t.s+'</div>'}
function ini(p){const a=p.n.split(' ');const s=(a[0][0]+(a.length>1?a[a.length-1][0]:'')).toUpperCase();return '<div class="ini" style="background:linear-gradient(135deg,'+p.t.c1+','+p.t.c2+')">'+esc(s)+'</div>'}
function cardHTML(p,o){o=o||{};return '<div class="card r'+p.r+'" data-id="'+p.id+'"><div class="ph" data-img="'+p.id+'">'+ini(p)+'</div>'+
  '<div class="note">'+p.note+'</div><div class="pos">'+p.pos+'</div>'+badge(p.t)+
  '<div class="info"><div class="nm">'+esc(short(p.n))+'</div><div class="tm">'+esc(p.t.n)+'</div></div>'+
  (o.cnt>1?'<div class="cnt">×'+o.cnt+'</div>':'')+(o.isNew?'<div class="new">NOUVEAU</div>':'')+'</div>'}
function lockedHTML(p){return '<div class="card lock"><div class="ph"><div class="ini">?</div></div><div class="note">?</div><div class="pos">'+p.pos+'</div><div class="info"><div class="nm">'+esc(short(p.n))+'</div><div class="tm">À trouver</div></div></div>'}

// ---------- Photos (Wikipédia) ----------
let IMG={};try{IMG=JSON.parse(localStorage.getItem('fm_img')||'{}')}catch(e){}
let q=[],busy=0,imgT=null;
function saveImg(){clearTimeout(imgT);imgT=setTimeout(()=>{try{localStorage.setItem('fm_img',JSON.stringify(IMG))}catch(e){}},1000)}
function put(el,u){el.insertAdjacentHTML('beforeend','<img src="'+u+'" alt="" onerror="this.remove()">')}
function loadImgs(root){$$('.ph[data-img]',root).forEach(el=>{const id=el.getAttribute('data-img');el.removeAttribute('data-img');const p=BY[id];if(!p)return;
  if(IMG[id]!==undefined){if(IMG[id])put(el,IMG[id]);return}q.push([el,p])});pump()}
function pump(){while(busy<4&&q.length){const it=q.shift(),el=it[0],p=it[1];
  if(IMG[p.id]!==undefined){if(IMG[p.id])put(el,IMG[p.id]);continue}
  busy++;fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(p.w.replace(/ /g,'_')))
  .then(r=>r.ok?r.json():null).then(j=>{const u=(j&&j.type!=='disambiguation'&&j.thumbnail)?j.thumbnail.source:'';IMG[p.id]=u;saveImg();if(u)put(el,u)})
  .catch(()=>{}).then(()=>{busy--;pump()})}}

// ---------- Onglets ----------
let cur='pack';
function show(t){cur=t;$$('.tab').forEach(e=>e.classList.toggle('on',e.id==='tab-'+t));$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));render();window.scrollTo(0,0)}
function render(){renderTop();if(cur==='pack')renderPack();if(cur==='col')renderCol();if(cur==='auc')renderAuc();if(cur==='pro')renderPro();
  if(cur==='ami'&&window.FOOT_AMIS)window.FOOT_AMIS.render()}
function renderTop(){$('#coins').textContent=S.coins.toLocaleString('fr-FR')+' 🪙'}

// ---------- Boosters ----------
function bagHTML(id){return '<div class="bag" id="'+id+'"><div class="ptop"></div><div class="pbot"><div class="emb"><div class="stars">★ ★ ★</div><div class="ball">⚽</div><div class="gl"></div></div></div><div class="dash"></div><div class="cut"></div></div>'}
let opening=false;
function renderPack(){recharge();if(!$('#pack')){$('#packWrap').innerHTML=bagHTML('pack');$('#pack').onclick=clickPack}
  const can=S.free>0||S.coins>=PACK_PRICE;$('#pack').classList.toggle('ready',can);$('#pack').classList.toggle('empty',!can);
  $('#packInfo').innerHTML='🎁 Boosters gratuits : <b>'+S.free+' / '+FREE_MAX+'</b>'+(S.free<FREE_MAX?' · prochain dans <b>'+fmt(S.freeT+FREE_MS-Date.now())+'</b>':'')+
  '<br><span class="muted">'+(S.free>0?'Touche le booster pour l\'ouvrir !':'Booster payant : '+PACK_PRICE+' 🪙')+'</span>'}
function clickPack(){if(opening)return;recharge();
  if(S.free>0){S.free--;openPack()}
  else if(S.coins>=PACK_PRICE)ask('Acheter un booster pour <b>'+PACK_PRICE+' 🪙</b> ?',()=>{S.coins-=PACK_PRICE;openPack()});
  else toast('Pas assez de pièces 😢 Vends des doublons ou attends un booster gratuit.')}
function openPack(){opening=true;const res=draw().map(p=>{const isNew=!S.col[p.id];S.col[p.id]=(S.col[p.id]||0)+1;return{p:p,isNew:isNew}});
  S.opened++;save();renderTop();
  const ov=$('#open');ov.classList.add('on');
  ov.innerHTML='<div class="stage"><p class="hint">👆 Touche le booster pour l\'ouvrir<br><small>ou glisse ton doigt sur les pointillés ✂️</small></p>'+bagHTML('pk')+'</div>';
  tear($('#pk'),()=>showCards(res))}
function tear(el,done){let sx=null,fin=false,moved=false;const cut=el.querySelector('.cut');
  function go(){if(fin)return;fin=true;cut.style.left='0';cut.style.width='100%';el.classList.add('torn');setTimeout(done,800)}
  el.addEventListener('pointerdown',e=>{sx=e.clientX;moved=false;try{el.setPointerCapture(e.pointerId)}catch(_){}});
  el.addEventListener('pointermove',e=>{if(sx===null||fin)return;const r=el.getBoundingClientRect(),d=Math.abs(e.clientX-sx);if(d>8)moved=true;
    cut.style.left=(Math.min(sx,e.clientX)-r.left)+'px';cut.style.width=d+'px';if(d>r.width*0.7)go()});
  el.addEventListener('pointerup',()=>{if(fin)return;if(!moved)go();else cut.style.width='0';sx=null})}
function burst(el,r){const b=document.createElement('div');b.className='burst b'+r;el.appendChild(b);setTimeout(()=>b.remove(),1300)}
function flash(){const f=document.createElement('div');f.className='flash';document.body.appendChild(f);setTimeout(()=>f.remove(),900)}
function showCards(res){const ov=$('#open');
  ov.innerHTML='<div class="stage"><p class="hint">Touche une carte pour la retourner</p><div class="reveal">'+
  res.map((x,i)=>'<div class="flip" data-i="'+i+'"><div class="inner"><div class="back"><div class="ball">⚽</div></div><div class="front">'+cardHTML(x.p,{isNew:x.isNew})+'</div></div></div>').join('')+
  '</div><div class="row"><button class="btn sec" id="allBtn">Tout révéler</button></div></div>';
  loadImgs(ov);let left=res.length;
  function flip(f){if(f.classList.contains('up'))return;f.classList.add('up');const r=res[+f.dataset.i].p.r;f.classList.add('fx'+r);
    if(r>=3)setTimeout(()=>burst(f,r),250);if(r>=4)setTimeout(flash,250);left--;if(!left)setTimeout(summary,900)}
  $$('.flip',ov).forEach(f=>f.onclick=()=>flip(f));
  $('#allBtn').onclick=()=>$$('.flip',ov).forEach((f,i)=>setTimeout(()=>flip(f),i*220));
  function summary(){const nn=res.filter(x=>x.isNew).length,best=res[res.length-1].p;
    ov.querySelector('.hint').innerHTML='✨ '+(nn?nn+(nn>1?' nouveaux joueurs':' nouveau joueur')+' !':'Pas de nouveau joueur cette fois')+'<br><small>Meilleure carte : '+esc(best.n)+' ('+best.note+')</small>';
    recharge();const can=S.free>0||S.coins>=PACK_PRICE;
    ov.querySelector('.row').innerHTML=(can?'<button class="btn" id="again">Encore un booster</button>':'')+'<button class="btn sec" id="closeO">Fermer</button>';
    $('#closeO').onclick=closeOpen;if(can)$('#again').onclick=()=>{closeOpen();clickPack()}}}
function closeOpen(){const ov=$('#open');ov.classList.remove('on');ov.innerHTML='';opening=false;render()}

// ---------- Collection ----------
let colLeague='all',colOnly=false;
function dupInfo(){let n=0,v=0;for(const k in S.col){const p=BY[k];if(p&&S.col[k]>1){n+=S.col[k]-1;v+=(S.col[k]-1)*qs(p)}}return{n:n,v:v}}
function renderCol(){const el=$('#tab-col'),own=PL.filter(p=>S.col[p.id]>0).length,dup=dupInfo();
  let h='<div class="box"><b>'+own+' / '+PL.length+'</b> joueurs collectionnés<div class="bar"><i style="width:'+(own/PL.length*100)+'%"></i></div>'+
  '<div class="row"><button class="btn sec" id="sellAll"'+(dup.n?'':' disabled')+'>Vendre tous les doublons ('+dup.n+') · +'+dup.v+' 🪙</button></div></div>';
  h+='<div class="chips">'+['all'].concat(D.leagues).map(l=>'<button class="chip'+(l===colLeague?' on':'')+'" data-l="'+l+'">'+(l==='all'?'Toutes':l)+'</button>').join('')+'</div>';
  h+='<label class="chk"><input type="checkbox" id="onlyOwn"'+(colOnly?' checked':'')+'> Seulement mes cartes</label>';
  D.teams.filter(t=>colLeague==='all'||t.l===colLeague).forEach(t=>{
    const ps=t.players.slice().sort((a,b)=>b.note-a.note),n=ps.filter(p=>S.col[p.id]>0).length,vis=colOnly?ps.filter(p=>S.col[p.id]>0):ps;
    if(!vis.length)return;
    h+='<div class="team"><div class="thead">'+badge(t)+'<div><b>'+esc(t.n)+'</b><div class="muted">'+t.l+'</div></div><div class="tcount'+(n===ps.length?' full':'')+'">'+n+' / '+ps.length+'</div></div>'+
    '<div class="grid">'+vis.map(p=>S.col[p.id]>0?cardHTML(p,{cnt:S.col[p.id]}):lockedHTML(p)).join('')+'</div></div>'});
  el.innerHTML=h;loadImgs(el);
  $$('.chip',el).forEach(b=>b.onclick=()=>{colLeague=b.dataset.l;renderCol()});
  $('#onlyOwn').onchange=e=>{colOnly=e.target.checked;renderCol()};
  $$('.card[data-id]',el).forEach(c=>c.onclick=()=>detail(c.dataset.id));
  $('#sellAll').onclick=()=>{const d=dupInfo();if(!d.n)return;ask('Vendre <b>'+d.n+'</b> doublons pour <b>'+d.v+' 🪙</b> ?<br><small>Tu gardes 1 exemplaire de chaque joueur.</small>',()=>{
    for(const k in S.col){if(BY[k]&&S.col[k]>1){S.coins+=(S.col[k]-1)*qs(BY[k]);S.col[k]=1}}save();render();toast('💰 +'+d.v+' 🪙')})}}
function detail(id){const p=BY[id],c=S.col[id]||0;
  modal('<div class="big">'+cardHTML(p)+'</div><p class="center"><b>'+esc(p.n)+'</b><br><span class="muted">'+esc(p.t.n)+' · '+p.t.l+' · '+RN[p.r]+(p.fc?' · ⭐ note FC 27':'')+'</span><br>Exemplaires : <b>'+c+'</b> · Cote ≈ <b>'+p.price+' 🪙</b></p>'+
  (c>=2?'<div class="row"><button class="btn sec" id="dQs">Vendre vite (+'+qs(p)+' 🪙)</button><button class="btn" id="dAuc">🔨 Aux enchères</button></div>':'<p class="muted center">Tu pourras la vendre quand tu auras un doublon.</p>')+
  '<div class="row"><button class="btn sec" id="dX">Fermer</button></div>');
  loadImgs($('#modal'));$('#dX').onclick=closeModal;
  if(c>=2){$('#dQs').onclick=()=>{S.col[id]--;S.coins+=qs(p);save();closeModal();toast('💰 +'+qs(p)+' 🪙');render()};
    $('#dAuc').onclick=()=>{if(S.lots.filter(L=>L.seller==='me').length>=3){toast('Maximum 3 ventes en même temps');return}
      S.col[id]--;S.lots.push(mkLot(p,'me'));save();closeModal();toast('🔨 '+esc(p.n)+' est aux enchères !');show('auc')}}}

// ---------- Enchères ----------
function mkLot(p,seller){return{id:Math.random().toString(36).slice(2,9),pid:p.id,seller:seller,bid:Math.max(10,Math.round(p.price*(seller==='me'?0.5:0.4)/10)*10),
  lead:null,my:0,max:Math.round(p.price*(0.75+Math.random()*0.6)),end:Date.now()+(seller==='me'?120:90+Math.random()*210)*1000}}
function nextBid(L){return L.lead?Math.max(L.bid+10,Math.ceil(L.bid*1.08/10)*10):L.bid}
function placeBid(L,who,amt){const n=Date.now();
  if(L.lead==='me'&&who!=='me'){S.coins+=L.my;L.my=0;toast('⚠️ '+esc(who)+' a surenchéri sur '+esc(BY[L.pid].n)+' ! Tes pièces te sont rendues.')}
  if(who==='me'){S.coins-=amt;L.my=amt}L.bid=amt;L.lead=who;if(L.end-n<15000)L.end=n+15000}
function finish(L,late){const p=BY[L.pid];L.done=true;let msg='';
  if(L.lead==='me'&&late&&nextBid(L)<=L.max&&Math.random()<0.6)placeBid(L,rnd(BOTS),nextBid(L));
  if(L.seller==='me'){if(L.lead){S.coins+=L.bid;msg='💰 '+p.n+' vendu à '+L.lead+' pour '+L.bid+' 🪙'}else{S.col[p.id]=(S.col[p.id]||0)+1;msg='↩️ '+p.n+' : aucune offre, carte rendue'}}
  else if(L.lead==='me'){S.col[p.id]=(S.col[p.id]||0)+1;msg='🎉 Tu as remporté '+p.n+' pour '+L.bid+' 🪙'}
  if(msg){S.hist.unshift(msg);S.hist=S.hist.slice(0,8);toast(esc(msg))}}
function tickAuc(){const n=Date.now();let ch=false;
  S.lots.forEach(L=>{if(L.done)return;if(n>=L.end){finish(L,n-L.end>5000);ch=true;return}
    const left=(L.end-n)/1000,nb=nextBid(L);if(nb>L.max)return;
    const pr=L.seller==='me'?(L.lead?0.05:0.08):L.lead==='me'?(left<20?0.3:0.05):(L.lead?0.012:0.03);
    if(Math.random()<pr){let who=rnd(BOTS);if(who===L.lead)who=rnd(BOTS);placeBid(L,who,nb);ch=true}});
  S.lots=S.lots.filter(L=>!L.done);
  while(S.lots.filter(L=>L.seller!=='me').length<4){S.lots.push(mkLot(pickR(wpick(W_AUC)),'bot'));ch=true}
  if(ch){save();renderTop();if(cur==='auc')renderAuc()}
  else if(cur==='auc')$$('.tm2').forEach(e=>e.textContent='⏱️ '+fmt(+e.dataset.end-n))}
function lotHTML(L){const p=BY[L.pid],nb=nextBid(L),me=L.lead==='me';
  return '<div class="lot'+(me?' lead':'')+'"><div class="lc">'+cardHTML(p)+'</div><div class="li"><b>'+esc(p.n)+'</b><div class="muted">'+esc(p.t.n)+' · '+RN[p.r]+' · cote ≈ '+p.price+'</div>'+
  '<div class="lb">'+(L.lead?'Offre : <b>'+L.bid+' 🪙</b> <span class="muted">par '+(me?'toi ✅':esc(L.lead))+'</span>':'Prix de départ : <b>'+L.bid+' 🪙</b>')+'</div>'+
  '<div class="tm2" data-end="'+L.end+'">⏱️ '+fmt(L.end-Date.now())+'</div>'+
  (L.seller==='me'?'<div class="muted">📤 Ta vente</div>':me?'<div class="ok">Tu es en tête !</div>':'<button class="btn" data-bid="'+L.id+'"'+(S.coins<nb?' disabled':'')+'>Enchérir '+nb+' 🪙</button>')+'</div></div>'}
function renderAuc(){const el=$('#tab-auc'),mine=S.lots.filter(L=>L.seller==='me'),mk=S.lots.filter(L=>L.seller!=='me');
  let h='<div class="box muted">Enchéris avant la fin du chrono ⏱️. Si quelqu\'un fait mieux, tes pièces te sont rendues. Pour vendre : Collection → touche un doublon → « Aux enchères ».</div>';
  h+='<h2>🔨 Marché</h2>'+mk.map(lotHTML).join('');
  if(mine.length)h+='<h2>📤 Mes ventes</h2>'+mine.map(lotHTML).join('');
  if(S.hist.length)h+='<h2>📜 Derniers résultats</h2><div class="box">'+S.hist.map(x=>'<div class="hist">'+esc(x)+'</div>').join('')+'</div>';
  el.innerHTML=h;loadImgs(el);
  $$('[data-bid]',el).forEach(b=>b.onclick=()=>{const L=S.lots.find(x=>x.id===b.dataset.bid);if(!L||L.done)return;const nb=nextBid(L);
    if(S.coins<nb){toast('Pas assez de pièces');return}placeBid(L,'me',nb);save();renderTop();renderAuc();toast('✅ Offre de '+nb+' 🪙 placée')})}

// ---------- Profil + Firebase ----------
let db=null,auth=null,user=null,colName=null,cloudT=null,cloudMsg='';
function renderPro(){const el=$('#tab-pro'),own=PL.filter(p=>S.col[p.id]>0).length,dup=dupInfo();
  let h='<div class="box center">';
  if(!auth)h+='<p>'+(cloudMsg||'Chargement de la connexion…')+'</p>';
  else if(user)h+='<p>Connecté : <b>'+esc(user.displayName||user.email||'')+'</b></p><p class="muted">'+cloudMsg+'</p><button class="btn sec" id="bOut">Se déconnecter</button>';
  else h+='<p>Connecte-toi pour retrouver ta collection sur ton téléphone et sur ton PC.</p><button class="btn" id="bIn">Se connecter avec Google</button>';
  h+='</div><div class="box"><h2>📊 Mes stats</h2><p>Joueurs différents : <b>'+own+' / '+PL.length+'</b></p><p>Boosters ouverts : <b>'+S.opened+'</b></p><p>Doublons : <b>'+dup.n+'</b></p>'+
  D.leagues.map(l=>{const ps=PL.filter(p=>p.t.l===l),n=ps.filter(p=>S.col[p.id]>0).length;return '<p>'+l+' : <b>'+n+' / '+ps.length+'</b></p>'}).join('')+
  '<p>⭐ Joueurs avec la vraie note EA FC 27 : <b>'+FC_N+'</b></p></div>';
  el.innerHTML=h;
  if($('#bIn'))$('#bIn').onclick=login;if($('#bOut'))$('#bOut').onclick=()=>auth.signOut()}
function login(){const p=new firebase.auth.GoogleAuthProvider();auth.signInWithPopup(p).catch(e=>{
  if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment')auth.signInWithRedirect(p);
  else if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')toast('Connexion impossible : '+e.code)})}
function cloudSave(){if(!user||!colName)return;clearTimeout(cloudT);cloudT=setTimeout(cloudPush,2000)}
function cloudPush(){if(!user||!colName)return Promise.resolve();
  return db.collection(colName).doc(user.uid).set({foot:JSON.stringify(S),footName:user.displayName||''},{merge:true}).catch(()=>{cloudMsg='⚠️ Erreur de sauvegarde en ligne'})}
async function cloudLoad(){for(const c of ['users','joueurs','players','foot']){try{
    const snap=await db.collection(c).doc(user.uid).get();colName=c;const d=snap.exists?snap.data():null;
    if(d&&d.foot){const cs=fix(JSON.parse(d.foot));const fresh=S.opened===0&&!Object.keys(S.col).length;
      if(fresh||cs.t>S.t){S=cs;localSave();toast('☁️ Sauvegarde récupérée')}}
    cloudMsg='☁️ Sauvegarde en ligne activée';await cloudPush();return}catch(e){}}
  colName=null;cloudMsg='Sauvegarde en ligne refusée : ta partie est gardée sur cet appareil.'}
async function initFB(){if(!window.firebase){cloudMsg='Connexion indisponible : ta partie est gardée sur cet appareil.';render();return}
  let cfg=null;
  for(const f of ['jeu1.js','config.js']){try{const r=await fetch(f+'?x='+Date.now());if(!r.ok)continue;const t=await r.text(),c={};
    ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId'].forEach(k=>{const m=t.match(new RegExp(k+'["\']?\\s*:\\s*["\']([^"\']+)["\']'));if(m)c[k]=m[1]});
    if(c.apiKey&&c.projectId){cfg=c;break}}catch(e){}}
  if(!cfg){cloudMsg='Configuration Firebase introuvable : ta partie est gardée sur cet appareil.';render();return}
  try{firebase.initializeApp(cfg);auth=firebase.auth();db=firebase.firestore()}catch(e){cloudMsg='Erreur Firebase';render();return}
  auth.getRedirectResult().catch(()=>{});
  auth.onAuthStateChanged(async u=>{user=u;colName=null;if(u)await cloudLoad();render();
    FM.onUser.forEach(f=>{try{f(u)}catch(e){console.warn(e)}})})}

// ---------- Accès pour foot-amis.js ----------
const FM={get S(){return S},BY:BY,PL:PL,cardHTML:cardHTML,loadImgs:loadImgs,save:save,render:render,toast:toast,
  modal:modal,closeModal:closeModal,ask:ask,esc:esc,show:show,onUser:[],
  get user(){return user},get db(){return db},get colName(){return colName},get cur(){return cur}};
window.FM=FM;

// ---------- Démarrage ----------
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.t));
recharge();tickAuc();show('pack');
setInterval(()=>{recharge();if(cur==='pack'&&!opening)renderPack();tickAuc()},1000);
initFB();
window.FOOT_JEU=1;
})();
// ===== FIN foot-jeu.js =====
