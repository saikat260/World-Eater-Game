const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace top-[84.1%] with inline style
content = content.replace(
    /className="w-full bg-black\/95 border-t-2 border-\[#ffaa00\] pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 absolute top-\[84\.1%\] bottom-0 left-0 shadow-\[0_-5px_20px_rgba\(255,170,0,0\.2\)\] gap-\[2px\]"/,
    'className="w-full bg-black/95 border-t-2 border-[#ffaa00] pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 absolute bottom-0 left-0 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-[2px]" style={{ top: "84.1%" }}'
);

fs.writeFileSync('page.tsx', content);
console.log("Applied inline style for footer top");
