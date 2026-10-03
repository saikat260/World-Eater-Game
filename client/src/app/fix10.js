const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace footer wrapper padding/gap
content = content.replace(
    /className="h-\[16%\] w-full bg-black\/95 border-t-2 border-\[#ffaa00\] p-2 flex flex-col items-center justify-start z-10 absolute bottom-0 left-0 shadow-\[0_-5px_20px_rgba\(255,170,0,0\.2\)\] gap-1"/,
    'className="h-[16%] w-full bg-black/95 border-t-2 border-[#ffaa00] pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 absolute bottom-0 left-0 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-[2px]"'
);

// Remove mt-1 from progress bar container
content = content.replace(
    /<div className="w-\[95%\] h-1 bg-gray-800 rounded-full overflow-hidden border border-white\/10 shadow-inner mt-1">/,
    '<div className="w-[95%] h-1 bg-gray-800 rounded-full overflow-hidden border border-white/10 shadow-inner">'
);

// Remove mt-1 from the dead flags grid container
content = content.replace(
    /<div className="w-\[95%\] flex-1 overflow-hidden relative mt-1">/,
    '<div className="w-[95%] flex-1 overflow-hidden relative">'
);

fs.writeFileSync('page.tsx', content);
console.log("Moved footer elements up successfully");
