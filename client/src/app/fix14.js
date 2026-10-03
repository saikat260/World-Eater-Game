const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Fix Top HUD
content = content.replace(
    /\{\/\* 20% Top HUD \*\/\}\s*<div className="h-\[20%\] w-full flex flex-col p-4 z-10 bg-gradient-to-b from-black\/90 to-transparent absolute top-0 left-0">/,
    '{/* 15vh Top HUD */}\n                   <div className="h-[15vh] w-full flex flex-col p-4 z-10 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0">'
);

// 2. Fix Canvas Container
content = content.replace(
    /\{\/\* Canvas Container \*\/\}\s*<div className="h-\[65%\] w-full relative mt-\[20%\]">/,
    '{/* Canvas Container */}\n                   <div className="h-[65vh] w-full relative mt-[11.25vh] shrink-0">'
);

// 3. Fix Footer Container
// We'll match the current footer which has inline style top: 83.8% and absolute positioning.
const footerRegex = /\{\/\* Footer Area \*\/\}\s*<div className="w-full bg-black\/95 border-t-2 border-\[#ffaa00\] pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 absolute bottom-0 left-0 shadow-\[0_-5px_20px_rgba\(255,170,0,0\.2\)\] gap-\[2px\]" style=\{\{ top: "83\.8%" \}\}>/;
content = content.replace(
    footerRegex,
    '{/* Footer Area */}\n                   <div className="flex-1 w-full bg-black/95 border-t-2 border-[#ffaa00] pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-[2px] -mt-[0.9vh] relative">'
);

fs.writeFileSync('page.tsx', content);
console.log("Applied absolute flawless flexbox layout");
