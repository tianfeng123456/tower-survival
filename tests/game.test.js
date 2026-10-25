import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFlowField } from '../src/pathfinding.js';
import { createWaves } from '../src/waves.js';
import { waves } from '../src/data/waves.js';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

test('enemies can route around a wall and return to shorter route after destruction', () => {
  const blocked = new Map([['1,0', {}]]);
  let field = buildFlowField(blocked, 4);
  assert.equal(field.get('2,0'), 4);
  assert.equal(field.has('1,0'), false);
  blocked.delete('1,0');
  field = buildFlowField(blocked, 4);
  assert.equal(field.get('2,0'), 2);
});

test('a sealed core leaves attackers outside without a path; destroying one wall opens it', () => {
  const blocked = new Map(['1,0', '-1,0', '0,1', '0,-1'].map(key => [key, {}]));
  assert.equal(buildFlowField(blocked, 5).has('3,0'), false);
  blocked.delete('1,0');
  assert.equal(buildFlowField(blocked, 5).get('3,0'), 3);
});

function fixture() {
  const spawned = [];
  const g = {
    input: { pressed: new Set() }, toast() {},
    enemies: { list: [], spawn(wave, giant = false) { spawned.push({ wave: wave.number, giant }); } },
    end(win) { this.won = win; },
  };
  return { g, spawned, schedule: createWaves(g) };
}

test('40 waves spawn every configured minion and giant before victory', () => {
  const { g, schedule, spawned } = fixture();
  for (let i = 0; i < waves.length; i++) {
    schedule.startNext();
    while (schedule.queue || schedule.giants) schedule.update(2);
    assert.equal(schedule.index, i);
  }
  assert.equal(spawned.filter(e => !e.giant).length, waves.reduce((n, w) => n + w.count, 0));
  assert.equal(spawned.filter(e => e.giant).length, waves.reduce((n, w) => n + w.giants, 0));
  assert.equal(g.won, true);
  assert.equal(waves.reduce((n, w) => n + w.duration, 0), 7200);
});

test('enemy cap delays spawns without consuming queued enemies', () => {
  const { g, schedule, spawned } = fixture();
  schedule.startNext();
  g.enemies.list = Array(200).fill({});
  schedule.update(1);
  assert.equal(spawned.length, 0);
  assert.equal(schedule.queue, waves[0].count);
  g.enemies.list.pop();
  schedule.update(1);
  assert.equal(spawned.length, 1);
  assert.equal(schedule.queue, waves[0].count - 1);
});

test('final victory waits for all living enemies to be cleared', () => {
  const { g, schedule } = fixture();
  schedule.index = 39;
  schedule.nextIn = 180;
  g.enemies.list.push({});
  schedule.update(1);
  assert.equal(g.won, undefined);
  g.enemies.list.length = 0;
  schedule.update(1);
  assert.equal(g.won, true);
});

test('all procedural PNG files decode to complete 64×64 RGBA images', () => {
  for (const name of ['grass', 'bark', 'stone', 'core']) {
    const data = readFileSync(new URL(`../public/textures/${name}.png`, import.meta.url));
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16), 64);
    assert.equal(data.readUInt32BE(20), 64);
    const idat = [];
    for (let offset = 8; offset < data.length;) {
      const length = data.readUInt32BE(offset);
      if (data.toString('ascii', offset + 4, offset + 8) === 'IDAT') idat.push(data.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    assert.equal(inflateSync(Buffer.concat(idat)).length, 64 * (64 * 4 + 1));
  }
});

import { buildBlockReason, BUILD_REASONS } from '../src/buildRules.js';
import { objectiveStatus } from '../src/objectives.js';
const opts = { cell: 2, radius: 17, key: (x, z) => `${x},${z}`, cost: 12 };
const world = (o = {}) => ({ wood: 100, trees: [], enemies: { list: [] }, buildings: { map: new Map() }, ...o });
test('build block reasons cover every failure case', () => {
  assert.equal(buildBlockReason(world(), 20, 0, opts), 'bounds');
  assert.equal(buildBlockReason(world(), 1, 1, opts), 'core');
  assert.equal(buildBlockReason(world({ buildings: { map: new Map([['5,0', {}]]) } }), 5, 0, opts), 'overlap');
  assert.equal(buildBlockReason(world({ trees: [{ alive: true, x: 10, z: 0 }] }), 5, 0, opts), 'tree');
  assert.equal(buildBlockReason(world({ trees: [{ alive: false, x: 10, z: 0 }] }), 5, 0, opts), null);
  assert.equal(buildBlockReason(world({ enemies: { list: [{ x: 10.5, z: 0 }] } }), 5, 0, opts), 'enemy');
  assert.equal(buildBlockReason(world({ wood: 3 }), 5, 0, opts), 'wood');
  assert.equal(buildBlockReason(world(), 5, 0, opts), null);
  for (const k of ['bounds', 'core', 'overlap', 'tree', 'enemy', 'wood']) assert.ok(BUILD_REASONS[k].short && BUILD_REASONS[k].toast);
});
test('opening objectives check off chop, build, wave 1', () => {
  const g = { stats: { chopped: 0, built: 0 }, waves: { index: -1, queue: 0, giants: 0 }, enemies: { list: [] } };
  assert.deepEqual(objectiveStatus(g), { chop: false, build: false, wave: false });
  g.stats.chopped = 1; g.stats.built = 1; g.waves.index = 0; g.waves.queue = 3;
  assert.deepEqual(objectiveStatus(g), { chop: true, build: true, wave: false });
  g.waves.queue = 0;
  assert.equal(objectiveStatus(g).wave, true);
});
