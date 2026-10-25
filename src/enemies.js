import {THREE,mesh,group,distance,bar,updateBar,label,disposeLabel} from './rendering.js';
import {CELL,MAP_RADIUS} from './data/buildings.js';
import {cellKey} from './buildings.js';
import {buildFlowField} from './pathfinding.js';
export function createEnemies(g){let field=new Map(),fieldVersion=-1;const list=[];
 function rebuild(){field=buildFlowField(g.buildings.map,MAP_RADIUS);fieldVersion=g.buildings.version;}
 const api={list,
 spawn(w,giant=false){const a=Math.random()*Math.PI*2,r=35;let x=Math.cos(a)*r,z=Math.sin(a)*r;
 const model=group(mesh('cone',giant?0x82365c:0xc94349,0,.8,0,.53,1.5,.53),mesh('sphere',0xefaf91,0,1.2,.4,.27,.29,.25),mesh('cone',0xb02f4b,0,1.6,0,.52,.8,.5),mesh('box',0x642f3e,0,.3,0,.65,.4,.5));if(giant){model.add(mesh('box',0x614c64,.65,.7,0,.35,1.8,.35));model.scale.setScalar(2.25);}
 model.position.set(x,0,z);g.scene.add(model);const hp=w.hp*(giant?14:1);const e={x,z,model,hp,maxHP:hp,damage:w.damage*(giant?3:1),speed:w.speed*(giant?.65:1),giant,attack:Math.random(),age:0,hit:0};if(giant){e.bar=bar(3);e.bar.position.y=5;e.number=label(Math.ceil(hp).toString(),'#fff2d0',24);e.number.position.y=5.7;g.scene.add(e.bar,e.number);e.lastHP=hp;}list.push(e);},
 damage(e,n){if(e.hp<=0)return;e.hp-=n;e.hit=.1;g.fx.flash(e.model);if(n>=8)g.fx.text(Math.ceil(n),e,e.giant?0xffd780:0xffffff);if(e.hp<=0){api.remove(e);g.kills++;g.fx.puff(e,0xb7c3a7,e.giant?15:5);g.fx.coin(e,e.giant?20:3);}},
 remove(e){g.scene.remove(e.model);if(e.bar)g.scene.remove(e.bar);if(e.number){g.scene.remove(e.number);disposeLabel(e.number);}const i=list.indexOf(e);if(i>=0)list.splice(i,1);},
 update(dt){if(fieldVersion!==g.buildings.version)rebuild();for(let i=list.length-1;i>=0;i--){const e=list[i];e.age+=dt;e.attack-=dt;let target=g.core;const pd=distance(e,g.player.pos);if(pd<5.5)target=g.player.pos;let tx=target.x,tz=target.z;let obstacle=null;
 if(target===g.core){const cx=Math.round(e.x/CELL),cz=Math.round(e.z/CELL);let best=field.get(cellKey(cx,cz))??Infinity,bx=cx,bz=cz;for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const n=field.get(cellKey(cx+dx,cz+dz));if(n!==undefined&&n<best){best=n;bx=cx+dx;bz=cz+dz;}}if(best<Infinity){tx=bx*CELL;tz=bz*CELL;}else{let d=Infinity;for(const b of g.buildings.list){const n=distance(e,b)+distance(b,g.core)*.15;if(n<d){d=n;obstacle=b;}}if(obstacle){tx=obstacle.x;tz=obstacle.z;}}}
 // The intended next cell may be a wall even while chasing the player.
 const dx=tx-e.x,dz=tz-e.z,len=Math.hypot(dx,dz);const step=e.speed*dt;const nx=e.x+(len?dx/len*step:0),nz=e.z+(len?dz/len*step:0);const block=g.buildings.map.get(cellKey(Math.round(nx/CELL),Math.round(nz/CELL)));if(block)obstacle=block;
 if(obstacle&&distance(e,obstacle)<2.5){if(e.attack<=0){g.buildings.damage(obstacle,e.damage);e.attack=1;}}else if(target===g.core&&distance(e,g.core)<2.6){if(e.attack<=0){g.core.hp-=e.damage;e.attack=1;g.fx.flash(g.core.model);}}else if(target===g.player.pos&&pd<1.65){if(e.attack<=0){if(g.player.invulnerable<=0){g.player.hp-=e.damage;g.fx.flash(g.player.model);g.hud?.hurt?.();g.fx.text('-'+Math.ceil(e.damage),g.player.pos,0xff9494);}e.attack=.9;}}else if(len>.1&&!block){e.x=nx;e.z=nz;e.model.rotation.y=Math.atan2(dx,dz);}
 e.model.position.set(e.x,Math.abs(Math.sin(e.age*8))*.12,e.z);const spawn=Math.min(1,e.age*3);e.model.scale.y=(e.giant?2.25:1)*(.5+.5*spawn);if(e.bar){e.bar.position.x=e.x;e.bar.position.z=e.z;e.number.position.x=e.x;e.number.position.z=e.z;updateBar(e.bar,e.hp/e.maxHP);if(e.lastHP!==e.hp){g.scene.remove(e.number);disposeLabel(e.number);e.number=label(Math.ceil(e.hp).toString(),'#fff2d0');e.number.position.set(e.x,5.7,e.z);g.scene.add(e.number);e.lastHP=e.hp;}}}
 // Cheap spatial buckets keep swarms separated without an O(n²) pass.
 const buckets=new Map();for(const e of list){const k=cellKey(Math.floor(e.x/2),Math.floor(e.z/2));if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(e);}for(const e of list){const cx=Math.floor(e.x/2),cz=Math.floor(e.z/2);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const b of buckets.get(cellKey(cx+dx,cz+dz))||[]){if(b===e)continue;let x=e.x-b.x,z=e.z-b.z,d=Math.hypot(x,z),min=e.giant||b.giant?1.2:.65;if(d<min&&d>.001){const nx=e.x+x/d*dt*.9,nz=e.z+z/d*dt*.9;if(!g.buildings.blockedAt(nx,nz)){e.x=nx;e.z=nz;}}}}
 }
 };return api;}
