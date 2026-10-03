const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Remove the old timer from above the canvas
content = content.replace(
    /<div className="absolute w-full text-center text-red-500 text-\[10px\] font-bold tracking-widest z-10" style=\{\{ top: 'calc\(11\.25vh \+ 100px - 5px\)', transform: 'translateY\(-100%\)' \}\}>[\s\S]*?<\/div>\s*<div className="h-\[calc\(65vh-100px\)\] w-full relative mt-\[calc\(11\.25vh\+100px\)\] shrink-0">/,
    '<div className="h-[calc(65vh-100px)] w-full relative mt-[calc(11.25vh+100px)] shrink-0">'
);

// 2. Put the timer into the Top HUD (which is absolute top-0) and then the leaderboard
const oldLeaderboard = /\{\(\(\) => \{[\s\S]*?return null;\s*\}\)\(\)\}/;

const newTopHUD = `{(() => {
    const phaseNumber = parseInt(gameState?.phaseName?.match(/\\d+/)?.[0] || "1");
    let qualTitle = "QUALIFIED FOR QUARTER-FINAL";
    if (phaseNumber === 2) qualTitle = "QUALIFIED FOR SEMI-FINAL";
    if (phaseNumber === 3) qualTitle = "QUALIFIED FOR FINAL";
    if (phaseNumber === 4) qualTitle = "CHAMPION";
    
    const allWinners = gameState?.qualified_winners || [];
    const currentWinners = allWinners.filter(w => w.wins >= phaseNumber);
    
    const rowsPerPage = 5;
    const totalPages = Math.ceil(currentWinners.length / rowsPerPage) || 1;
    const safePage = currentWinners.length > 0 ? (leaderboardPage % totalPages) : 0;
    const startIndex = safePage * rowsPerPage;
    const recentWinners = currentWinners.slice(startIndex, startIndex + rowsPerPage);
    
    return (
        <div className="absolute top-[1vh] left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-20 flex flex-col gap-1">
            {/* Phase Timer and Round */}
            <div className="text-center text-red-500 text-[10px] font-bold tracking-widest drop-shadow-md">
                ROUND {gameState?.match || 1} <span className="inline-block mx-1">?</span> {formatTime(gameState?.phaseTimer || 0)} - {gameState?.phaseName?.toUpperCase()}
            </div>
            
            {/* Leaderboard - Only show if not Champion phase (phase 5) */}
            {phaseNumber < 5 && (
                <div className="w-full bg-[#1a0505]/90 border border-red-500 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(255,0,0,0.3)] backdrop-blur-sm">
                    <div className="text-white text-center font-bold tracking-widest text-[8px] py-[3px] border-b border-red-500/50 uppercase">
                        {qualTitle}
                    </div>
                    <div key={safePage} className="flex flex-col w-full h-[85px] animate-[fadeIn_0.5s_ease-in-out]">
                        {recentWinners.length === 0 ? null : recentWinners.map((winner, i) => (
                            <div key={winner.iso + i} className={\`flex items-center justify-between px-2 py-[2px] \${i % 2 === 0 ? 'bg-red-900/20' : 'bg-transparent'} border-b border-red-500/20 last:border-0\`}>
                                <div className="text-red-500 font-bold text-[8px] w-5">#{startIndex + i + 1}</div>
                                <div className="flex items-center gap-1.5 flex-1 justify-center">
                                    <img src={\`https://flagcdn.com/w20/\${winner.iso}.png\`} alt={winner.iso} className="w-3 h-2 object-cover rounded-[1px] shadow-sm" />
                                    <span className="text-white text-[8px] font-semibold tracking-wide">
                                        {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(winner.iso.toUpperCase()); } catch(e) { return winner.name; } })()}
                                    </span>
                                </div>
                                <div className="text-green-400 font-bold text-[7px] flex items-center gap-1 w-14 justify-end">
                                    {String.fromCharCode(10003)} <span className="uppercase tracking-wider">QUALIFIED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
})()}`;

content = content.replace(oldLeaderboard, newTopHUD);

fs.writeFileSync('page.tsx', content);
console.log("Moved timer to top, shrunk leaderboard");
