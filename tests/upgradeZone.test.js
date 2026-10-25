import test from 'node:test';import assert from 'node:assert/strict';
import {stepZone,inZone,upgradeZoneRadius,standConfirmSec} from '../src/upgradeZone.js';
const run=(st,o,sec)=>{let fired=0;for(let t=0;t<sec;t+=1/60)if(stepZone(st,{dt:1/60,...o}))fired++;return fired;};
test('zone constants per spec',()=>{assert.equal(upgradeZoneRadius,5);assert.equal(standConfirmSec,1.2);assert.ok(inZone({x:3,z:4}));assert.ok(!inZone({x:4,z:4}));});
test('standing 1.2s with gold upgrades exactly once',()=>{const s={progress:0};assert.equal(run(s,{inside:true,affordable:true},1.1),0);assert.equal(run(s,{inside:true,affordable:true},0.15),1);});
test('walk-by (<1.2s) then leave resets, no upgrade',()=>{const s={progress:0};run(s,{inside:true,affordable:true},0.8);stepZone(s,{inside:false,affordable:true,dt:1/60});assert.equal(s.progress,0);assert.equal(run(s,{inside:true,affordable:true},0.8),0);});
test('not enough gold never advances',()=>{const s={progress:0};assert.equal(run(s,{inside:true,affordable:false},5),0);assert.equal(s.progress,0);});
