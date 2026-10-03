const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

content = content.replace(
    /className="aspect-\[4\/3\] object-cover rounded-\[1px\] animate-in fade-in slide-in-from-top-8 duration-500 ease-out shadow-sm min-w-0"/g,
    'className="aspect-[4/3] object-cover rounded-[1px] animate-drop shadow-sm min-w-0"'
);

fs.writeFileSync('src/app/page.tsx', content);
console.log("Applied animate-drop in page.tsx");
