import fs from 'fs';

let content = fs.readFileSync('physics.js', 'utf8');

const oldStardustBlock = `        let aliveStardustCount = this.aliveStardust.length;
        if (aliveStardustCount < 50 && Math.random() < 0.05) {
            let dead = this.stardust.find(s => !s.plugin.alive);
            if (dead) {
                dead.plugin.alive = true;
                Body.setPosition(dead, {
                    x: Math.random() * (this.width - 100) + 50,
                    y: Math.random() * (this.height - 100) + 50
                });
                Composite.add(this.engine.world, dead);
                this.aliveStardust.push(dead); // Edge-case safe: re-add to alive list
            }
        }`;

const newStardustBlock = `        // Continuous Stardust Replenishment: Keep arena lush with ~160-170 stardust at all times
        let aliveStardustCount = this.aliveStardust.length;
        if (aliveStardustCount < 170) {
            const spawnBatch = aliveStardustCount < 100 ? 2 : 1;
            for (let k = 0; k < spawnBatch; k++) {
                let dead = this.stardust.find(s => !s.plugin.alive);
                if (dead) {
                    dead.plugin.alive = true;
                    Body.setPosition(dead, {
                        x: Math.random() * (this.width - 100) + 50,
                        y: Math.random() * (this.height - 100) + 50
                    });
                    Composite.add(this.engine.world, dead);
                    this.aliveStardust.push(dead);
                } else {
                    break;
                }
            }
        }`;

// Replace ignoring line ending discrepancies
const normalize = str => str.replace(/\r\n/g, '\n');
if (normalize(content).includes(normalize(oldStardustBlock))) {
    content = normalize(content).replace(normalize(oldStardustBlock), normalize(newStardustBlock));
    fs.writeFileSync('physics.js', content);
    console.log('Stardust replenishment logic successfully updated!');
} else {
    console.error('Target stardust block not found for replacement!');
}
