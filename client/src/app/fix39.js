const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const regex = /\{\(\(\) => \{[\s\S]*?return null;\s*\}\)\(\)\}/;

const fixedJSX = `{(() => {
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
    
    if (phaseNumber < 5) {
        return (
            <div className="absolute top-[2vh] left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-[#1a0505]/90 border border-red-500 rounded-xl overflow-hidden z-20 shadow-[0_0_15px_rgba(255,0,0,0.3)] backdrop-blur-sm">
                <div className="text-white text-center font-bold tracking-widest text-[10px] py-[6px] border-b border-red-500/50 uppercase">
                    {qualTitle}
                </div>
                <div key={safePage} className="flex flex-col w-full animate-[fadeIn_0.5s_ease-in-out]">
                    {recentWinners.length === 0 ? (
                        <div className="text-white/50 text-center text-[10px] py-2 italic">Awaiting first result...</div>
                    ) : (
                        recentWinners.map((winner, i) => (
                            <div key={winner.iso + i} className={\`flex items-center justify-between px-3 py-[4px] \${i % 2 === 0 ? 'bg-red-900/20' : 'bg-transparent'} border-b border-red-500/20 last:border-0\`}>
                                <div className="text-red-500 font-bold text-[10px] w-6">#{startIndex + i + 1}</div>
                                <div className="flex items-center gap-2 flex-1 justify-center">
                                    <img src={\`https://flagcdn.com/w20/\${winner.iso}.png\`} alt={winner.iso} className="w-4 h-3 object-cover rounded-[1px] shadow-sm" />
                                    <span className="text-white text-[10px] font-semibold tracking-wide">
                                        {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(winner.iso.toUpperCase()); } catch(e) { return winner.name; } })()}
                                    </span>
                                </div>
                                <div className="text-green-400 font-bold text-[8px] flex items-center gap-1 w-16 justify-end">
                                    {String.fromCharCode(10003)} <span className="uppercase tracking-wider">QUALIFIED</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }
    return null;
})()}`;

content = content.replace(regex, fixedJSX);

// Also remove extra </div></div> just in case it's lingering
content = content.replace(/<\/div><\/div>\s*<\/div>\s*\);\s*\}\s*return null;\s*\}\)\(\)\}/, '');

fs.writeFileSync('page.tsx', content);
console.log("Rewrote entire IIFE block");
