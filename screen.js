'use strict';
const $=id=>document.getElementById(id), canvas=document.querySelector('canvas'), ctx=canvas.getContext('2d');
const words={
 en:{score:'Score',round:'Round',target:'Targets',life:'Stars',boss:'Outlaw',start:'Enter the saloon',again:'Play again',resume:'Resume',pause:'Pause',fire:'Fire',mute:'Sound on',silent:'Sound off',best:'Best',help:'Step under a target. Fire upward. Dodge the apple.',keys:'← → or A / D to move · Space to fire · P or Esc to pause',over:'Last call',paused:'Intermission',duel:'Showdown!',warn:'Move!',open:'Fire!',bar:'Break 20 targets',hurt:'Star lost',apple:'Apple incoming',left:'Move left',right:'Move right',loading:'Opening the doors…',err:'Artwork could not load. Refresh to retry.'},
 zh:{score:'得分',round:'回合',target:'目標',life:'警星',boss:'歹徒',start:'進入酒館',again:'再玩一次',resume:'繼續',pause:'暫停',fire:'開火',mute:'音效開',silent:'音效關',best:'最高分',help:'移到目標下方，向上開火，小心飛來的蘋果。',keys:'方向鍵或 A / D 移動 · 空白鍵開火 · P 或 Esc 暫停',over:'打烊了',paused:'中場休息',duel:'酒館對決！',warn:'快閃！',open:'開火！',bar:'擊破 20 個目標',hurt:'失去一顆警星',apple:'小心蘋果',left:'向左移動',right:'向右移動',loading:'開門中…',err:'圖片載入失敗，請重新整理。'}};
function read(k,d){try{return localStorage.getItem('tb-'+k)??d}catch{return d}}
function save(k,v){try{localStorage.setItem('tb-'+k,v)}catch{}}
let lang=read('lang',navigator.language.startsWith('zh')?'zh':'en');if(!words[lang])lang='en';
let muted=read('mute','0')==='1',best=Number(read('best',0))||0,paused=false,ready=false,failed=false,context,notice='',until=0,crowd='',tossTime=-5;
const art={}, reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const w=()=>words[lang];
function tone(freq,end,length,type='sine'){if(muted||!context||context.state!=='running')return;const osc=context.createOscillator(),gain=context.createGain(),t=context.currentTime;osc.type=type;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(end,t+length);gain.gain.setValueAtTime(.065,t);gain.gain.exponentialRampToValueAtTime(.001,t+length);osc.connect(gain);gain.connect(context.destination);osc.start(t);osc.stop(t+length)}
function unlock(){try{context??=new AudioContext();context.resume().catch(()=>{})}catch{}}
function onEvent(e){if(e==='shot')tone(240,55,.09,'triangle');if(e==='break'||e==='hit')tone(980,430,.15);if(e==='hurt')tone(150,65,.3,'sawtooth');if(e==='warn'||e==='apple')tone(320,430,.14);if(e==='toss')tossTime=game.clock;if(e==='break'||e==='miss')crowd=e;
 if(['duel','warn','open','bar','hurt','apple'].includes(e)){notice=e;until=game.clock+(e==='duel'?1.35:.8);$('live').textContent=w()[e]}
 if(e==='over'){best=Math.max(best,game.score);save('best',best);$('start').focus()} sync()}
const game=new Brawl(onEvent);
function sync(){const t=w(),dialog=!game.playing||paused;document.documentElement.lang=lang==='zh'?'zh-Hant':'en';$('cover').hidden=game.mode!=='title';$('hud').hidden=game.mode==='title';$('dialog').hidden=!dialog;$('heading').textContent=paused?t.paused:game.mode==='over'?t.over:'Tavern Brawl';$('hint').textContent=failed?t.err:game.mode==='over'?t.score+' '+game.score:t.help;$('start').textContent=!ready?t.loading:paused?t.resume:game.mode==='over'?t.again:t.start;$('start').disabled=!ready;$('best').textContent=t.best+' · '+best;
 for(const [id,key] of [['scoreLabel','score'],['roundLabel','round'],['lifeLabel','life'],['fire','fire'],['keys','keys']])$(id).textContent=t[key];$('targetLabel').textContent=game.mode==='duel'?t.boss:t.target;$('score').textContent=String(game.score).padStart(5,'0');$('round').textContent=String(game.level).padStart(2,'0');$('stars').textContent='★'.repeat(game.lives)+'☆'.repeat(3-game.lives);$('stars').ariaLabel=String(game.lives);$('targets').textContent=game.mode==='duel'?game.bossHP+'/3':game.count+'/20';$('pause').textContent=paused?t.resume:t.pause;$('sound').textContent=muted?t.silent:t.mute;$('lang').textContent=lang==='en'?'繁中':'EN';$('pause').disabled=!game.playing;for(const id of ['left','right','fire'])$(id).disabled=dialog;$('left').ariaLabel=t.left;$('right').ariaLabel=t.right}
function pause(){if(!game.playing)return;paused=!paused;sync();(paused?$('start'):$('fire')).focus()}
$('start').onclick=()=>{unlock();if(paused){pause();return}notice='';tossTime=-5;game.start();sync();$('fire').focus()};
$('pause').onclick=pause;$('lang').onclick=()=>{lang=lang==='en'?'zh':'en';save('lang',lang);sync()};$('sound').onclick=()=>{muted=!muted;save('mute',+muted);unlock();sync()};
const act=id=>{if(!game.playing||paused)return;if(id==='fire')game.fire();else game.move(id==='left'?-1:1)};
for(const id of ['left','right','fire'])$(id).onclick=()=>act(id);
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;let k=e.key.toLowerCase();if(k==='p'||k==='escape'){if(!e.repeat)pause();return}if(paused||!game.playing)return;const id={arrowleft:'left',a:'left',arrowright:'right',d:'right',' ':'fire'}[k];if(id){if(k===' '&&document.activeElement?.tagName==='BUTTON'&&!['left','right','fire'].includes(document.activeElement.id))return;e.preventDefault();if(!e.repeat)act(id)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.playing&&!paused)pause()});
function sprite(key,x,foot,h,angle=0){const im=art[key],width=h*im.width/im.height;ctx.save();ctx.translate(x,foot-h/2);ctx.rotate(angle);ctx.drawImage(im,-width/2,-h/2,width,h);ctx.restore()}
function oval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function label(s,x,y){ctx.save();ctx.font='bold 22px Georgia,serif';ctx.textAlign='center';let width=ctx.measureText(s).width+24;ctx.fillStyle='#192921ed';ctx.fillRect(x-width/2,y-22,width,30);ctx.fillStyle='#ffe8b5';ctx.fillText(s,x,y);ctx.restore()}
function render(){if(!ready)return;ctx.drawImage(art.saloon,0,0,1024,576);
 if(!reduced&&game.reaction>0&&game.mode==='bar'){const dy=Math.sin(game.reaction*21)*2.4;ctx.drawImage(art.saloon,0,Math.round(art.saloon.height*.09),art.saloon.width,Math.round(art.saloon.height*.20),0,52+dy,1024,116)}
 if(!reduced&&game.clock-tossTime<.35){ctx.save();ctx.globalAlpha=.8;ctx.strokeStyle='#ffe3a1';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(865,337,12+i*6,3.25,4.55);ctx.stroke()}ctx.restore()}
 const danger=game.mode==='duel'&&['warn','strike'].includes(game.phase)?game.aim:game.threat?.lane;
 for(let i=0;i<5;i++){const x=lanes[i];if(i===danger){ctx.fillStyle='#b637303d';ctx.fillRect(x-48,318,96,201);label('!',x,397)}oval(x,522,22,6,'#37251d');oval(x,520,20,4,i===danger?'#ff7461':i===game.lane?'#fcdda2':'#a78049')}
 if(game.mode==='duel'){const x=lanes[game.bossLane];sprite('desperado',x,348,130);if(game.phase==='recover')label(w().open,x,205);if(game.phase==='strike'){ctx.strokeStyle='#ffae65';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,272);ctx.lineTo(lanes[game.aim],503);ctx.stroke()}}
 for(const o of game.items)sprite(o.type,o.x,o.y+22,o.type==='plate'?46:53,reduced?0:o.t*(o.type==='plate'?1.5:3));
 const x=lanes[game.lane];oval(x,518,42,9,'#30211680');ctx.save();ctx.globalAlpha=game.safe>0?.62:1;sprite(game.pose>0?'fire':'sheriff',x,517,game.pose>0?145:120);ctx.restore();
 for(const s of game.shots){ctx.fillStyle='#fff3af';ctx.fillRect(s.x-2,s.y,4,14)}
 if(game.threat){const p=Math.min(1,game.threat.t/1.25),ax=80+(lanes[game.threat.lane]-80)*p,ay=430+56*p-210*p*(1-p);oval(ax,ay,13,12,'#aa241c');oval(ax-4,ay-3,5,5,'#ef6440');oval(ax+4,ay-13,6,3,'#839c4a')}
 for(const f of game.fx){ctx.fillStyle=f.type==='bottle'?'#81ecdd':'#fff0bb';ctx.fillRect(f.x,f.y,5,4)}
 if(game.clock<until&&notice)label(w()[notice],512,90);
 if(game.reaction>0&&crowd==='break'&&game.streak>=3)label('×'+game.streak,512,176)}
let last=0;function frame(now){let dt=Math.min(.05,(now-last)/1000);last=now;if(!paused)game.tick(dt);render();requestAnimationFrame(frame)}
sync();Promise.all(['saloon','sheriff','fire','desperado',...kinds].map(async key=>{const im=new Image();im.src='assets/'+key+'.webp';await im.decode();art[key]=im})).then(()=>{ready=true;sync();requestAnimationFrame(frame)}).catch(()=>{failed=true;sync()});
