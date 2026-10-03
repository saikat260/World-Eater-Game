const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace gameState?.timer with gameState?.phaseTimer in the red HUD element.
content = content.replace(
    /\{Math\.floor\(\(gameState\?\.timer \|\| 0\) \/ 60\)/g,
    '{Math.floor((gameState?.phaseTimer || 0) / 60)'
);
content = content.replace(
    /\{\(Math\.floor\(gameState\?\.timer \|\| 0\) % 60\)/g,
    '{(Math.floor(gameState?.phaseTimer || 0) % 60)'
);

fs.writeFileSync('page.tsx', content);
console.log("Updated page.tsx to use phaseTimer");
