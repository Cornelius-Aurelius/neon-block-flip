"""Offline deterministic 33-stage puzzle generator, verified with actual Bloxorz rolling physics.
Output committed as static levels.json; no random levels at runtime.
"""
import random, collections, json
R=random.Random(268110)
DIRS=[(1,0,'right'),(-1,0,'left'),(0,1,'down'),(0,-1,'up')]

def motion(s,dx,dy):
 x,y,o,bridge=s
 if o=='U':
  if dx>0:return x+1,y,'H',bridge
  if dx<0:return x-2,y,'H',bridge
  if dy>0:return x,y+1,'V',bridge
  return x,y-2,'V',bridge
 if o=='H':
  if dx>0:return x+2,y,'U',bridge
  if dx<0:return x-1,y,'U',bridge
  return x,y+dy,'H',bridge
 if dy>0:return x,y+2,'U',bridge
 if dy<0:return x,y-1,'U',bridge
 return x+dx,y,'V',bridge

def cells(s):
 x,y,o,*_=s
 return [(x,y)]+([(x+1,y)] if o=='H' else [(x,y+1)] if o=='V' else [])

def solve(grid,start,enable_special=True,need_path=False,forbid_bridge=False,forbid_portals=False,forbid_fragile=False):
 n=len(grid); tile=lambda x,y: grid[y][x] if 0<=y<n and 0<=x<n else '.'
 s=(start[0],start[1],'U',False);q=collections.deque([s]);pred={s:(None,None)}
 while q:
  b=q.popleft()
  if b[2]=='U' and tile(*b[:2])=='G':
   if not need_path:return len_path(pred,b)
   states=[b];actions=[]
   while pred[states[-1]][0] is not None:
    p,d=pred[states[-1]]; states.append(p);actions.append(d)
   return len(actions),list(reversed(states)),list(reversed(actions))
  for dx,dy,d in DIRS:
   a=motion(b,dx,dy)
   if any(tile(x,y) in ('.','X') or (tile(x,y)=='B' and (not a[3] or forbid_bridge)) or (tile(x,y)=='F' and a[2]=='U') or (forbid_fragile and tile(x,y)=='F') for x,y in cells(a)):continue
   t=tile(*a[:2]) if a[2]=='U' else ''
   if enable_special and t=='S':a=(*a[:3],not a[3])
   if enable_special and not forbid_portals and t in 'AP' and t:
    target='P' if t=='A' else 'A'
    dest=next(((x,y) for y in range(n) for x in range(n) if grid[y][x]==target),None)
    if dest is not None:a=(*dest,a[2],a[3])
   if any(tile(x,y) in ('.','X') or (tile(x,y)=='B' and (not a[3] or forbid_bridge)) or (tile(x,y)=='F' and a[2]=='U') for x,y in cells(a)):continue
   if a in pred:continue
   pred[a]=(b,d);q.append(a)
 return None if not need_path else (None,[],[])

def len_path(pred,s):
 i=0
 while pred[s][0] is not None:s=pred[s][0];i+=1
 return i

def random_board(n,density):
 grid=[['#' for x in range(n)] for y in range(n)]
 for y in range(n):
  for x in range(n):
   if R.random()<density:grid[y][x]='.'
 # encourage coherent paths with some open regions
 return grid

def basic(index,n,target,kind):
 for iteration in range(20000):
  g=random_board(n,R.uniform(.18,.42) if index<20 else R.uniform(.23,.47))
  sx,sy=R.randrange(n),R.randrange(n);gx,gy=R.randrange(n),R.randrange(n)
  if (sx,sy)==(gx,gy):continue
  g[sy][sx]='#';g[gy][gx]='G';raw=[''.join(row) for row in g]
  distance,states,actions=solve(raw,(sx,sy),need_path=True)
  if distance is None or distance<target or distance>target+11:continue
  if sum(row.count('.') for row in raw)<max(3,int(n*n*.13)):continue
  if kind=='fragile':
   candidates=list({(x,y) for b in states[1:-1] if b[2]!='U' for x,y in cells(b) if g[y][x]=='#' and (x,y)!=(sx,sy)})
   R.shuffle(candidates);done=False
   for x,y in candidates:
    g[y][x]='F';cand=[''.join(row) for row in g];sd,ss,sa=solve(cand,(sx,sy),need_path=True)
    if sd is not None and sd>=target and any((x,y) in cells(s) for s in ss[1:-1]):
     distance,states,actions=sd,ss,sa;done=True;break
    g[y][x]='#'
   if not done:continue
  elif kind=='switch':
   upright=list({(b[0],b[1],i) for i,b in enumerate(states[1:-2],1) if b[2]=='U' and g[b[1]][b[0]]=='#'})
   R.shuffle(upright);done=False
   for sx1,sy1,j in upright:
    after=list({(x,y) for b in states[j+1:-1] for x,y in cells(b) if g[y][x]=='#' and (x,y)!=(sx1,sy1)})
    R.shuffle(after)
    for bx,by in after:
     g[sy1][sx1]='S';g[by][bx]='B';cand=[''.join(row) for row in g]
     sd,ss,sa=solve(cand,(sx,sy),need_path=True)
     if sd is not None and sd>=target and solve(cand,(sx,sy),forbid_bridge=True) is None and any(b[3] for b in ss):
      distance,states,actions=sd,ss,sa;done=True;break
     g[sy1][sx1]='#';g[by][bx]='#'
    if done:break
   if not done:continue
  return {'grid':[''.join(row) for row in g],'start':[sx,sy],'minMoves':distance,'par':distance+max(1,round(distance*.15))},actions
 raise RuntimeError((index,n,target,kind))

def portal_board(index,target):
 n=9
 # 4-wide upper and lower arenas, separated by 1 void row => portals mandatory.
 for _ in range(18000):
  g=random_board(n,R.uniform(.14,.36))
  for x in range(n):g[4][x]='.'
  a=(R.randrange(n),R.randint(0,3));p=(R.randrange(n),R.randint(5,8));start=(R.randrange(n),R.randint(0,3));goal=(R.randrange(n),R.randint(5,8))
  if a==start or p==goal:continue
  g[a[1]][a[0]]='A';g[p[1]][p[0]]='P';g[start[1]][start[0]]='#';g[goal[1]][goal[0]]='G'
  raw=[''.join(row) for row in g]; dist,states,actions=solve(raw,start,need_path=True)
  if dist is None or dist<target or dist>target+12:continue
  if not any(b[:2]==p for b in states[1:]):continue
  if solve(raw,start,forbid_portals=True) is not None:continue
  return {'grid':raw,'start':list(start),'minMoves':dist,'par':dist+max(1,round(dist*.15))},actions
 raise RuntimeError((index,target,'portal'))

names=['First Contact','The Edge','Long Way Home','Mind the Gap','Blue Shift','Zero Gravity','Cracked Ice','Glass Bridge','One Wrong Step','Fragile Ground','Thin Ice','Power Switch','Cross the Void','Reactor Online','Break the Circuit','Warp Gate','Through the Rift','Twin Portals','No Way Back','Three-Point Turn','Silent Circuit','Double Jeopardy','Under Pressure','Voltage Drop','Narrow Escape','The Long Roll','Pressure Chamber','The Divide','Dark Matter','Last Signal','The Outer Rim','Eclipse Protocol','Omega Core']
types=[]
for i in range(33):
 if i<6:typ='basic'
 elif i<11:typ='fragile'
 elif i<15:typ='switch'
 elif i<19:typ='portal'
 elif i<22:typ='fragile'
 elif i<27:typ='switch'
 elif i<30:typ='portal'
 else:typ='switch'
 types.append(typ)
levels=[]
for i,(name,kind) in enumerate(zip(names,types)):
 if i<3:n=5;target=3+i*2
 elif i<6:n=6;target=6+(i-3)*2
 elif i<11:n=7;target=9+(i-6)
 elif i<15:n=8;target=12+(i-11)
 elif i<19:n=9;target=10+(i-15)*2
 elif i<25:n=8;target=14+(i-19)
 elif i<30:n=9;target=16+(i-25)
 else:n=9;target=18+(i-30)*2
 data,solution=portal_board(i,target) if kind=='portal' else basic(i,n,target,kind)
 data.update(name=name,chapter=min(5,1+i//6),mechanic=kind,solution=''.join({'up':'U','down':'D','left':'L','right':'R'}[a] for a in solution))
 levels.append(data)
 print(f'{i+1:02d} {name:19} {kind:7} {len(data["grid"])}x{len(data["grid"])} shortest {data["minMoves"]:2d} solutions {data["solution"]}',flush=True)
with open('/mnt/data/neon_omega_v3/levels.json','w') as f:json.dump(levels,f,indent=2)