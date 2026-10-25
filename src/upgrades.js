import {THREE,mesh,label} from './rendering.js';
import {upgrades} from './data/upgrades.js';
import {ZONE,inZone,stepZone} from './upgradeZone.js';
const noFog=o=>({depthWrite:false,fog:false,transparent:true,...o});
export function createUpgrades(g){const arrow=label('⬆ 升级','#b7ff8a',32);arrow.position.set(0,6,0);g.scene.add(arrow);const arrows=[];
 // Zone boundary ring on the ground around the core.
 const edgeMat=new THREE.MeshBasicMaterial(noFog({color:0xd8ffe0,opacity:.7}));
 const edge=new THREE.Mesh(new THREE.RingGeometry(ZONE.radius-.18,ZONE.radius,72),edgeMat);edge.rotation.x=-Math.PI/2;edge.position.set(ZONE.x,.05,ZONE.z);g.scene.add(edge);
 // Foot progress ring under the player.
 const footBase=new THREE.Mesh(new THREE.RingGeometry(1,1.3,48),new THREE.MeshBasicMaterial(noFog({color:0x183326,opacity:.55})));footBase.rotation.x=-Math.PI/2;g.scene.add(footBase);
 const fill=new THREE.Mesh(new THREE.RingGeometry(1,1.3,64,1,Math.PI/2,Math.PI*2),new THREE.MeshBasicMaterial(noFog({color:0xb8ff6a,opacity:1})));fill.rotation.x=-Math.PI/2;fill.renderOrder=2;g.scene.add(fill);
 let costText=null,costLabel=null;const setCost=t=>{if(t===costText)return;costText=t;if(costLabel){g.scene.remove(costLabel);costLabel.material.map.dispose();costLabel.material.dispose();}costLabel=label(t,'#e9ffb8',26);costLabel.position.set(0,5,0);costLabel.scale.set(4.6,1.15,1);costLabel.renderOrder=3;g.scene.add(costLabel);};
 const zone={progress:0};let tipShown=false;
 const doUpgrade=()=>{g.gold-=upgrades[g.tier].cost;g.tier++;zone.progress=0;g.buildings.upgrade();g.core.maxHP+=500;g.core.hp=Math.min(g.core.maxHP,g.core.hp+1000);g.player.hp=g.player.maxHP;g.fx.slash(g.core,10,0xb8ff85);g.toast(`全局升级 · ${upgrades[g.tier].name}`,4);};
 const api={zone,ZONE,isInZone:()=>inZone(g.player.pos),
 update(dt){const maxed=g.tier>=upgrades.length-1,u=upgrades[g.tier],affordable=!maxed&&g.gold>=u.cost,inside=inZone(g.player.pos);
  if(affordable&&!tipShown){tipShown=true;g.toast('走到中央核心，站上去即可升级',4.5);}
  arrow.visible=false;
  while(arrows.length<g.buildings.list.length){const a=mesh('cone',0xb3ff75,0,3.8,0,.22,.6,.22);a.castShadow=false;g.scene.add(a);arrows.push(a);}for(let i=0;i<arrows.length;i++){const a=arrows[i],b=g.buildings.list[i];a.visible=affordable&&!!b;if(b)a.position.set(b.x,3.9+Math.sin(g.time*3+i)*.2,b.z);}
  const s=affordable?1+Math.max(0,Math.sin(g.time*5))*.07:1;g.core.model.scale.set(s,s,s);
  edgeMat.color.setHex(affordable?0x9dffb8:0xffe0a0);edgeMat.opacity=affordable?.55+Math.sin(g.time*5)*.3:.35;
  setCost(maxed?'已达最高阶':`金币 ${Math.min(Math.floor(g.gold),u.cost)}/${u.cost}`);
  if(!maxed&&stepZone(zone,{inside,affordable,dt}))doUpgrade();
  const show=inside&&affordable&&!maxed;footBase.visible=fill.visible=show;
  if(show){footBase.position.set(g.player.pos.x,.07,g.player.pos.z);fill.position.set(g.player.pos.x,.08,g.player.pos.z);fill.geometry.setDrawRange(0,Math.ceil(zone.progress*64)*6);}
  if(g.input.pressed.has('KeyU')){if(maxed)g.toast('已达最高阶');else if(!inside)g.toast('走到中央核心站立即可升级');else if(!affordable)g.toast(`升级需要 ${u.cost} 金币`);else doUpgrade();}
  if(inside&& !g.enemies.list.some(e=>Math.hypot(e.x-g.core.x,e.z-g.core.z)<7)){g.player.hp=Math.min(g.player.maxHP,g.player.hp+dt*7);g.core.hp=Math.min(g.core.maxHP,g.core.hp+dt*3);}
 }};return api;}
