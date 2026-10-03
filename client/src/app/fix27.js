const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Find the canvas container
const canvasContainerRegex = /<div className="h-\[calc\(65vh-100px\)\] w-full relative mt-\[calc\(11\.25vh\+100px\)\] shrink-0">/;

// Inject the absolute text above it
const replacement = `<div className="absolute w-full text-center text-red-500 text-[10px] font-bold tracking-widest z-10" style={{ top: 'calc(11.25vh + 100px - 5px)', transform: 'translateY(-100%)' }}>
                        {gameState?.phaseName?.toUpperCase() || 'LOADING...'} | {Math.floor((gameState?.timer || 0) / 60).toString().padStart(2, '0')}:{(Math.floor(gameState?.timer || 0) % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="h-[calc(65vh-100px)] w-full relative mt-[calc(11.25vh+100px)] shrink-0">`;

content = content.replace(canvasContainerRegex, replacement);

fs.writeFileSync('page.tsx', content);
console.log("Added small red text 5px above the play area");
