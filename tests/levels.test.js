const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const match=html.match(/const LEVELS = (\[[\s\S]*?\]);/);
assert.ok(match,'HTML embeds static LEVELS array');
const levels=JSON.parse(match[1]);
const dirs=[['U',0,-1],['D',0,1],['L',-1,0],['R',1,0]];
function cells(b){const arr=[[b.x,b.y]];if(b.o==='H')arr.push([b.x+1,b.y]);if(b.o==='V')arr.push([b.x,b.y+1]);return arr;}
function roll(b,dx,dy){
 const {x,y,o,bridge}=b;
 if(o==='U'){
  if(dx===1)return {x:x+1,y,o:'H',bridge};if(dx===-1)return {x:x-2,y,o:'H',bridge};
  if(dy===1)return {x,y:y+1,o:'V',bridge};return {x,y:y-2,o:'V',bridge};
 }
 if(o==='H'){
  if(dx===1)return {x:x+2,y,o:'U',bridge};if(dx===-1)return {x:x-1,y,o:'U',bridge};
  return {x,y:y+dy,o:'H',bridge};
 }
 if(dy===1)return {x,y:y+2,o:'U',bridge};if(dy===-1)return {x,y:y-1,o:'U',bridge};
 return {x:x+dx,y,o:'V',bridge};
}
function simulate(level,from,d,{disableBridge=false,disablePortals=false}={}){
 const grid=level.grid,tile=(x,y)=>grid[y]?.[x]??'.';
 const valid=b=>cells(b).every(([x,y])=>{const t=tile(x,y);return t!=='.'&&t!=='X'&&(t!=='B'||(b.bridge&&!disableBridge))&&(t!=='F'||b.o!=='U');});
 const next=roll(from,d[1],d[2]);if(!valid(next))return null;
 const t=next.o==='U'?tile(next.x,next.y):'';
 if(t==='S')next.bridge=!next.bridge;
 if((t==='A'||t==='P')&&!disablePortals){
  const target=t==='A'?'P':'A',yy=grid.findIndex(row=>row.includes(target));
  if(yy>=0){next.x=grid[yy].indexOf(target);next.y=yy;}
 }
 if(!valid(next))return null;
 return next;
}
function shortest(level,opts={}){
 const start={x:level.start[0],y:level.start[1],o:'U',bridge:false};
 const queue=[[start,0]],seen=new Set();
 for(let i=0;i<queue.length;i++){
  const [b,steps]=queue[i],key=`${b.x},${b.y},${b.o},${b.bridge}`;
  if(seen.has(key))continue;seen.add(key);
  if(b.o==='U'&&level.grid[b.y][b.x]==='G')return steps;
  for(const d of dirs){const n=simulate(level,b,d,opts);if(n)queue.push([n,steps+1]);}
 }
 return null;
}
test('33 distinct layouts, each with valid geometry, safe starting block, and exactly one exit',()=>{
 assert.equal(levels.length,33);
 assert.equal(new Set(levels.map(l=>l.grid.join('/')+':'+l.start.join(','))).size,33);
 for(const [idx,l] of levels.entries()){
  const n=l.grid.length;assert.ok(n>=5&&n<=9,`${idx+1}: board dimensions`);
  assert.ok(l.grid.every(row=>row.length===n),`${idx+1}: square grid`);
  assert.equal(l.grid.join('').split('G').length-1,1,`${idx+1}: one exit`);
  assert.equal(l.grid[l.start[1]][l.start[0]],'#',`${idx+1}: safe starting tile`);
  assert.ok(Number.isInteger(l.par)&&l.par>=l.minMoves,`${idx+1}: par`);
  assert.ok(l.minMoves>=3,`${idx+1}: sufficiently long`);
 }
});
test('Every level has an exact legal solution and independent BFS confirms the shortest path',()=>{
 for(const [idx,l] of levels.entries()){
  assert.equal(l.solution.length,l.minMoves,`${idx+1}: embedded solution length`);
  let b={x:l.start[0],y:l.start[1],o:'U',bridge:false};
  for(const [step,ch] of [...l.solution].entries()){
   const dir=dirs.find(d=>d[0]===ch);assert.ok(dir,`${idx+1} move ${step+1}: direction`);
   b=simulate(l,b,dir);assert.ok(b,`${idx+1} move ${step+1}: legal footprint`);
  }
  assert.equal(b.o,'U',`${idx+1}: upright at finish`);
  assert.equal(l.grid[b.y][b.x],'G',`${idx+1}: ends in exit hole`);
  assert.equal(shortest(l),l.minMoves,`${idx+1}: independently validated shortest path`);
 }
});
test('Bridges and portals are genuinely necessary in their specialist chambers',()=>{
 let nSwitch=0,nPortal=0,nFragile=0;
 for(const [idx,l] of levels.entries()){
  if(l.mechanic==='switch'){nSwitch++;
   assert.ok(l.grid.join('').includes('S')&&l.grid.join('').includes('B'),`${idx+1}: switch and bridge exist`);
   assert.equal(shortest(l,{disableBridge:true}),null,`${idx+1}: cannot bypass the bridge`);
  }
  if(l.mechanic==='portal'){nPortal++;
   assert.ok(l.grid.join('').includes('A')&&l.grid.join('').includes('P'),`${idx+1}: portal pair exists`);
   assert.equal(shortest(l,{disablePortals:true}),null,`${idx+1}: teleport is required`);
  }
  if(l.mechanic==='fragile'){nFragile++;assert.ok(l.grid.join('').includes('F'),`${idx+1}: fragile tiles exist`);}
 }
 assert.ok(nSwitch>=10&&nPortal>=6&&nFragile>=7);
});
test('Physics matches a rigid rectangular 2×1 prism tipping off the current tile',()=>{
 const upright={x:3,y:3,o:'U',bridge:false};
 assert.deepEqual(roll(upright,1,0),{x:4,y:3,o:'H',bridge:false});
 assert.deepEqual(roll(upright,-1,0),{x:1,y:3,o:'H',bridge:false});
 assert.deepEqual(roll(upright,0,1),{x:3,y:4,o:'V',bridge:false});
 assert.deepEqual(roll(upright,0,-1),{x:3,y:1,o:'V',bridge:false});
 assert.deepEqual(roll({x:4,y:3,o:'H',bridge:false},-1,0),{x:3,y:3,o:'U',bridge:false});
 assert.deepEqual(roll({x:3,y:4,o:'V',bridge:false},0,-1),{x:3,y:3,o:'U',bridge:false});
});
test('GitHub Pages ready: standalone HTML with no external resources',()=>{
 assert.ok(html.includes('<meta name="viewport"'));
 assert.ok(html.includes('name="description"'));
 assert.ok(!/<script[^>]+src\s*=/.test(html));
 assert.ok(!/<link[^>]+stylesheet/.test(html));
 assert.ok(html.includes('data-dir="up"')&&html.includes('data-dir="right"'));
});