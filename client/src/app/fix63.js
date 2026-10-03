const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Inject the Phase 5 UI at the end of the root container
const targetRegex = /\{gameState\?\.isPaused && !matchWinner && \([\s\S]*?\}\s*<\/div>\s*<\/div>\s*<\/button>\s*<\/main>\s*\);\s*\}/;

const phase5UI = `{gameState?.phase === 5 && (
            <div className="absolute inset-0 z-[100] bg-black overflow-hidden flex flex-col items-center justify-center transition-all duration-1000">
                {gameState.countdown <= 10 ? (
                    <div className="absolute inset-0 bg-black z-[110] flex flex-col items-center justify-center animate-[fadeIn_2s_ease-in-out]">
                        <h1 className="text-4xl text-[#00f2fe] font-black tracking-widest animate-pulse">A New Era Begins in {Math.ceil(gameState.countdown)}...</h1>
                    </div>
                ) : (
                    <>
                        <div className="relative flex flex-col items-center mt-[-20vh]" style={{animation: 'zoomIn 2s ease-out forwards'}}>
                            <div className="text-[120px] mb-[-40px] z-10 animate-bounce" style={{textShadow: '0 0 50px rgba(255,215,0,1)'}}>??</div>
                            <div className="w-[300px] h-[300px] rounded-full overflow-hidden border-8 border-yellow-500 shadow-[0_0_150px_rgba(255,215,0,1)] z-0 relative bg-black">
                                <img src={\`https://flagcdn.com/w640/\${gameState.winner?.iso}.png\`} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        
                        <div className="absolute bottom-0 w-full h-[50vh] overflow-hidden pointer-events-none" style={{ maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }}>
                            <div className="absolute w-full flex flex-col items-center gap-10 text-center" style={{animation: 'scrollUp 15s linear infinite'}}>
                                <h2 className="text-5xl font-black text-yellow-500 mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">HALL OF FAME</h2>
                                <div className="text-3xl text-white font-bold drop-shadow-md">?? Ultimate Emperor<br/><span className="text-yellow-400 text-4xl">{gameState.winner?.name}</span></div>
                                {gameState.runnerUp && <div className="text-2xl text-gray-300 font-bold drop-shadow-md">?? Runner Up<br/><span className="text-gray-100 text-3xl">{gameState.runnerUp?.name}</span></div>}
                                {gameState.mostKills && <div className="text-2xl text-red-400 font-bold drop-shadow-md">?? Most Eliminations<br/><span className="text-red-200 text-3xl">{gameState.mostKills.name} ({gameState.mostKills.kills})</span></div>}
                            </div>
                        </div>

                        {/* Gold Confetti Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-[-1] opacity-50" style={{backgroundImage: 'radial-gradient(circle, transparent 20%, #000 120%), repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,215,0,0.1) 10px, rgba(255,215,0,0.1) 20px)'}}></div>
                    </>
                )}
            </div>
        )}
        </div>
        </button>
        </main>
    );
}`;

content = content.replace(targetRegex, (match) => {
    // Replace the end tags with our injected UI + end tags
    return match.replace(/<\/div>\s*<\/div>\s*<\/button>\s*<\/main>\s*\);\s*\}/, phase5UI);
});

fs.writeFileSync('page.tsx', content);
console.log("Phase 5 UI injected");
