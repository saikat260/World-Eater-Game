const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace('className="text-6xl font-bold text-[#ffaa00]', 'className="text-5xl font-bold text-[#ffaa00]');
content = content.replace('className="h-32 w-auto object-contain', 'className="h-20 w-auto object-contain');
content = content.replace('className="mt-6 text-4xl font-black', 'className="mt-4 text-2xl font-black');

fs.writeFileSync('page.tsx', content);
console.log("Success HTML text replace");
