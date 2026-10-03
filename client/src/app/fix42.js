const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(
    /<div key=\{safePage\} className="flex flex-col w-full animate-\[fadeIn_0\.5s_ease-in-out\]">/,
    '<div key={safePage} className="flex flex-col w-full h-[120px] animate-[fadeIn_0.5s_ease-in-out]">'
);

fs.writeFileSync('page.tsx', content);
console.log("Added h-[120px] to leaderboard list container");
