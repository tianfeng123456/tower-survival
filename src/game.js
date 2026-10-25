import {THREE,mesh,group} from './rendering.js';
import {createCamera,resizeCamera,followCamera} from './camera.js';
import {createInput} from './input.js';
import {createWorld,updateForest} from './world.js';
import {createPlayer,updatePlayer} from './player.js';
import {createBuildings} from './buildings.js';
import {createEnemies} from './enemies.js';
import {createFX} from './fx.js';
import {createProjectiles} from './projectiles.js';
import {updateTowers} from './towers.js';
import {createWaves} from './waves.js';
import {createUpgrades} from './upgrades.js';
import {createHUD} from './hud.js';
export function createGame(){const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;document.body.prepend(renderer.domElement);renderer.domElement.className='game-canvas';
 const g={renderer,scene:new THREE.Scene(),camera:createCamera(),state:'start',paused:false,speed:1,time:0,wood:100,gold:0,tier:0,kills:0,stats:{chopped:0,built:0},toast:()=>{}};
 createWorld(g);g.player=createPlayer(g);g.player.pos.set(4,0,5);g.input=createInput(g);g.fx=createFX(g);g.buildings=createBuildings(g);g.enemies=createEnemies(g);g.projectiles=createProjectiles(g);g.waves=createWaves(g);g.upgrades=createUpgrades(g);g.harvestFill=mesh('ring',0xa7ff84);g.harvestFill.geometry=new THREE.RingGeometry(.7,.9,64);g.harvestFill.geometry.setDrawRange(0,0);g.harvestRing=group(mesh('ring',0x426444),g.harvestFill);g.harvestRing.rotation.x=-.35;g.scene.add(g.harvestRing);g.harvestRing.visible=false;g.buildings.ghost.visible=false;
 g.buildings.place(-3,0,'tower',true);g.buildings.place(3,0,'tower',true);g.hud=createHUD(g);g.end=win=>{if(g.state!=='playing')return;g.state=win?'won':'lost';g.hud.end(win);g.buildings.ghost.visible=false;};
 const resize=()=>{renderer.setSize(innerWidth,innerHeight);resizeCamera(g.camera,innerWidth,innerHeight);};addEventListener('resize',resize);resize();
 let last=performance.now(),acc=0;function frame(now){requestAnimationFrame(frame);const realDt=Math.min((now-last)/1000,.1);last=now;if(g.input.pressed.has('Escape')&&g.state==='playing')g.paused=!g.paused;
 if(g.state==='playing'&&!g.paused){acc+=realDt*g.speed;let n=0;while(acc>=1/60&&n<24&&g.state==='playing'){const dt=1/60;g.time+=dt;updatePlayer(g,dt);updateForest(g,dt);g.buildings.update(dt);g.waves.update(dt);g.enemies.update(dt);updateTowers(g,dt);g.projectiles.update(dt);g.fx.update(dt);g.upgrades.update(dt);if(g.core.hp<=0||g.player.hp<=0)g.end(false);g.input.pressed.clear();acc-=dt;n++;}}else{g.input.pressed.clear();acc=0;}
 followCamera(g,realDt);g.core.model.children[4].rotation.y+=realDt*.6;g.hud.update(realDt);renderer.render(g.scene,g.camera);}requestAnimationFrame(frame);return g;}
