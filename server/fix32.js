import fs from 'fs';
let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
    /totalInitial: gameState\.total_countries_initial,/g,
    'totalInitial: gameState.total_countries_initial,\n        qualified_winners: Object.values(gameState.qualified_winners),'
);

fs.writeFileSync('server.js', content);
console.log("Added qualified_winners to state payload");
