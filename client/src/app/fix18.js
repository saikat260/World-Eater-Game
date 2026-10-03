const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Grid container: change content-end to content-start and add scale-y-[-1]
content = content.replace(
    /className="grid gap-\[2px\] w-full h-full content-end overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white\/20"/,
    'className="grid gap-[2px] w-full h-full content-start scale-y-[-1] overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white/20"'
);

// 2. Img tags: add scale-y-[-1]
content = content.replace(
    /className="w-full aspect-\[4\/3\] object-cover rounded-\[1px\] animate-in zoom-in duration-300 shadow-sm border border-white\/20 min-w-0"/g,
    'className="w-full aspect-[4/3] object-cover rounded-[1px] animate-in zoom-in duration-300 shadow-sm border border-white/20 min-w-0 scale-y-[-1]"'
);

fs.writeFileSync('page.tsx', content);
console.log("Applied scale-y-[-1] for bottom-to-top rendering");
