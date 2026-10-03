const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(
    /bg-\[#0F0F1A\]/g,
    'bg-black'
);

fs.writeFileSync('page.tsx', content);
console.log("Changed background to black");
