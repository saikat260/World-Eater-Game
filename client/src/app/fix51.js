const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(
    /className="aspect-\[4\/3\] object-cover rounded-\[1px\] animate-in zoom-in duration-300 shadow-sm border border-white\/20 min-w-0"/g,
    'className="aspect-[4/3] object-cover rounded-[1px] animate-in fade-in slide-in-from-top-8 duration-500 ease-out shadow-sm min-w-0"'
);

fs.writeFileSync('page.tsx', content);
console.log("Updated footer flag styles for drop animation and border removal.");
