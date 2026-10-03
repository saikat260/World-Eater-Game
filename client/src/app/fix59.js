const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Update BGM target volume from 0.15 to 0.40
content = content.replace(/this\.bgmGain\.gain\.linearRampToValueAtTime\(0\.15, this\.ctx\.currentTime \+ 2\.0\);/, 'this.bgmGain.gain.linearRampToValueAtTime(0.40, this.ctx.currentTime + 2.0);');

fs.writeFileSync('page.tsx', content);
console.log("Increased BGM volume to 0.40");
