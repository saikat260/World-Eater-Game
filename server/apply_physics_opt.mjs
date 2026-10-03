import fs from 'fs';

let content = fs.readFileSync('physics.js', 'utf8');

// 1. Add this.aliveStardust = [] in constructor
content = content.replace(
    'this.countries = []; this.deadCountriesList = [];\r\n        this.stardust = [];',
    'this.countries = []; this.deadCountriesList = [];\r\n        this.stardust = [];\r\n        this.aliveStardust = [];'
);

// 2. Add this.aliveStardust in initMatch
content = content.replace(
    'this.countries = []; this.deadCountriesList = [];\r\n        this.stardust = [];\r\n        this.spikes = [];',
    'this.countries = []; this.deadCountriesList = [];\r\n        this.stardust = [];\r\n        this.aliveStardust = [];\r\n        this.spikes = [];'
);

content = content.replace(
    'this.stardust.push(body);\r\n            Composite.add(this.engine.world, body);\r\n        }\r\n    }\r\n\r\n    update(dt) {',
    'this.stardust.push(body);\r\n            Composite.add(this.engine.world, body);\r\n        }\r\n        this.aliveStardust = [...this.stardust];\r\n    }\r\n\r\n    update(dt) {'
);

// 3. Stardust respawn logic in update(dt)
content = content.replace(
    '        let aliveStardustCount = this.stardust.filter(s => s.plugin.alive).length;\r\n        if (aliveStardustCount < 50 && Math.random() < 0.05) {\r\n            let dead = this.stardust.find(s => !s.plugin.alive);\r\n            if (dead) {\r\n                dead.plugin.alive = true;\r\n                Body.setPosition(dead, {\r\n                    x: Math.random() * (this.width - 100) + 50,\r\n                    y: Math.random() * (this.height - 100) + 50\r\n                });\r\n                Composite.add(this.engine.world, dead);\r\n            }\r\n        }',
    '        let aliveStardustCount = this.aliveStardust.length;\r\n        if (aliveStardustCount < 50 && Math.random() < 0.05) {\r\n            let dead = this.stardust.find(s => !s.plugin.alive);\r\n            if (dead) {\r\n                dead.plugin.alive = true;\r\n                Body.setPosition(dead, {\r\n                    x: Math.random() * (this.width - 100) + 50,\r\n                    y: Math.random() * (this.height - 100) + 50\r\n                });\r\n                Composite.add(this.engine.world, dead);\r\n                this.aliveStardust.push(dead); // Edge-case safe: re-add to alive list\r\n            }\r\n        }'
);

// 4. AI steering target finding: use this.aliveStardust
content = content.replace(
    '            if (this.isInvincible) {\r\n                this.stardust.forEach(sd => {',
    '            if (this.isInvincible) {\r\n                this.aliveStardust.forEach(sd => {'
);

content = content.replace(
    '                    this.stardust.forEach(sd => {\r\n                        if (!sd.plugin.alive) return;\r\n                        let _sdx2 = c.position.x - sd.position.x;',
    '                    this.aliveStardust.forEach(sd => {\r\n                        if (!sd.plugin.alive) return;\r\n                        let _sdx2 = c.position.x - sd.position.x;'
);

// 5. Eating loop: iterate aliveStardust in reverse with splice
const oldStardustEat = `            this.stardust.forEach(sd => {
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
            });`;

const newStardustEat = `            for (let sIdx = this.aliveStardust.length - 1; sIdx >= 0; sIdx--) {
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
            }`;

content = content.replace(oldStardustEat, newStardustEat);

// 6. getState() single pass & pre-sort ascending by radius
const oldGetState = `    getState() {
        return {
            countries: this.countries.filter(c => c.plugin.alive).map(c => ({ 
                id: c.plugin.id, iso: c.plugin.iso, name: c.plugin.name, 
                x: c.position.x, y: c.position.y, radius: c.plugin.radius, 
                vx: c.velocity.x, vy: c.velocity.y 
            })),
            stardust: this.stardust.filter(s => s.plugin.alive).map(s => ({ 
                id: s.plugin.id, x: s.position.x, y: s.position.y, radius: s.plugin.radius 
            })),
            spikes: this.spikes.map(s => ({ x: s.position.x, y: s.position.y, radius: s.plugin.radius })),
            timer: this.matchTimer,
            phaseTimer: this.phaseTimer || 0,
            tournamentTimer: this.tournamentTimer || 0,
            bounds: { xMin: 20, xMax: this.width - 20, yMin: 20, yMax: this.height - 20 },
            isInvincible: this.isInvincible, deadCountriesList: this.deadCountriesList
        };
    }`;

const newGetState = `    getState() {
        // Optimization: Single-pass + pre-sort ascending by radius for client
        const aliveCountries = [];
        for (let i = 0; i < this.countries.length; i++) {
            const c = this.countries[i];
            if (c.plugin.alive) {
                aliveCountries.push({
                    id: c.plugin.id, iso: c.plugin.iso, name: c.plugin.name,
                    x: c.position.x, y: c.position.y, radius: c.plugin.radius,
                    vx: c.velocity.x, vy: c.velocity.y
                });
            }
        }
        aliveCountries.sort((a, b) => a.radius - b.radius);

        const activeStardust = [];
        for (let i = 0; i < this.aliveStardust.length; i++) {
            const s = this.aliveStardust[i];
            if (s.plugin.alive) {
                activeStardust.push({ id: s.plugin.id, x: s.position.x, y: s.position.y, radius: s.plugin.radius });
            }
        }

        return {
            countries: aliveCountries,
            stardust: activeStardust,
            spikes: this.spikes.map(s => ({ x: s.position.x, y: s.position.y, radius: s.plugin.radius })),
            timer: this.matchTimer,
            phaseTimer: this.phaseTimer || 0,
            tournamentTimer: this.tournamentTimer || 0,
            bounds: { xMin: 20, xMax: this.width - 20, yMin: 20, yMax: this.height - 20 },
            isInvincible: this.isInvincible,
            deadCountriesList: this.deadCountriesList
        };
    }`;

content = content.replace(oldGetState, newGetState);

fs.writeFileSync('physics.js', content);
console.log('physics.js successfully updated with Fix #7, #8, #10');
