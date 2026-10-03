import fs from 'fs';

let content = fs.readFileSync('physics.js', 'utf8');

// ============================================================
// REFACTOR #5 (GC-Free): Replace Vector.magnitude(Vector.sub())
//   with raw primitive math inside loops
// ============================================================

// Fix 1: AI Steering stardust search
content = content.replace(
    '                    let d = Vector.magnitude(Vector.sub(c.position, sd.position));\r\n                    if (d < nearestDist) { nearestDist = d; target = sd.position; }\r\n                });\r\n            } else {',
    '                    let _sdx = c.position.x - sd.position.x;\r\n                    let _sdy = c.position.y - sd.position.y;\r\n                    let d = Math.sqrt(_sdx*_sdx + _sdy*_sdy);\r\n                    if (d < nearestDist) { nearestDist = d; target = sd.position; }\r\n                });\r\n            } else {'
);

// Fix 2: AI danger/hunt detection
content = content.replace(
    '                    let d = Vector.magnitude(Vector.sub(c.position, other.position));\r\n                    if (other.plugin.radius > c.plugin.radius * 1.05 && d < 200) {',
    '                    let _ox = c.position.x - other.position.x;\r\n                    let _oy = c.position.y - other.position.y;\r\n                    let d = Math.sqrt(_ox*_ox + _oy*_oy);\r\n                    if (other.plugin.radius > c.plugin.radius * 1.05 && d < 200) {'
);

// Fix 3: AI fallback stardust search
content = content.replace(
    '                        let d = Vector.magnitude(Vector.sub(c.position, sd.position));\r\n                        if (d < nearestDist) { nearestDist = d; target = sd.position; }',
    '                        let _sdx2 = c.position.x - sd.position.x;\r\n                        let _sdy2 = c.position.y - sd.position.y;\r\n                        let d = Math.sqrt(_sdx2*_sdx2 + _sdy2*_sdy2);\r\n                        if (d < nearestDist) { nearestDist = d; target = sd.position; }'
);

// Fix 4: Dynamic Ghosting loop - REPLACE with Spatial Grid + O(N^2) fallback
const oldGhosting = `        // 2. Dynamic Ghosting (Only when a predator is close to a prey, the prey becomes a ghost to countries so it can overlap!)
        if (!this.isInvincible) {
            for (let i = 0; i < aliveCountries.length; i++) {
                let c1 = aliveCountries[i];
                for (let j = i + 1; j < aliveCountries.length; j++) {
                    let c2 = aliveCountries[j];
                    let dist = Vector.magnitude(Vector.sub(c1.position, c2.position));
                    if (dist < c1.plugin.radius + c2.plugin.radius + 30) {
                        if (c1.plugin.radius > c2.plugin.radius * 1.05) {
                            c2.collisionFilter.mask = CATEGORY_WALL; // prey ignores country collisions
                        } else if (c2.plugin.radius > c1.plugin.radius * 1.05) {
                            c1.collisionFilter.mask = CATEGORY_WALL; // prey ignores country collisions
                        }
                    }
                }
            }
        }`;

const newGhosting = `        // 2. Dynamic Ghosting - Smart fallback: Spatial Grid for >50, O(N^2) for <=50
        if (!this.isInvincible) {
            if (aliveCountries.length > 50) {
                // Refactor #3: Spatial Hash Grid - O(N*K) for large counts
                const CELL = 150;
                const sgrid = new Map();
                for (let i = 0; i < aliveCountries.length; i++) {
                    const c = aliveCountries[i];
                    const cx = Math.floor(c.position.x / CELL);
                    const cy = Math.floor(c.position.y / CELL);
                    const key = (cx << 16) | (cy & 0xFFFF);
                    if (!sgrid.has(key)) sgrid.set(key, []);
                    sgrid.get(key).push(c);
                }
                for (let i = 0; i < aliveCountries.length; i++) {
                    const c1 = aliveCountries[i];
                    const cx = Math.floor(c1.position.x / CELL);
                    const cy = Math.floor(c1.position.y / CELL);
                    for (let nx = cx - 1; nx <= cx + 1; nx++) {
                        for (let ny = cy - 1; ny <= cy + 1; ny++) {
                            const nbrs = sgrid.get((nx << 16) | (ny & 0xFFFF));
                            if (!nbrs) continue;
                            for (let k = 0; k < nbrs.length; k++) {
                                const c2 = nbrs[k];
                                if (c1 === c2) continue;
                                // Refactor #5: GC-free primitive math
                                let _dx = c1.position.x - c2.position.x;
                                let _dy = c1.position.y - c2.position.y;
                                let dist = Math.sqrt(_dx*_dx + _dy*_dy);
                                if (dist < c1.plugin.radius + c2.plugin.radius + 30) {
                                    if (c1.plugin.radius > c2.plugin.radius * 1.05) {
                                        c2.collisionFilter.mask = CATEGORY_WALL;
                                    } else if (c2.plugin.radius > c1.plugin.radius * 1.05) {
                                        c1.collisionFilter.mask = CATEGORY_WALL;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // Refactor #3 Fallback: Standard O(N^2) for <=50 entities
                // (safe for massive entities whose radius exceeds cell size)
                for (let i = 0; i < aliveCountries.length; i++) {
                    let c1 = aliveCountries[i];
                    for (let j = i + 1; j < aliveCountries.length; j++) {
                        let c2 = aliveCountries[j];
                        // Refactor #5: GC-free primitive math
                        let _dx = c1.position.x - c2.position.x;
                        let _dy = c1.position.y - c2.position.y;
                        let dist = Math.sqrt(_dx*_dx + _dy*_dy);
                        if (dist < c1.plugin.radius + c2.plugin.radius + 30) {
                            if (c1.plugin.radius > c2.plugin.radius * 1.05) {
                                c2.collisionFilter.mask = CATEGORY_WALL;
                            } else if (c2.plugin.radius > c1.plugin.radius * 1.05) {
                                c1.collisionFilter.mask = CATEGORY_WALL;
                            }
                        }
                    }
                }
            }
        }`;

content = content.replace(oldGhosting, newGhosting);

// Fix 5: Eating loop - replace Vector calls with GC-free primitives
content = content.replace(
    '                let dist = Vector.magnitude(Vector.sub(c1.position, sd.position));\r\n                if (dist < c1.plugin.radius) {',
    '                let _sdx3 = c1.position.x - sd.position.x;\r\n                let _sdy3 = c1.position.y - sd.position.y;\r\n                let dist = Math.sqrt(_sdx3*_sdx3 + _sdy3*_sdy3);\r\n                if (dist < c1.plugin.radius) {'
);

// Fix 6: Country eating loop dist check
content = content.replace(
    '                let dist = Vector.magnitude(Vector.sub(c1.position, c2.position));\r\n                \r\n                let eatDist1 = c1.plugin.radius;',
    '                let _ex = c1.position.x - c2.position.x;\r\n                let _ey = c1.position.y - c2.position.y;\r\n                let dist = Math.sqrt(_ex*_ex + _ey*_ey);\r\n                \r\n                let eatDist1 = c1.plugin.radius;'
);

// Fix 7: Spike dist check
content = content.replace(
    '                let dist = Vector.magnitude(Vector.sub(c1.position, sp.position));\r\n                if (!this.isInvincible && dist < c1.plugin.radius && c1.plugin.radius > sp.plugin.radius * 1.25) {',
    '                let _spx = c1.position.x - sp.position.x;\r\n                let _spy = c1.position.y - sp.position.y;\r\n                let dist = Math.sqrt(_spx*_spx + _spy*_spy);\r\n                if (!this.isInvincible && dist < c1.plugin.radius && c1.plugin.radius > sp.plugin.radius * 1.25) {'
);

// Fix 8: Wall bounce impact - GC-free (already primitives but clean up Vector call in bounce event)
content = content.replace(
    "this.events.push({ type: 'bounce', id: c1.plugin.id, impact: Vector.magnitude({x:vx, y:vy}) * 10 });",
    "this.events.push({ type: 'bounce', id: c1.plugin.id, impact: Math.sqrt(vx*vx + vy*vy) * 10 });"
);

fs.writeFileSync('physics.js', content);
console.log('Refactors #3 (Spatial Grid + fallback) and #5 (GC-free math) applied to physics.js');
