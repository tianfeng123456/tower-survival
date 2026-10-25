import * as THREE from 'three';
export { THREE };
const geometries = new Map(), materials = new Map();
export function mat(color){if(!materials.has(color))materials.set(color,new THREE.MeshToonMaterial({color}));return materials.get(color);}
export function mesh(shape,color,x=0,y=0,z=0,sx=1,sy=1,sz=1){
 if(!geometries.has(shape))geometries.set(shape,shape==='box'?new THREE.BoxGeometry(1,1,1):shape==='sphere'?new THREE.IcosahedronGeometry(1,0):shape==='cone'?new THREE.ConeGeometry(1,1,7):shape==='cylinder'?new THREE.CylinderGeometry(1,1,1,8):new THREE.TorusGeometry(1,.07,5,32));
 const m=new THREE.Mesh(geometries.get(shape),mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;return m;
}
export function group(...items){const g=new THREE.Group();g.add(...items);return g;}
export function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
export function label(text,color='#fff',size=24){const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.font=`bold ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeStyle='#183326';ctx.lineWidth=Math.max(5,size*.28);ctx.strokeText(text,128,32);ctx.fillStyle=color;ctx.fillText(text,128,32);const tex=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,fog:false}));sp.scale.set(5,1.25,1);sp.userData.texture=tex;return sp;}
export function disposeLabel(sp){sp.material.map?.dispose();sp.material.dispose();}
export function bar(width=2){const g=group(mesh('box',0x24352f,0,0,0,width,.15,.1),mesh('box',0x9bea73,0,0,.07,width-.06,.10,.1));g.userData.fill=g.children[1];return g;}
export function updateBar(g,value){g.userData.fill.scale.x=(g.children[0].scale.x-.06)*Math.max(0,value);}
