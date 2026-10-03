const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(
    /style=\{\{ top: "84\.1%" \}\}/,
    'style={{ top: "83.8%" }}'
);

fs.writeFileSync('page.tsx', content);
console.log("Applied inline style for footer top 83.8%");
