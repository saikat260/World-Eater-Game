const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const playPopRegex = /playPop\(\) \{\s*if \(\!this\.ctx\) return;\s*const osc = this\.ctx\.createOscillator\(\);/;
const playPopReplacement = `popTimestamps: number[] = [];
    playPop() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.popTimestamps = this.popTimestamps.filter(t => now - t < 0.1);
        if (this.popTimestamps.length > 8) return;
        this.popTimestamps.push(now);

        const osc = this.ctx.createOscillator();`;

const playKillRegex = /playKill\(\) \{\s*if \(\!this\.ctx\) return;\s*const osc = this\.ctx\.createOscillator\(\);/;
const playKillReplacement = `killTimestamps: number[] = [];
    playKill() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.killTimestamps = this.killTimestamps.filter(t => now - t < 0.2);
        if (this.killTimestamps.length > 3) return;
        this.killTimestamps.push(now);

        const osc = this.ctx.createOscillator();`;

content = content.replace(playPopRegex, playPopReplacement);
content = content.replace(playKillRegex, playKillReplacement);

fs.writeFileSync('page.tsx', content);
console.log("Added rate limits to playPop and playKill");
