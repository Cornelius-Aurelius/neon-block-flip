const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const match = html.match(/const LEVELS = (\[[\s\S]*?\]);/);
assert.ok(match,'The page should embed the level definitions');
const levels = JSON.parse(match[1]);
const moves = [[1,0],[-1,0],[0,1],[0,-1]];
function cells(x,y,o){return o==='H'?[[x,y],[x+1,y]]:o==='V'?[[x,y],[x,y+1]]:[[x,y]];}
function move(b,dx,dy){
  const {x,y,o,bridge}=b;
  if(o==='U')return dx===1?{x,y,o:'H',bridge}:dx===-1?{x:x-1,y,o:'H',bridge}:dy===1?{x,y,o:'V',bridge}:{x,y:y-1,o:'V',bridge};
  if(o==='H')return dx===1?{x:x+2,y,o:'U',bridge}:dx===-1?{x:x-1,y,o:'U',bridge}:{x,y:y+dy,o:'H',bridge};
  return dy===1?{x,y:y+2,o:'U',bridge}:dy===-1?{x,y:y-1,o:'U',bridge}:{x:x+dx,y,o:'V',bridge};
}
function shortest(level){
  const grid=level.grid,tile=(x,y)=>grid[y]?.[x]??'.';
  const valid=(b)=>cells(b.x,b.y,b.o).every(([x,y])=>{const t=tile(x,y);return t!=='.'&&t!=='X'&&(t!=='B'||b.bridge)&&(t!=='F'||b.o!=='U');});
  const q=[[{x:level.start[0],y:level.start[1],o:'U',bridge:false},0]],seen=new Set();
  for(let i=0;i<q.length;i++){
    const [b,steps]=q[i],key=[b.x,b.y,b.o,b.bridge].join(':');
    if(seen.has(key))continue;seen.add(key);
    if(b.o==='U'&&tile(b.x,b.y)==='G')return steps;
    for(const [dx,dy] of moves){
      const n=move(b,dx,dy);if(!valid(n))continue;
      if(n.o==='U'&&tile(n.x,n.y)==='S')n.bridge=!n.bridge;
      if(n.o==='U' && (tile(n.x,n.y)==='A'||tile(n.x,n.y)==='P')){
        const target=tile(n.x,n.y)==='A'?'P':'A';const py=grid.findIndex(r=>r.includes(target));
        if(py!==-1){n.x=grid[py].indexOf(target);n.y=py;}
      }
      if(valid(n))q.push([n,steps+1]);
    }
  }
  return null;
}
test('Thirty distinct valid solvable puzzles',()=>{
  assert.equal(levels.length,30);
  assert.equal(new Set(levels.map(l=>l.grid.join('/'))).size,30);
  for(const [index,level] of levels.entries()){
    assert.ok(level.grid.every(r=>r.length===level.grid.length),`Level ${index+1} is square`);
    assert.ok(level.grid.join('').includes('G'),`Level ${index+1} has a goal`);
    const distance=shortest(level);
    assert.ok(distance!==null,`Level ${index+1} is solvable`);
    assert.equal(distance,level.minMoves,`Level ${index+1} minimum moves correct`);
    assert.ok(level.par>=distance,`Level ${index+1} target achievable`);
  }
});
test('Special tiles occur in the game',()=>{
  const all=levels.map(l=>l.grid.join('')).join('');
  for(const tile of 'FSBAP')assert.ok(all.includes(tile),`Tile ${tile} is used`);
});
test('No external JavaScript or CSS assets required',()=>{
  assert.equal((html.match(/<script[^>]+src=/g)||[]).length,0);
  assert.equal((html.match(/<link[^>]+stylesheet/g)||[]).length,0);
});