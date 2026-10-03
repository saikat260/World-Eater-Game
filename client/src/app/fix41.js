const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const regex = /<div className="text-white\/50 text-center text-\[10px\] py-2 italic">Awaiting first result\.\.\.<\/div>/;

content = content.replace(regex, 'null'); // replaces the component with null so it renders nothing

fs.writeFileSync('page.tsx', content);
console.log("Removed awaiting first result message");
