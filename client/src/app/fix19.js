const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Grid container: remove scale-y-[-1], add dir="rtl"
content = content.replace(
    /<div className="grid gap-\[2px\] w-full h-full content-start scale-y-\[-1\] overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white\/20"/,
    '<div dir="rtl" className="grid gap-[2px] w-full h-full content-start overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white/20"'
);

// 2. Img tags: remove scale-y-[-1]
content = content.replace(
    /className="w-full aspect-\[4\/3\] object-cover rounded-\[1px\] animate-in zoom-in duration-300 shadow-sm border border-white\/20 min-w-0 scale-y-\[-1\]"/g,
    'className="w-full aspect-[4/3] object-cover rounded-[1px] animate-in zoom-in duration-300 shadow-sm border border-white/20 min-w-0"'
);

fs.writeFileSync('page.tsx', content);
console.log("Applied RTL and removed scaleY(-1)");
