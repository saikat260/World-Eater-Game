// TEMPORARY measurement script - does not modify game logic.
import fs from 'fs';
import { PhysicsEngine } from './physics.js';

// Simulated clock so Date.now()-based timers (stun/chew) behave like real time
let simNow = 1_000_000;
Date.now = () => simNow;

const isos = JSON.parse(fs.readFileSync('./countries.json', 'utf-8'));

function coverage(engine) {
    // fraction of arena (sampled) inside any alive country's radius
    const cols = 54, rows = 72;
    let covered = 0;
    const alive = engine.countries.filter(c => c.plugin.alive);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = (i + 0.5) * engine.width / cols;
            const y = (j + 0.5) * engine.height / rows;
            for (const c of alive) {
                const dx = x - c.position.x, dy = y - c.position.y;
                if (dx * dx + dy * dy < c.plugin.radius * c.plugin.radius) { covered++; break; }
            }
        }
    }
    return covered / (cols * rows);
}

function run(label, participants, phase, maxSeconds) {
    const engine = new PhysicsEngine();
    engine.initMatch(participants, phase);
    const spawnTime = new Map();
    const prevAlive = new Set(engine.stardust.map(s => s.plugin.id));
    engine.stardust.forEach(s => spawnTime.set(s.plugin.id, 0));
    const dt = 1 / 60;
    let t = 0;
    let spawnedSec = 0, eatenSec = 0, eatenFast = 0;
    const rows = [];
    while (t < maxSeconds) {
        simNow += 1000 / 60;
        t += dt;
        engine.update(dt);
        engine.events = [];
        const nowAlive = new Set(engine.aliveStardust.map(s => s.plugin.id));
        for (const id of nowAlive) if (!prevAlive.has(id)) { spawnedSec++; spawnTime.set(id, t); }
        for (const id of prevAlive) if (!nowAlive.has(id)) {
            eatenSec++;
            if (t - (spawnTime.get(id) ?? 0) < 1.0) eatenFast++;
        }
        prevAlive.clear(); nowAlive.forEach(id => prevAlive.add(id));
        if (Math.floor(t) !== Math.floor(t - dt)) {
            const aliveC = engine.countries.filter(c => c.plugin.alive);
            const maxR = aliveC.reduce((m, c) => Math.max(m, c.plugin.radius), 0);
            rows.push({ t: Math.floor(t), countries: aliveC.length, maxR: Math.round(maxR),
                stardust: engine.aliveStardust.length, spawned: spawnedSec, eaten: eatenSec,
                eatenWithin1s: eatenFast, covered: Math.round(coverage(engine) * 100) + '%' });
            spawnedSec = 0; eatenSec = 0; eatenFast = 0;
        }
        if (engine.countries.filter(c => c.plugin.alive).length <= 1 && t > 6) break;
    }
    console.log('\n=== ' + label + ' (sim seconds run: ' + Math.floor(t) + ') ===');
    const pick = rows.filter((r, i) => i % Math.max(1, Math.floor(rows.length / 14)) === 0 || i === rows.length - 1);
    console.table(pick);
}

// Phase 1: all countries, wins 0 (radius base 15)
run('PHASE 1 (all countries)', isos.map(iso => ({ iso, name: iso.toUpperCase(), wins: 0 })), 1, 120);

// Phase 2: 8 winners with wins 1 (base 35)
run('PHASE 2 (8 players)', isos.slice(0, 8).map(iso => ({ iso, name: iso.toUpperCase(), wins: 1 })), 2, 90);

// Phase 4: grand final, 2 players with accumulated wins (base 70, wins 4 and 3)
run('PHASE 4 (final, 2 players)', [
    { iso: isos[0], name: 'A', wins: 4 },
    { iso: isos[1], name: 'B', wins: 3 }
], 4, 90);
process.exit(0);
