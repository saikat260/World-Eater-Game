import fs from 'fs';

let raw = fs.readFileSync('physics.js', 'utf8');
let content = raw.replace(/\r\n/g, '\n');
let applied = 0;

function must(oldStr, newStr, label) {
    if (!content.includes(oldStr)) {
        console.error('NOT FOUND: ' + label);
        process.exit(1);
    }
    content = content.replace(oldStr, newStr);
    applied++;
    console.log('applied: ' + label);
}

// 1) Stardust eating: iterate aliveStardust in reverse, remove eaten ones from the alive list
must(`            this.stardust.forEach(sd => {
                if (!sd.plugin.alive) return;
                let _sdx3 = c1.position.x - sd.position.x;
                let _sdy3 = c1.position.y - sd.position.y;
                let dist = Math.sqrt(_sdx3*_sdx3 + _sdy3*_sdy3);
                if (dist < c1.plugin.radius) {
                    sd.plugin.alive = false;
                    Composite.remove(this.engine.world, sd);
                    this.events.push({ type: 'pop' });
                    let oldR = c1.plugin.radius;
                    let newR = Math.sqrt(Math.pow(oldR, 2) + Math.pow(sd.plugin.radius, 2));
                    c1.plugin.radius = newR;
                    Body.scale(c1, newR / oldR, newR / oldR);
                }
            });`,
`            for (let sIdx = this.aliveStardust.length - 1; sIdx >= 0; sIdx--) {
                let sd = this.aliveStardust[sIdx];
                if (!sd.plugin.alive) {
                    this.aliveStardust.splice(sIdx, 1);
                    continue;
                }
                let _sdx3 = c1.position.x - sd.position.x;
                let _sdy3 = c1.position.y - sd.position.y;
                let dist = Math.sqrt(_sdx3*_sdx3 + _sdy3*_sdy3);
                if (dist < c1.plugin.radius) {
                    sd.plugin.alive = false;
                    Composite.remove(this.engine.world, sd);
                    this.aliveStardust.splice(sIdx, 1);
                    this.events.push({ type: 'pop' });
                    let oldR = c1.plugin.radius;
                    let newR = Math.sqrt(Math.pow(oldR, 2) + Math.pow(sd.plugin.radius, 2));
                    c1.plugin.radius = newR;
                    Body.scale(c1, newR / oldR, newR / oldR);
                }
            }`, 'stardust eating loop -> aliveStardust with splice');

// 2) getState: single pass, server-side ascending sort by radius (client no longer sorts), alive stardust only
must(`            countries: this.countries.filter(c => c.plugin.alive).map(c => ({ 
                id: c.plugin.id, iso: c.plugin.iso, name: c.plugin.name, 
                x: c.position.x, y: c.position.y, radius: c.plugin.radius, 
                vx: c.velocity.x, vy: c.velocity.y 
            })),
            stardust: this.stardust.filter(s => s.plugin.alive).map(s => ({ 
                id: s.plugin.id, x: s.position.x, y: s.position.y, radius: s.plugin.radius 
            })),`,
`            countries: this._aliveCountriesSorted(),
            stardust: this._aliveStardustSnapshot(),`, 'getState countries/stardust');

must(`    getState() {`,
`    _aliveCountriesSorted() {
        const out = [];
        for (let i = 0; i < this.countries.length; i++) {
            const c = this.countries[i];
            if (c.plugin.alive) {
                out.push({
                    id: c.plugin.id, iso: c.plugin.iso, name: c.plugin.name,
                    x: c.position.x, y: c.position.y, radius: c.plugin.radius,
                    vx: c.velocity.x, vy: c.velocity.y
                });
            }
        }
        // Ascending by radius: small drawn first, big on top (client relies on this order)
        out.sort((a, b) => a.radius - b.radius);
        return out;
    }

    _aliveStardustSnapshot() {
        const out = [];
        for (let i = 0; i < this.aliveStardust.length; i++) {
            const s = this.aliveStardust[i];
            if (s.plugin.alive) {
                out.push({ id: s.plugin.id, x: s.position.x, y: s.position.y, radius: s.plugin.radius });
            }
        }
        return out;
    }

    getState() {`, 'helper methods');

fs.writeFileSync('physics.js', content);
console.log('DONE, edits applied: ' + applied);
