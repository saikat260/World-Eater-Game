import fs from 'fs';
let content = fs.readFileSync('server.js', 'utf8');

// Replace io.emit('match-winner', winner);
content = content.replace(/io\.emit\('match-winner', winner\);/g, "io.emit('match-winner', { iso: winner.iso, name: winner.name, phase: currentPhaseNum });");

fs.writeFileSync('server.js', content);
console.log("server.js updated with phase in match-winner");
