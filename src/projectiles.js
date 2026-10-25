import {THREE,mesh,distance} from './rendering.js';
const _tgt=new THREE.Vector3(),_d=new THREE.Vector3();
export function createProjectiles(g){const list=[];return {
 fire(b,target,type,damage){if(type==='laser'){const start=new THREE.Vector3(b.x,3,b.z),end=new THREE.Vector3(target.x,1,target.z);const dir=end.clone().sub(start);const m=mesh('cylinder',0x8bffe4,...start.toArray(),.075,dir.length(),.075);m.position.copy(start).addScaledVector(dir,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());g.scene.add(m);list.push({m,type,life:.14});g.enemies.damage(target,damage);return;}
 const m=mesh(type==='cannon'?'sphere':'box',type==='cannon'?0x334e5c:0xffedb0,b.x,2.7,b.z,type==='cannon'?.26:.07,type==='cannon'?.26:.07,type==='cannon'?.26:.7);m.castShadow=false;g.scene.add(m);list.push({m,type,damage,target,age:0,start:new THREE.Vector3(b.x,2.7,b.z),end:new THREE.Vector3(target.x,.8,target.z),life:type==='cannon'?.8:1.5});},
 update(dt){for(let i=list.length-1;i>=0;i--){const p=list[i];p.life-=dt;p.age=(p.age||0)+dt;let done=p.life<=0;if(p.type==='cannon'){const t=Math.min(1,p.age/.8);p.m.position.lerpVectors(p.start,p.end,t);p.m.position.y+=Math.sin(t*Math.PI)*5;if(t>=1){for(let k=g.enemies.list.length-1;k>=0;k--){const e=g.enemies.list[k];if(e)if(distance(e,p.end)<4)g.enemies.damage(e,p.damage);}g.fx.puff(p.end,0xffbb63,16);g.fx.slash(p.end,4,0xffb35c);done=true;}}
 else if(p.type==='arrow'){const target=p.target.hp>0?_tgt.set(p.target.x,1,p.target.z):p.end;const d=_d.copy(target).sub(p.m.position);if(d.length()<dt*26+.4){if(p.target.hp>0)g.enemies.damage(p.target,p.damage);done=true;}else{p.m.lookAt(target);p.m.position.addScaledVector(d.normalize(),dt*26);}}
 if(done){g.scene.remove(p.m);list.splice(i,1);}}
 },list};}
