const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Update BGM target volume from 0.40 to 0.80
content = content.replace(/this\.bgmGain\.gain\.linearRampToValueAtTime\(0\.40, this\.ctx\.currentTime \+ 2\.0\);/, 'this.bgmGain.gain.linearRampToValueAtTime(0.80, this.ctx.currentTime + 2.0);');

// Replace playPop
const oldPlayPopRegex = /playPop\(\) \{[\s\S]*?osc\.stop\(this\.ctx\.currentTime \+ 0\.05\);\s*\}/;
const newPlayPop = `playPop() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.popTimestamps = this.popTimestamps.filter(t => now - t < 0.1);
        if (this.popTimestamps.length > 2) return;
        this.popTimestamps.push(now);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterCompressor!);
        
        // Satisfying soft bubble pop
        osc.type = 'sine';
        const baseFreq = 400 + (Math.random() * 200);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 300, now + 0.08); 
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }`;
content = content.replace(oldPlayPopRegex, newPlayPop);

// Replace playKill
const oldPlayKillRegex = /playKill\(\) \{[\s\S]*?osc\.stop\(this\.ctx\.currentTime \+ 0\.3\);\s*\}/;
const newPlayKill = `playKill() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.killTimestamps = this.killTimestamps.filter(t => now - t < 0.15);
        if (this.killTimestamps.length > 1) return;
        this.killTimestamps.push(now);

        // Satisfying smooth deep gulp/bloop
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterCompressor!);
        
        osc.type = 'sine';
        osc2.type = 'triangle';
        
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.exponentialRampToValueAtTime(90, now + 0.2);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.2);
        osc2.stop(now + 0.2);
    }`;
content = content.replace(oldPlayKillRegex, newPlayKill);

fs.writeFileSync('page.tsx', content);
console.log("Updated BGM to 0.80 and redesigned playPop & playKill sounds");
