const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(
    /\{gameState\?\.deadCountriesList\?\.map\(\(iso, idx\) => \(/,
    '{gameState?.deadCountriesList?.filter(iso => typeof iso === "string" && iso.length >= 2).map((iso, idx) => ('
);

content = content.replace(
    /className="w-full aspect-\[4\/3\] object-cover rounded-\[1px\] animate-in zoom-in duration-300 shadow-sm border border-white\/20"/g,
    'className="w-full aspect-[4/3] object-cover rounded-[1px] animate-in zoom-in duration-300 shadow-sm border border-white/20 min-w-0" onError={(e) => { e.currentTarget.style.display = "none"; }}'
);

fs.writeFileSync('page.tsx', content);
console.log("Added error handling and filtering for flags");
