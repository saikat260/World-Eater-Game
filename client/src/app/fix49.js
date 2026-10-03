const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Update Top HUD to use tournamentTimer and remove phase name
content = content.replace(
    /ROUND \{gameState\?\.match \|\| 1\} <span className="inline-block mx-1">\{String\.fromCodePoint\(0x23F1\)\}<\/span> \{formatTime\(gameState\?\.phaseTimer \|\| 0\)\} - \{gameState\?\.phaseName\?\.toUpperCase\(\)\}/,
    'ROUND {gameState?.match || 1} <span className="inline-block mx-1">{String.fromCodePoint(0x23F1)}</span> {formatTime(gameState?.tournamentTimer || 0)}'
);

// Add Phase Timer just above canvas
const phaseHUD = `<div className="absolute w-full text-center text-red-500 text-[10px] font-bold tracking-widest z-10" style={{ top: 'calc(11.25vh + 100px - 10px)', transform: 'translateY(-100%)' }}>
                       {gameState?.phaseName?.toUpperCase()} <span className="inline-block mx-1">{String.fromCodePoint(0x23F1)}</span> {formatTime(gameState?.phaseTimer || 0)}
                   </div>`;

content = content.replace(
    /<div className="h-\[calc\(65vh-100px\)\] w-full relative mt-\[calc\(11\.25vh\+100px\)\] shrink-0">/,
    phaseHUD + '\n                   <div className="h-[calc(65vh-100px)] w-full relative mt-[calc(11.25vh+100px)] shrink-0">'
);

fs.writeFileSync('page.tsx', content);
console.log("Updated UI for both timers");
