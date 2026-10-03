const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace the container to what it was
content = content.replace(
    /className="relative w-full max-w-\[56\.25vh\] h-\[100vh\] bg-\[#0F0F1A\] border-2 border-\[#1a1a2e\] flex flex-col justify-start"/,
    'className="relative w-[56.25vh] max-w-[100vw] h-[100vh] bg-[#0F0F1A] border-2 border-[#1a1a2e] flex flex-col"'
);

// Restore Top HUD
content = content.replace(
    /\{\/\* Top HUD \*\/\}\s*<div className="w-full flex flex-col p-4 z-10 bg-gradient-to-b from-black\/90 to-transparent absolute top-0 left-0">/,
    '{/* 20% Top HUD */}\n                 <div className="h-[20%] w-full flex flex-col p-4 z-10 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0">'
);

// Restore Canvas Container size (h-[65%] mt-[20%])
content = content.replace(
    /<div className="w-full aspect-\[3\/4\] relative shrink-0 mt-\[15%\]">/,
    '<div className="h-[65%] w-full relative mt-[20%]">'
);

// Restore canvas styling
content = content.replace(
    /<canvas ref=\{canvasRef\} width=\{1080\} height=\{1440\} className="w-full h-full block" style=\{\{ touchAction: 'none' \}\} \/>/,
    '<canvas ref={canvasRef} width={1080} height={1440} className="w-full h-full absolute inset-0 block" style={{ touchAction: \'none\' }} />'
);

// Modify Footer Area so it covers the gap: make it h-[16%] and absolute bottom-0
content = content.replace(
    /\{\/\* Footer Area \*\/\}\s*<div className="flex-1 w-full bg-black\/95 border-t-2 border-\[#ffaa00\] p-2 flex flex-col items-center justify-start z-10 shadow-\[0_-5px_20px_rgba\(255,170,0,0\.2\)\] gap-1">/,
    '{/* Footer Area */}\n                 <div className="h-[16%] w-full bg-black/95 border-t-2 border-[#ffaa00] p-2 flex flex-col items-center justify-start z-10 absolute bottom-0 left-0 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-1">'
);

fs.writeFileSync('page.tsx', content);
console.log("Restored layout successfully");
