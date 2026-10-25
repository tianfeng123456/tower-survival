// Pure logic for the stand-on-core upgrade flow (testable without three.js).
export const upgradeZoneRadius=5, standConfirmSec=1.2;
export const ZONE={x:0,z:0,radius:upgradeZoneRadius,fillTime:standConfirmSec};
export function inZone(p,zone=ZONE){return Math.hypot(p.x-zone.x,p.z-zone.z)<=zone.radius;}
// Returns true when the upgrade should fire this step. Leaving resets; unaffordable/max never advances.
export function stepZone(state,{inside,affordable,dt,fillTime=standConfirmSec}){
 if(!inside||!affordable){state.progress=0;return false;}
 state.progress=Math.min(1,state.progress+dt/fillTime);
 if(state.progress>=1){state.progress=0;return true;}
 return false;
}
