import {THREE,mesh,group,label,disposeLabel,distance} from './rendering.js';
export function createFX(g){const particles=[],texts=[],coins=[],rings=[],flashes=[];return {
 text(value,pos,color=0xffffff,size=.7){if(texts.length>45)return;const m=label(String(value),'#'+color.toString(16).padStart(6,'0'));m.position.set(pos.x,pos.y>1?pos.y:2.5,pos.z);m.scale.multiplyScalar(size);g.scene.add(m);texts.push({m,life:1});},
 puff(pos,color=0xd4ddc5,count=6){if(g.player&&distance(pos,g.player.pos)>24)count=Math.ceil(count/2);for(let i=0;i<count;i++){if(particles.length>250)break;const m=mesh('sphere',color,pos.x,.6,pos.z,.2,.2,.2);g.scene.add(m);particles.push({m,life:.6,max:.6,v:new THREE.Vector3((Math.random()-.5)*5,2+Math.random()*3,(Math.random()-.5)*5)});}},
 flash(model){if(flashes.some(f=>f.model===model))return;const originals=[];model.traverse(o=>{if(o.isMesh&&!o.userData.outline&&o.material.type!=='MeshBasicMaterial'){originals.push([o,o.material]);o.material=flashMaterial;}});flashes.push({model,originals,life:.09});},
 slash(pos,r,color){const m=mesh('ring',color,pos.x,.4,pos.z,r,r,r);m.rotation.x=-Math.PI/2;g.scene.add(m);rings.push({m,life:.5,r,max:.5});},
 coin(pos,value){const m=mesh('cylinder',0xffd754,pos.x,.8,pos.z,.23,.10,.23);m.rotation.z=Math.PI/2;g.scene.add(m);coins.push({m,value,age:0,v:new THREE.Vector3((Math.random()-.5)*3,4+Math.random()*2,(Math.random()-.5)*3)});},
 update(dt){for(let i=flashes.length-1;i>=0;i--){let f=flashes[i];f.life-=dt;if(f.life<=0){f.originals.forEach(([m,mat])=>m.material=mat);flashes.splice(i,1);}}
 for(let i=texts.length-1;i>=0;i--){let t=texts[i];t.life-=dt;t.m.position.y+=dt*1.7;t.m.material.opacity=Math.min(1,t.life*2);if(t.life<=0){g.scene.remove(t.m);disposeLabel(t.m);texts.splice(i,1);}}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=dt*9;p.m.position.addScaledVector(p.v,dt);p.m.scale.setScalar(Math.max(.01,p.life)*.45);if(p.life<=0){g.scene.remove(p.m);particles.splice(i,1);}}
 for(let i=rings.length-1;i>=0;i--){let r=rings[i];r.life-=dt;r.m.rotation.z+=dt*8;r.m.scale.setScalar(r.r*(1-r.life/r.max*.4));if(r.life<=0){g.scene.remove(r.m);rings.splice(i,1);}}
 for(let i=coins.length-1;i>=0;i--){const c=coins[i];c.age+=dt;c.m.rotation.y+=dt*5;if(c.age<.7){c.v.y-=dt*12;c.m.position.addScaledVector(c.v,dt);c.m.position.y=Math.max(.25,c.m.position.y);}else if(distance(c.m.position,g.player.pos)<11||c.age>5){const d=_cd.set(g.player.pos.x,1,g.player.pos.z).sub(c.m.position);c.m.position.addScaledVector(d,Math.min(1,dt*(5+c.age)));if(d.length()<.8){g.gold+=c.value;g.scene.remove(c.m);coins.splice(i,1);}}}
 },get coins(){return coins;}};}
const _cd=new THREE.Vector3();
const flashMaterial=new THREE.MeshBasicMaterial({color:0xffe6cc});
