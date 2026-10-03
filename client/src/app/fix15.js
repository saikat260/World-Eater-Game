const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace the static 32 columns with a dynamic value based on totalInitial
content = content.replace(
    /style=\{\{gridTemplateColumns:"repeat\(32, minmax\(0, 1fr\)\)"\}\}/g,
    'style={{ gridTemplateColumns: `repeat(${Math.min(32, gameState?.totalInitial || 32)}, minmax(0, 1fr))` }}'
);

content = content.replace(
    /style=\{\{ gridTemplateColumns: 'repeat\(32, minmax\(0, 1fr\)\)' \}\}/g,
    'style={{ gridTemplateColumns: `repeat(${Math.min(32, gameState?.totalInitial || 32)}, minmax(0, 1fr))` }}'
);

fs.writeFileSync('page.tsx', content);
console.log("Updated grid columns to be dynamic");
