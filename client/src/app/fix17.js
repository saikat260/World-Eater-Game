const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(
    /className="grid gap-\[2px\] w-full content-start overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white\/20"/,
    'className="grid gap-[2px] w-full h-full content-end overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white/20"'
);

fs.writeFileSync('page.tsx', content);
console.log("Changed grid to content-end");
