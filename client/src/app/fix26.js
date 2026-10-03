const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace the previous -mt-[0.4vh] with the exact calculation
content = content.replace(/-mt-\[0\.4vh\]/g, '-mt-[calc((65vh-100px)/72)]');

fs.writeFileSync('page.tsx', content);
console.log("Applied precise negative margin to perfectly touch the border");
