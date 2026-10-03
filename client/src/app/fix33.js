const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const searchPoint = /\{\/\* 15vh Top HUD \*\/\}/;

const leaderboardJSX = `
{(() => {
    const phaseNumber = parseInt(gameState?.phaseName?.match(/\\d+/)?.[0] || "1");
    let qualTitle = "QUALIFIED FOR QUARTER-FINAL";
    if (phaseNumber === 2) qualTitle = "QUALIFIED FOR SEMI-FINAL";
    if (phaseNumber === 3) qualTitle = "QUALIFIED FOR FINAL";
    if (phaseNumber === 4) qualTitle = "CHAMPION";
    
    const allWinners = gameState?.qualified_winners || [];
    const currentWinners = allWinners.filter(w => w.wins >= phaseNumber);
    const recentWinners = currentWinners.slice(-5);
    const startIndex = Math.max(0, currentWinners.length - 5);
    
    if (phaseNumber < 5 && currentWinners.length > 0) {
        return (
            <div className="absolute top-[2vh] left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-[#1a0505]/90 border border-red-500 rounded-xl overflow-hidden z-20 shadow-[0_0_15px_rgba(255,0,0,0.3)] backdrop-blur-sm">
                <div className="text-white text-center font-bold tracking-widest text-[10px] py-[6px] border-b border-red-500/50 uppercase">
                    {qualTitle}
                </div>
                <div className="flex flex-col w-full">
                    {recentWinners.map((winner, i) => (
                        <div key={winner.iso + i} className={\`flex items-center justify-between px-3 py-[4px] \${i % 2 === 0 ? 'bg-red-900/20' : 'bg-transparent'} border-b border-red-500/20 last:border-0\`}>
                            <div className="text-red-500 font-bold text-[10px] w-6">#{startIndex + i + 1}</div>
                            <div className="flex items-center gap-2 flex-1 justify-center">
                                <img src={\`https://flagcdn.com/w20/\${winner.iso}.png\`} alt={winner.iso} className="w-4 h-3 object-cover rounded-[1px] shadow-sm" />
                                <span className="text-white text-[10px] font-semibold tracking-wide">
                                    {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(winner.iso.toUpperCase()); } catch(e) { return winner.name; } })()}
                                </span>
                            </div>
                            <div className="text-green-400 font-bold text-[8px] flex items-center gap-1 w-16 justify-end">
                                ? <span className="uppercase tracking-wider">QUALIFIED</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
})()}
`;

content = content.replace(searchPoint, leaderboardJSX + '\n                   {/* 15vh Top HUD */}');

fs.writeFileSync('page.tsx', content);
console.log("Injected leaderboard component");
