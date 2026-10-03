import fs from 'fs';
let content = fs.readFileSync('server.js', 'utf8');

// The actual payload line is: totalInitial: engine.countries.length, deadCountriesList: stateData.deadCountriesList,
content = content.replace(
    /totalInitial: engine\.countries\.length, deadCountriesList: stateData\.deadCountriesList,/g,
    'totalInitial: engine.countries.length, deadCountriesList: stateData.deadCountriesList,\n        qualified_winners: Object.values(gameState.qualified_winners),'
);

fs.writeFileSync('server.js', content);
console.log("Successfully injected qualified_winners into io.emit payload");
