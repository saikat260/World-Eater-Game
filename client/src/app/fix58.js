const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// POP limit and volume
content = content.replace(/this\.popTimestamps\.length > 8/, 'this.popTimestamps.length > 2');
content = content.replace(/gain\.gain\.setValueAtTime\(0\.3, this\.ctx\.currentTime\);/g, 'gain.gain.setValueAtTime(0.1, this.ctx.currentTime);');

// BOUNCE limit and volume
content = content.replace(/this\.bounceTimestamps\.length > 5/, 'this.bounceTimestamps.length > 2');
content = content.replace(/const volume = Math\.min\(0\.5, impact \/ 100\);/, 'const volume = Math.min(0.15, impact / 200);');

// KILL limit and volume
content = content.replace(/this\.killTimestamps\.length > 3/, 'this.killTimestamps.length > 1');
content = content.replace(/this\.killTimestamps = this\.killTimestamps\.filter\(t => now - t < 0\.2\);/, 'this.killTimestamps = this.killTimestamps.filter(t => now - t < 0.15);');
content = content.replace(/gain\.gain\.setValueAtTime\(0\.6, this\.ctx\.currentTime\);/g, 'gain.gain.setValueAtTime(0.25, this.ctx.currentTime);');

fs.writeFileSync('page.tsx', content);
console.log("Updated audio limits and lowered volumes");
