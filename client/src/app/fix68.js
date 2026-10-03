const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(/wobbleAmp: number \}/g, 'wobbleAmp: number, currentRadius?: number }');

fs.writeFileSync('page.tsx', content);
console.log("TS type updated");
