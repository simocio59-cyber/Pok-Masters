// ===== jeu3.js : questions du quiz (tout l'univers Pokémon) =====
const QC={who:'🔍 Quel est ce Pokémon ?',type:'🏷️ Types',weak:'⚔️ Faiblesses',res:'🛡️ Résistances',gen:'📅 Générations & régions',dex:'🔢 Pokédex',stat:'📊 Stats',which:'🎯 Trouve le bon',cmp:'⚖️ Comparaison',leg:'👑 Légendaires',mega:'💎 Méga-Évolution',eff:'🧪 Table des types'};
const QTC={E:'🔄 Évolutions',S:'🌱 Starters',C:'🏟️ Champions & personnages',R:'🗺️ Régions',O:'🎒 Objets',A:'💥 Attaques',D:'🧠 Culture Pokémon'};
const SN6F=['PV','Attaque','Défense','Attaque Spéciale','Défense Spéciale','Vitesse'];
const qL=(label,img)=>({label:String(label),img:img||0});
const qn=p=>esc(p.m.n);
const qtl=t=>t.map(tn).join(' / ');
const qOrd=n=>n===1?'1re':n+'e';
const qGenL=g=>`${qOrd(g)} génération (${GENS[g-1][2]})`;
const qdec=v=>String(v/10).replace('.',',');
const qsum=m=>m.s.reduce((a,c)=>a+c,0);
function mk(cat,text,good,bad,o={}){
 const opts=shuffle([good,...bad.slice(0,3)]);
 if(o.img){const im=new Image();im.src=IMG(o.img.id)}
 return{cat,text,img:o.img||null,opts,ans:opts.indexOf(good),long:o.long||opts.some(x=>x.label.length>18),expl:o.expl||'',extra:o.extra||0};
}
async function qPokes(n,f){
 const ids=new Set();while(ids.size<n+3)ids.add(1+rnd(NMAX));
 await withTO(Promise.all([...ids].map(getMeta)),6000);
 let out=[...ids].filter(id=>META[id]).map(id=>({id,m:META[id]}));
 if(out.length<n+3){const pool=shuffle(Object.keys(META).map(Number).filter(id=>id<=NMAX&&!ids.has(id)));for(const id of pool){if(out.length>=n+3)break;out.push({id,m:META[id]})}}
 if(f)out=out.filter(f);
 const seen=new Set();out=out.filter(p=>{if(seen.has(p.m.n))return false;seen.add(p.m.n);return true});
 return out.length>=n?out.slice(0,n):null;
}

/* --- Quel est ce Pokémon ? --- */
async function qWho(){
 const ps=await qPokes(4);if(!ps)return null;const t=ps[0],mode=pick(['sil','sil','blur','zoom']);
 const txt=mode==='zoom'?'Qui se cache derrière ce gros plan ?':mode==='blur'?'Quel est ce Pokémon tout flou ?':'Quel est ce Pokémon ?';
 return mk(QC.who,txt,qL(t.m.n),ps.slice(1).map(p=>qL(p.m.n)),{img:{id:t.id,mode},expl:`C'était <b>${qn(t)}</b> !`});
}
/* --- Types d'un Pokémon --- */
async function qType(){
 const ps=await qPokes(1);if(!ps)return null;const t=ps[0],ty=t.m.t,key=x=>[...x].sort().join();
 const bad=[],seen=new Set([key(ty)]);let g=0;
 while(bad.length<3&&g++<80){const a=Math.random()<.5?pick(ty):pick(TK);let c=Math.random()<.5?[a]:[a,pick(TK)];if(c[1]===c[0])c=[a];if(seen.has(key(c)))continue;seen.add(key(c));bad.push(qL(qtl(c)))}
 return mk(QC.type,`Quel est le type de <b>${qn(t)}</b> ?`,qL(qtl(ty)),bad,{img:{id:t.id,mode:''},expl:`${qn(t)} est de type ${qtl(ty)}.`});
}
/* --- Faiblesses / résistances --- */
async function qWeak(){
 const ps=await qPokes(1);if(!ps)return null;const t=ps[0],ty=t.m.t;
 const w=TK.filter(a=>eff(a,ty)>=2),n=TK.filter(a=>eff(a,ty)<=1);if(!w.length||n.length<3)return null;
 return mk(QC.weak,`Quel type d'attaque est <b>super efficace</b> contre <b>${qn(t)}</b> (${qtl(ty)}) ?`,qL(tn(pick(w))),shuffle(n).map(a=>qL(tn(a))),{img:{id:t.id,mode:''},expl:`${qn(t)} craint : ${w.map(tn).join(', ')}.`});
}
async function qRes(){
 const ps=await qPokes(1);if(!ps)return null;const t=ps[0],ty=t.m.t;
 const r=TK.filter(a=>eff(a,ty)<1),n=TK.filter(a=>eff(a,ty)>=1);if(!r.length||n.length<3)return null;
 return mk(QC.res,`Quel type d'attaque est <b>peu efficace</b> (ou sans effet) contre <b>${qn(t)}</b> (${qtl(ty)}) ?`,qL(tn(pick(r))),shuffle(n).map(a=>qL(tn(a))),{img:{id:t.id,mode:''},expl:`${qn(t)} résiste à : ${r.map(tn).join(', ')}.`});
}
/* --- Génération / région --- */
async function qGen(){
 const ps=await qPokes(1);if(!ps)return null;const t=ps[0],g=genOf(t.id),reg=Math.random()<.5;
 const lab=x=>reg?GENS[x-1][2]:qGenL(x),o=shuffle([1,2,3,4,5,6,7,8,9].filter(x=>x!==g));
 return mk(QC.gen,reg?`Dans quelle région <b>${qn(t)}</b> est-il apparu pour la première fois ?`:`De quelle génération vient <b>${qn(t)}</b> ?`,qL(lab(g)),o.map(x=>qL(lab(x))),{img:{id:t.id,mode:''},expl:`${qn(t)} vient de la ${qGenL(g)}.`});
}
/* --- Numéro du Pokédex --- */
async function qDex(){
 const ps=await qPokes(1);if(!ps)return null;const t=ps[0],b=baseOf(t.id),s=new Set([b]);let g=0;
 while(s.size<4&&g++<99){const x=b+rnd(61)-30;if(x>=1&&x<=NMAX)s.add(x)}
 if(s.size<4)return null;
 return mk(QC.dex,`Quel est le numéro de <b>${qn(t)}</b> dans le Pokédex national ?`,qL('#'+pad(b)),[...s].slice(1).map(x=>qL('#'+pad(x))),{img:{id:t.id,mode:''},expl:`${qn(t)} porte le n°${pad(b)}.`,extra:2});
}
/* --- Meilleure stat --- */
async function qStat(){
 const ps=await qPokes(1);if(!ps)return null;const t=ps[0],s=t.m.s,mx=Math.max(...s);if(s.filter(x=>x===mx).length>1)return null;const i=s.indexOf(mx);
 return mk(QC.stat,`Quelle est la <b>meilleure statistique</b> de <b>${qn(t)}</b> ?`,qL(SN6F[i]),shuffle(SN6F.filter((_,j)=>j!==i)).map(x=>qL(x)),{img:{id:t.id,mode:''},expl:s.map((v,j)=>SN6[j]+' '+v).join(' · ')});
}
/* --- Lequel est de tel type ? --- */
async function qWhich(){
 const ps=await qPokes(8);if(!ps)return null;const t=ps[0],T=pick(t.m.t),o=ps.slice(1).filter(p=>!p.m.t.includes(T));if(o.length<3)return null;
 return mk(QC.which,`Lequel de ces Pokémon est de type <b>${tn(T)}</b> ?`,qL(t.m.n,t.id),o.map(p=>qL(p.m.n,p.id)),{expl:`${qn(t)} est de type ${qtl(t.m.t)}.`});
}
/* --- Comparaisons --- */
const QCMP=[
 ['Lequel de ces Pokémon est le <b>plus rapide</b> ?',m=>m.s[5],v=>v+' Vit.'],
 ['Lequel de ces Pokémon est le <b>plus lent</b> ?',m=>-m.s[5],v=>(-v)+' Vit.'],
 ['Lequel de ces Pokémon a le <b>plus de PV</b> ?',m=>m.s[0],v=>v+' PV'],
 ['Lequel de ces Pokémon a la <b>meilleure Attaque</b> ?',m=>m.s[1],v=>v+' Atq.'],
 ['Lequel de ces Pokémon a la <b>meilleure Défense</b> ?',m=>m.s[2],v=>v+' Déf.'],
 ['Lequel de ces Pokémon est le <b>plus lourd</b> ?',m=>m.w,v=>qdec(v)+' kg'],
 ['Lequel de ces Pokémon est le <b>plus léger</b> ?',m=>-m.w,v=>qdec(-v)+' kg'],
 ['Lequel de ces Pokémon est le <b>plus grand</b> ?',m=>m.h,v=>qdec(v)+' m'],
 ['Lequel de ces Pokémon a le <b>meilleur total de stats</b> ?',m=>qsum(m),v=>v+' au total']];
async function qCmp(){
 const c=pick(QCMP),ps=await qPokes(4);if(!ps)return null;const v=ps.map(p=>c[1](p.m));
 if(v.some(x=>typeof x!=='number'||isNaN(x)))return null;const mx=Math.max(...v);if(v.filter(x=>x===mx).length>1)return null;const i=v.indexOf(mx);
 return mk(QC.cmp,c[0],qL(ps[i].m.n,ps[i].id),ps.filter((_,j)=>j!==i).map(p=>qL(p.m.n,p.id)),{expl:ps.map((p,j)=>`${qn(p)} : ${c[2](v[j])}`).join(' · '),extra:2});
}
/* --- Légendaires & Méga --- */
async function qLeg(){
 const id=pick([...LEG,...MYTH]),m=await withTO(getMeta(id),5000);if(!m)return null;
 const o=await qPokes(3,p=>!LEGS.has(p.id)&&!MYTHS.has(p.id)&&p.m.n!==m.n);if(!o)return null;
 return mk(QC.leg,'Lequel de ces Pokémon est <b>légendaire ou fabuleux</b> ?',qL(m.n,id),o.map(p=>qL(p.m.n,p.id)),{expl:`${esc(m.n)} est ${MYTHS.has(id)?'fabuleux':'légendaire'} !`});
}
const QMB=new Set(MEGA_IDS.map(x=>MEGA[x][0]));
async function qMega(){
 const id=pick([...QMB]),m=await withTO(getMeta(id),5000);if(!m)return null;
 const o=await qPokes(3,p=>!QMB.has(p.id)&&p.m.n!==m.n);if(!o)return null;
 return mk(QC.mega,'Lequel de ces Pokémon possède une <b>Méga-Évolution</b> ?',qL(m.n,id),o.map(p=>qL(p.m.n,p.id)),{expl:`${esc(m.n)} peut méga-évoluer !`});
}
/* --- Table des types (sans Pokémon) --- */
function qEff(){
 const a=pick(TK);
 if(Math.random()<.3){const z=TK.filter(d=>CHART[a][d]===0);if(z.length===1)return mk(QC.eff,`Quel type est <b>immunisé</b> contre les attaques de type <b>${tn(a)}</b> ?`,qL(tn(z[0])),shuffle(TK.filter(d=>CHART[a][d]!==0)).map(d=>qL(tn(d))),{expl:`Les attaques ${tn(a)} n'ont aucun effet sur le type ${tn(z[0])}.`})}
 const s=TK.filter(d=>CHART[a][d]===2);if(!s.length)return null;
 return mk(QC.eff,`Une attaque de type <b>${tn(a)}</b> est super efficace contre quel type ?`,qL(tn(pick(s))),shuffle(TK.filter(d=>CHART[a][d]!==2)).map(d=>qL(tn(d))),{expl:`${tn(a)} est super efficace contre : ${s.map(tn).join(', ')}.`});
}
/* --- Banque de culture Pokémon : catégorie|question|BONNE|faux|faux|faux --- */
const QT=`E|En quoi évolue Pikachu avec une Pierre Foudre ?|Raichu|Pichu|Électhor|Élektek
E|Quelle pierre fait évoluer Évoli en Aquali ?|Pierre Eau|Pierre Lune|Pierre Glace|Pierre Feu
E|Quelle pierre fait évoluer Évoli en Pyroli ?|Pierre Feu|Pierre Soleil|Pierre Foudre|Pierre Plante
E|Quelle pierre fait évoluer Évoli en Voltali ?|Pierre Foudre|Pierre Feu|Pierre Eau|Pierre Lune
E|Comment Évoli évolue-t-il en Mentali ?|Par l'amitié, de jour|Avec une Pierre Lune|Par échange|Au niveau 36
E|Quelle est l'évolution finale de Salamèche ?|Dracaufeu|Reptincel|Dracolosse|Galopa
E|En quoi évolue Magicarpe ?|Léviator|Lokhlass|Hypocéan|Tentacruel
E|Quel Pokémon évolue en Ectoplasma par échange ?|Spectrum|Fantominus|Mélodelfe|Ténéfix
E|Quelle est la pré-évolution de Pikachu ?|Pichu|Raichu|Pachirisu|Togepi
E|Combien d'évolutions différentes Évoli possède-t-il ?|8|5|7|9
E|Quel Pokémon évolue en Lucario ?|Riolu|Machoc|Ponchiot|Kicklee
E|En quoi évolue Goinfrex ?|Ronflex|Mammochon|Grolem|Ursaring
E|En quoi évolue Chenipan ?|Chrysacier|Papilusion|Coconfort|Aspicot
E|Quel Pokémon évolue en Dracolosse ?|Draco|Minidraco|Draby|Griknot
E|Quel objet fait évoluer Onix en Steelix lors d'un échange ?|Peau Métal|Roche Royale|Pierre Éclat|Écaille Draco
E|Quel Pokémon évolue en Togekiss ?|Togetic|Togepi|Roucarnage|Mélofée
E|Quelle est l'évolution finale de Bulbizarre ?|Florizarre|Herbizarre|Méganium|Empiflor
E|Quelle est l'évolution finale de Carapuce ?|Tortank|Carabaffe|Torterra|Aligatueur
E|Quelle pierre fait évoluer Mélofée en Mélodelfe ?|Pierre Lune|Pierre Éclat|Pierre Soleil|Pierre Aube
E|En quoi évolue Ponyta ?|Galopa|Arcanin|Simiabraz|Démolosse
E|Quel Pokémon évolue en Arcanin ?|Caninos|Goupix|Ponyta|Rapasdepic
E|En quoi évolue Machopeur par échange ?|Mackogneur|Machoc|Colossinge|Hariyama
E|En quoi évolue Rattata ?|Rattatac|Fouinar|Ratentif|Keunotor
S|Quel est le starter de type Feu de Johto ?|Héricendre|Poussifeu|Ouisticram|Gruikui
S|Quel est le starter de type Plante de Hoenn ?|Arcko|Germignon|Tortipouss|Vipélierre
S|Quel est le starter de type Eau de Sinnoh ?|Tiplouf|Gobou|Moustillon|Grenousse
S|Quel est le starter de type Feu de Kalos ?|Feunnec|Flamiaou|Flambino|Chochodile
S|Quel est le starter de type Eau d'Alola ?|Otaquin|Larméléon|Grenousse|Kaiminus
S|Quel est le starter de type Plante de Galar ?|Ouistempo|Brindibou|Poussacha|Marisson
S|Quel est le starter de type Feu de Paldea ?|Chochodile|Flambino|Poussifeu|Héricendre
S|Quel est le starter de type Plante de Paldea ?|Poussacha|Coiffeton|Ouistempo|Germignon
S|Quel est le starter de type Eau de Paldea ?|Coiffeton|Larméléon|Otaquin|Moustillon
S|Quel est le starter de type Feu d'Unys ?|Gruikui|Ouisticram|Feunnec|Flamiaou
S|Quel est le starter de type Eau de Johto ?|Kaiminus|Gobou|Tiplouf|Carapuce
S|Quel est le starter de type Plante de Kanto ?|Bulbizarre|Germignon|Mystherbe|Saquedeneu
S|Quel est le starter dans Pokémon Jaune ?|Pikachu|Évoli|Salamèche|Carapuce
S|Quel est le type de Brindibou, le starter Plante d'Alola ?|Plante / Vol|Plante|Plante / Spectre|Plante / Fée
C|Qui est la championne d'arène de type Eau d'Azuria ?|Ondine|Erika|Sabrina|Jasmine
C|Qui est le champion d'arène de type Roche d'Argenta ?|Pierre|Major Bob|Koga|Auguste
C|Quel type de Pokémon utilise le Major Bob ?|Électrik|Combat|Acier|Sol
C|Quel type de Pokémon utilise Erika ?|Plante|Poison|Fée|Insecte
C|Quel type de Pokémon utilise Sabrina ?|Psy|Spectre|Ténèbres|Fée
C|Qui est le chef de la Team Rocket ?|Giovanni|Peter|Ghetis|Max
C|Dans quelle ville se trouve l'arène d'Ondine ?|Azuria|Carmin sur Mer|Céladopole|Parmanie
C|Qui est le Maître de la Ligue à la fin de Pokémon Rouge et Bleu ?|Ton rival|Peter|Agatha|Giovanni
C|Quel type de Pokémon préfère Peter, du Conseil 4 ?|Dragon|Glace|Spectre|Combat
C|Qui est la Maîtresse de la Ligue de Sinnoh ?|Cynthia|Iris|Ondine|Erika
C|Qui est le professeur Pokémon de Kanto ?|Professeur Chen|Professeur Orme|Professeur Sorbier|Professeur Seko
C|Qui est le professeur Pokémon de Hoenn ?|Professeur Seko|Professeur Chen|Professeur Platane|Professeur Orme
C|Qui est le professeur Pokémon de Kalos ?|Professeur Platane|Professeur Euphorbe|Professeur Magnolia|Professeur Orme
C|Quelle équipe veut réveiller Groudon dans Pokémon Rubis ?|Team Magma|Team Aqua|Team Galaxie|Team Plasma
C|Qui dirige la Team Galaxie ?|Hélio|Ghetis|Arthur|Max
C|Quel Pokémon parle et fait partie de la Team Rocket ?|Miaouss|Abo|Smogo|Qulbutoké
C|Quel est le premier Pokémon de Sacha dans le dessin animé ?|Pikachu|Salamèche|Évoli|Roucool
R|Dans quelle région se déroulent Pokémon Rouge et Bleu ?|Kanto|Johto|Hoenn|Sinnoh
R|Dans quelle région se déroulent Pokémon Or et Argent ?|Johto|Kanto|Unys|Kalos
R|Dans quelle région se déroulent Pokémon Diamant et Perle ?|Sinnoh|Hoenn|Johto|Unys
R|Dans quelle région se déroulent Pokémon Écarlate et Violet ?|Paldea|Galar|Alola|Kalos
R|De quel pays s'inspire la région de Kalos ?|La France|Le Royaume-Uni|L'Espagne|Le Japon
R|De quel pays s'inspire la région de Galar ?|Le Royaume-Uni|La France|L'Allemagne|Les États-Unis
R|De quel endroit s'inspire la région d'Alola ?|Hawaï|Le Japon|L'Italie|L'Australie
R|Quelle région s'inspire de la ville de New York ?|Unys|Kalos|Hoenn|Galar
R|Quelle région s'inspire de l'Espagne et du Portugal ?|Paldea|Kalos|Galar|Unys
R|Comment s'appelle la ville de départ de Kanto ?|Bourg Palette|Jadielle|Bourg Geon|Argenta
O|Quelle Poké Ball capture un Pokémon à coup sûr ?|Master Ball|Hyper Ball|Super Ball|Rapide Ball
O|Quel objet soigne 20 PV ?|Potion|Super Potion|Rappel|Antidote
O|Quel objet ranime un Pokémon K.O. ?|Rappel|Potion|Élixir|Antidote
O|Quel objet est nécessaire pour méga-évoluer ?|Une Méga-Gemme|Un Cristal Z|Une Pierre Lune|Un Super Bonbon
O|Quel objet empêche un Pokémon d'évoluer ?|Pierre Stase|Restes|Pierre Éclat|Œuf Chance
O|Quel objet tenu rend des PV à chaque tour ?|Restes|Orbe Vie|Mouchoir Choix|Pierre Stase
O|Quel objet réveille le Ronflex qui bloque la route dans Pokémon Rouge et Bleu ?|Poké Flûte|Super Bonbon|Potion|Repousse
O|À quoi sert un Super Bonbon ?|Faire monter d'un niveau|Soigner les PV|Capturer un Pokémon|Faire fuir les Pokémon
O|Quelle Poké Ball est plus efficace au premier tour ?|Rapide Ball|Sombre Ball|Bis Ball|Filet Ball
O|À quoi sert un Repousse ?|Éloigner les Pokémon sauvages|Soigner le poison|Ranimer un Pokémon|Faire évoluer
A|Quel est le type de l'attaque Lance-Flammes ?|Feu|Dragon|Normal|Combat
A|Quel est le type de l'attaque Tonnerre ?|Électrik|Normal|Vol|Psy
A|Quel est le type de l'attaque Hydrocanon ?|Eau|Glace|Normal|Acier
A|Quel est le type de l'attaque Séisme ?|Sol|Roche|Combat|Normal
A|Quel est le type de l'attaque Psyko ?|Psy|Spectre|Ténèbres|Fée
A|Quel est le type de l'attaque Ball'Ombre ?|Spectre|Ténèbres|Psy|Poison
A|Quelle attaque met K.O. le Pokémon qui l'utilise ?|Explosion|Ultralaser|Damoclès|Riposte
A|Quelle attaque oblige à se reposer au tour suivant ?|Ultralaser|Vive-Attaque|Abri|Morsure
A|Quelle attaque frappe presque toujours en premier ?|Vive-Attaque|Plaquage|Charge|Tranche
A|Quelle attaque Magicarpe connaît-il au départ ?|Trempette|Charge|Pistolet à O|Fléau
A|Quelle attaque protège complètement pendant un tour ?|Abri|Repos|Reflet|Mur Lumière
A|Quelle attaque endort le lanceur pour le soigner entièrement ?|Repos|Berceuse|Synthèse|Abri
D|Quel est le Pokémon n°001 du Pokédex national ?|Bulbizarre|Pikachu|Mew|Arceus
D|Quel est le Pokémon n°025 du Pokédex national ?|Pikachu|Raichu|Rattata|Miaouss
D|De quel Pokémon Mewtwo est-il le clone ?|Mew|Arceus|Celebi|Jirachi
D|Combien de types de Pokémon existe-t-il ?|18|15|17|20
D|Quel type a été ajouté dans la 6e génération ?|Fée|Acier|Ténèbres|Dragon
D|Quels types ont été ajoutés dans la 2e génération ?|Acier et Ténèbres|Fée et Acier|Dragon et Spectre|Ténèbres et Fée
D|Quel Pokémon est considéré comme le créateur de l'univers Pokémon ?|Arceus|Mew|Dialga|Rayquaza
D|Quel Pokémon légendaire contrôle le temps ?|Dialga|Palkia|Giratina|Darkrai
D|Quel Pokémon légendaire contrôle l'espace ?|Palkia|Dialga|Giratina|Kyogre
D|Quel est le trio d'oiseaux légendaires de Kanto ?|Artikodin, Électhor, Sulfura|Raikou, Entei, Suicune|Créhelf, Créfollet, Créfadet|Regirock, Regice, Registeel
D|Quel Pokémon est sur la jaquette de Pokémon Rubis ?|Groudon|Kyogre|Rayquaza|Latios
D|Quel Pokémon est sur la jaquette de Pokémon Écarlate ?|Koraidon|Miraidon|Zacian|Solgaleo
D|Quel Pokémon est sur la jaquette de Pokémon Épée ?|Zacian|Zamazenta|Éthernatos|Xerneas
D|Comment appelle-t-on un Pokémon rare de couleur différente ?|Chromatique (shiny)|Alpha|Méga|Fabuleux
D|Quel Pokémon a le plus de PV de base de tous ?|Leuphorie|Ronflex|Wailord|Leveinard
D|Quel phénomène de Galar fait grandir les Pokémon ?|Le Dynamax|La Méga-Évolution|La Téracristallisation|Les capacités Z
D|Quel phénomène de Paldea peut changer le type d'un Pokémon ?|La Téracristallisation|Le Dynamax|La Méga-Évolution|Le Gigamax
D|Dans quelle génération la Méga-Évolution est-elle apparue ?|6e (Kalos)|4e (Sinnoh)|5e (Unys)|7e (Alola)
D|Combien de Pokémon peut-on avoir au maximum dans son équipe ?|6|4|5|8
D|Combien de badges faut-il en général pour affronter la Ligue ?|8|6|10|12
D|Quel est le célèbre Pokémon « bug » de Pokémon Rouge et Bleu ?|MissingNo.|Mew|Porygon|Métamorph
D|Quel Pokémon peut se transformer en n'importe quel autre Pokémon ?|Métamorph|Caninos|Porygon|Kecleon`.trim().split('\n').map(l=>l.split('|'));
const TUSED=new Set();
function qTriv(){
 if(TUSED.size>=QT.length)TUSED.clear();let i;do{i=rnd(QT.length)}while(TUSED.has(i));TUSED.add(i);
 const[c,t,g,...b]=QT[i];
 return mk(QTC[c]||QTC.D,esc(t),qL(g),b.map(x=>qL(x)),{expl:`Réponse : <b>${esc(g)}</b>`,extra:3});
}

/* --- Choix aléatoire d'une question --- */
const QGEN=[[qWho,5],[qType,2],[qWeak,2],[qRes,1],[qGen,2],[qDex,1],[qStat,1],[qWhich,2],[qCmp,3],[qLeg,1],[qMega,1],[qEff,2],[qTriv,7]];
const qW=a=>{let r=Math.random()*a.reduce((s,x)=>s+x[1],0);for(const x of a){if((r-=x[1])<0)return x[0]}return a[0][0]};
let qLast=null;
async function makeQ(lvl){
 for(let t=0;t<5;t++){
  const f=qW(QGEN);if(f===qLast&&f!==qTriv&&t<4)continue;
  try{const q=await withTO(Promise.resolve(f(lvl)),9000);if(q&&q.opts&&q.opts.length===4&&q.ans>=0){qLast=f;return q}}catch(e){}
 }
 qLast=qTriv;return qTriv();
}
window.P3=1;
// ===== FIN jeu3.js =====
