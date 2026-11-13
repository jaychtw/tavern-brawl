const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const rules = fs.readFileSync(require.resolve('../game.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(rules, context);
const result = vm.runInContext('(' + simulate.toString() + ')()', context);
assert.equal(result.level, 2);
assert.equal(result.maxCount, 20);
assert.equal(result.stars, 3);
const state = vm.runInContext(`(() => {
 const g = new Brawl(); g.start();
 for(let i=0;i<9;i++)g.move(-1); if(g.lane!==0)throw Error('Left boundary');
 for(let i=0;i<9;i++)g.move(1); if(g.lane!==4)throw Error('Right boundary');
 for(let i=0;i<3;i++){g.safe=0;g.damage()}
 if(g.mode!=='over')throw Error('Game over');
 g.start();return [g.mode,g.level,g.lives,g.score,g.lane].join(',');
})()`,context);
assert.equal(state,'bar,1,3,0,2');
console.log('PASS: bar targets, showdown, next round, dodging, movement bounds, damage, restart');
function simulate(){const g=new Brawl(()=>{},()=>.5);g.start();let maxCount=0,duel=false;for(let n=0;n<14000;n++){if(g.mode==='bar'){let target=g.items[0];if(target){const desired=lanes.reduce((i,x,j)=>Math.abs(x-target.x)<Math.abs(lanes[i]-target.x)?j:i,0);if(g.lane!==desired)g.move(Math.sign(desired-g.lane));g.fire()}if(g.threat&&g.threat.t>1.05&&g.threat.lane===g.lane)g.move(g.lane===4?-1:1)}else if(g.mode==='duel'){duel=true;if(g.phase==='warn'&&g.lane===g.aim)g.move(g.lane===4?-1:1);if(g.phase==='recover'){if(g.lane!==g.bossLane)g.move(Math.sign(g.bossLane-g.lane));g.fire()}}g.tick(1/60);maxCount=Math.max(maxCount,g.count);if(g.level===2)return {duel,maxCount,level:g.level,stars:g.lives}}throw Error('progression failed: '+g.mode)}
