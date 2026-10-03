import fs from 'fs';
let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
    /phaseTimer: stateData\.phaseTimer,/,
    'phaseTimer: stateData.phaseTimer,\n          tournamentTimer: stateData.tournamentTimer,'
);

content = content.replace(
    /gameState\.total_countries_initial = engine\.countries\.length;\s*gameState\.qualified_winners = \{\};/,
    'gameState.total_countries_initial = engine.countries.length;\n        gameState.qualified_winners = {};\n        engine.tournamentTimer = 0;'
);

fs.writeFileSync('server.js', content);
console.log("Updated server.js for tournamentTimer");
