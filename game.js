'use strict';
const lanes=[170,340,510,680,850];
const kinds=['bottle','plate','mug'];
class Brawl {
 constructor(event=()=>{},random=Math.random){this.event=event;this.random=random;this.mode='title';this.lane=2;this.level=1;this.lives=3;this.score=0;this.count=0;this.shots=[];this.items=[];this.fx=[];this.clock=0;this.cool=0;this.safe=0;this.pose=0;this.reaction=0}
 start(){Object.assign(this,new Brawl(this.event,this.random));this.bar()}
 bar(){this.mode='bar';this.count=0;this.streak=0;this.items=[];this.shots=[];this.threat=null;this.spawn=.35;this.throwIn=3;this.event('bar')}
 move(d){if(this.playing)this.lane=Math.max(0,Math.min(4,this.lane+d))}
 get playing(){return ['bar','duel'].includes(this.mode)}
 fire(){if(!this.playing||this.cool>0)return;this.cool=.22;this.pose=.18;this.shots.push({x:lanes[this.lane],y:422});this.event('shot')}
 addItem(){const type=kinds[Math.floor(this.random()*3)], spec={bottle:[3.4,160],plate:[4.1,90],mug:[2.8,120]}[type];this.items.push({type,t:0,x:885,y:335,duration:spec[0]/Math.min(1.5,1+.07*(this.level-1)),arc:spec[1],end:95+this.random()*200});this.event('toss')}
 damage(){if(this.safe>0)return;this.safe=1.3;this.lives--;this.streak=0;this.event('hurt');if(!this.lives){this.mode='over';this.event('over')}}
 burst(x,y,type){for(let i=0;i<12;i++){let a=i*Math.PI/6;this.fx.push({x,y,vx:Math.cos(a)*(45+this.random()*90),vy:Math.sin(a)*130,life:.48,type})}}
 duel(){this.mode='duel';this.items=[];this.shots=[];this.threat=null;this.bossHP=3;this.phase='enter';this.timer=1.35;this.bossLane=2;this.event('duel')}
 bossStep(dt){this.timer-=dt;if(this.timer>0)return;
 switch(this.phase){case 'enter':case 'recover':this.phase='warn';this.aim=this.lane;this.bossLane=Math.floor(this.random()*5);this.timer=Math.max(.75,1.35-.05*this.level);this.event('warn');break;
 case 'warn':this.phase='strike';this.timer=.25;if(this.lane===this.aim)this.damage();this.event('strike');break;
 case 'strike':this.phase='recover';this.timer=1.65;this.event('open');break}}
 tick(dt){if(!this.playing)return;this.clock+=dt;this.cool=Math.max(0,this.cool-dt);this.pose=Math.max(0,this.pose-dt);this.safe=Math.max(0,this.safe-dt);this.reaction=Math.max(0,this.reaction-dt);
 for(const f of this.fx){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=dt*330}this.fx=this.fx.filter(f=>f.life>0);
 if(this.mode==='bar'){this.spawn-=dt;if(this.spawn<=0){this.addItem();this.spawn=Math.max(.83,1.65-.08*this.level)+this.random()*.4}
 for(const item of this.items){item.t+=dt;const p=item.t/item.duration;item.x=885+(item.end-885)*p;item.y=335+75*p-4*item.arc*p*(1-p)}
 const missed=this.items.some(o=>o.t>=o.duration);if(missed){this.reaction=.45;this.event('miss')}this.items=this.items.filter(o=>o.t<o.duration);
 this.throwIn-=dt;if(!this.threat&&this.throwIn<=0){this.threat={lane:this.lane,t:0};this.event('apple')}
 if(this.threat){this.threat.t+=dt;if(this.threat.t>=1.25){if(this.lane===this.threat.lane)this.damage();this.threat=null;this.throwIn=Math.max(1.5,3.7-.15*this.level)+this.random()}}
 }else this.bossStep(dt);
 if(!this.playing)return;
 for(const s of this.shots){const prev=s.y;s.y-=dt*970;if(this.mode==='bar'){const i=this.items.findIndex(o=>Math.abs(o.x-s.x)<29&&o.y+22>=s.y&&o.y-22<=prev);if(i>=0){const o=this.items.splice(i,1)[0];this.burst(o.x,o.y,o.type);s.used=true;this.streak++;this.count++;this.score+=100+Math.min(5,this.streak-1)*20;this.reaction=.6;this.event('break');if(this.count===20){this.duel();return}}}
 else if(this.phase==='recover'&&s.x===lanes[this.bossLane]&&s.y<=315&&prev>=235){s.used=true;this.bossHP--;this.score+=100;this.burst(s.x,285,'star');this.event('hit');if(!this.bossHP){this.score+=500;this.level++;this.bar();return}this.phase='enter';this.timer=.45}
 if(s.y<35&&!s.used)this.streak=0}
 this.shots=this.shots.filter(s=>!s.used&&s.y>=35)}
}
