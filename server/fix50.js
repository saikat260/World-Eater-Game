import fs from 'fs';
let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
    /engine\.phaseTimer = 0;/g,
    'engine.phaseTimer = 0; engine.tournamentTimer = 0;'
);

fs.writeFileSync('server.js', content);
console.log("Updated reset logic for tournamentTimer in server.js");
