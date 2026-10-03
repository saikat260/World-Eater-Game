const fs = require('fs');

let content = fs.readFileSync('page.tsx', 'utf-8');

const injection = `
                    {gameState?.phase === 5 && (
                        <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
                            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 mb-2 tracking-[0.2em] animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">TOURNAMENT CHAMPION</h1>
                            
                            {gameState?.winner && (
                                <div className="flex flex-col items-center mb-8 transform hover:scale-105 transition-transform mt-8">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-yellow-500/30 blur-xl rounded-full animate-pulse"></div>
                                        <img src={\`https://flagcdn.com/w320/\${gameState.winner.iso}.png\`} className="w-48 h-auto object-cover rounded-xl shadow-[0_0_40px_rgba(255,215,0,0.6)] border-4 border-yellow-500/50 relative z-10" />
                                        <div className="absolute -top-6 -right-6 text-6xl drop-shadow-lg z-20 animate-bounce">👑</div>
                                    </div>
                                    <h2 className="text-4xl font-black text-white mt-6 tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)] text-center">
                                        {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(gameState.winner.iso.toUpperCase()); } catch(e) { return gameState.winner.name; } })()}
                                    </h2>
                                </div>
                            )}

                            <div className="flex w-full max-w-md justify-between items-stretch gap-6 mt-4">
                                {gameState?.runnerUp && (
                                    <div className="flex flex-col items-center flex-1 bg-gradient-to-b from-gray-800/80 to-transparent p-4 rounded-2xl border border-gray-600/30 justify-between">
                                        <h3 className="text-gray-300 font-bold text-xs tracking-widest mb-3">🥈 RUNNER UP</h3>
                                        <img src={\`https://flagcdn.com/w160/\${gameState.runnerUp.iso}.png\`} className="w-24 h-auto rounded-lg shadow-lg mb-2" />
                                        <span className="text-gray-100 font-bold mt-auto text-center uppercase text-xs">
                                            {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(gameState.runnerUp.iso.toUpperCase()); } catch(e) { return gameState.runnerUp.name; } })()}
                                        </span>
                                    </div>
                                )}
                                
                                {gameState?.mostKills && (
                                    <div className="flex flex-col items-center flex-1 bg-gradient-to-b from-red-900/80 to-transparent p-4 rounded-2xl border border-red-500/30 justify-between">
                                        <h3 className="text-red-400 font-bold text-xs tracking-widest mb-3">💀 MOST KILLS ({gameState.mostKills.kills})</h3>
                                        <img src={\`https://flagcdn.com/w160/\${gameState.mostKills.iso}.png\`} className="w-24 h-auto rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.5)] mb-2" />
                                        <span className="text-red-100 font-bold mt-auto text-center uppercase text-xs">
                                            {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(gameState.mostKills.iso.toUpperCase()); } catch(e) { return gameState.mostKills.name; } })()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-8 text-center">
                                <div className="text-gray-400 text-[10px] font-bold tracking-[0.3em] mb-1">NEW TOURNAMENT IN</div>
                                <div className="text-2xl font-black text-white tabular-nums tracking-widest">{formatTime(gameState?.countdown || 0)}</div>
                            </div>
                        </div>
                    )}
`;

const anchor = "{gameState?.isPaused && !matchWinner && (";

if (!content.includes(anchor)) {
    console.error("Anchor not found!");
    process.exit(1);
}

if (!content.includes("TOURNAMENT CHAMPION")) {
    content = content.replace(anchor, injection + "\\n" + anchor);
    fs.writeFileSync('page.tsx', content);
    console.log("Injected Phase 5 Overlay!");
} else {
    console.log("Already injected.");
}
