const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// The footer class currently has -mt-[0.9vh]
content = content.replace(/-mt-\[0\.9vh\]/g, '-mt-[0.4vh]');

fs.writeFileSync('page.tsx', content);
console.log("Adjusted negative margin on footer to reveal bottom border");
