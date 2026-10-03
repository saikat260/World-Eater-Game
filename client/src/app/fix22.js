const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Remove the Phase text
const phaseTextRegex = /\{gameState\?\.phaseName\?\.toUpperCase\(\) \|\| 'LOADING\.\.\.'\} \| \{Math\.floor\(\(gameState\?\.timer \|\| 0\) \/ 60\)\.toString\(\)\.padStart\(2, '0'\)\}:\{\(Math\.floor\(gameState\?\.timer \|\| 0\) % 60\)\.toString\(\)\.padStart\(2, '0'\)\}/;
content = content.replace(phaseTextRegex, '');

// 2. Shrink canvas from top by 100px
content = content.replace(
    /<div className="h-\[65vh\] w-full relative mt-\[11\.25vh\] shrink-0">/,
    '<div className="h-[calc(65vh-100px)] w-full relative mt-[calc(11.25vh+100px)] shrink-0">'
);

fs.writeFileSync('page.tsx', content);
console.log("Removed header text and shrunk play area from top by 100px");
