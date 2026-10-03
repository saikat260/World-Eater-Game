const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const mainStart = content.indexOf('<main');
const mainEnd = content.indexOf('</main>') + 7;

if (mainStart !== -1 && mainEnd !== -1) {
    let before = content.substring(0, mainStart);
    let after = content.substring(mainEnd);
    
    // We will replace the entire <main> block
    let newMain = `<main className="w-full h-screen bg-black flex justify-center items-center overflow-hidden text-white font-sans">
             <div className="relative w-full max-w-[56.25vh] h-[100vh] bg-[#0F0F1A] border-2 border-[#1a1a2e] flex flex-col justify-start">
                 
                 {/* Top HUD */}
                 <div className="w-full flex flex-col p-4 z-10 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0">
                      <div className="text-center font-bold text-xl text-[#00f2fe] tracking-wider mb-2" style={{ textShadow: '0 0 10px #00f2fe' }}>
                          {gameState?.phaseName?.toUpperCase() || 'LOADING...'} | {Math.floor((gameState?.timer || 0) / 60).toString().padStart(2, '0')}:{(Math.floor(gameState?.timer || 0) % 60).toString().padStart(2, '0')}
                      </div>
                 </div>
                 
                 {/* Canvas Container */}
                 <div className="w-full aspect-[3/4] relative shrink-0 mt-[15%]">
                    <canvas ref={canvasRef} width={1080} height={1440} className="w-full h-full block" style={{ touchAction: 'none' }} />
                    
                    {matchWinner && (<div className="absolute inset-0 z-50 bg-black/30 pointer-events-none flex flex-col items-center justify-center animate-in fade-in duration-500"><h1 className="text-6xl font-bold text-[#ffaa00] mb-8 tracking-widest drop-shadow-[0_0_20px_rgba(255,170,0,0.8)] animate-bounce">VICTORY!</h1><div className="relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.5)] transform hover:scale-110 transition-transform animate-in slide-in-from-bottom-24 duration-700 flex justify-center items-center"><img src={\`https://flagcdn.com/w320/\${matchWinner.iso}.png\`} className="h-32 w-auto object-contain rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.5)]" /></div><h2 className="mt-6 text-4xl font-black text-white uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-pulse text-center px-4 leading-tight break-words">{(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(matchWinner.iso.toUpperCase()); } catch(e) { return matchWinner.name; } })()}</h2></div>)}
                    {gameState?.isPaused && !matchWinner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                            <button 
                                onClick={() => socketRef.current?.emit('toggle-play')}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-6 px-12 rounded-full text-4xl shadow-[0_0_30px_rgba(255,0,0,0.8)] transition-all hover:scale-110"
                            >
                                START GAME
                            </button>
                        </div>
                    )}
                 </div>

                 {/* Footer Area */}
                 <div className="flex-1 w-full bg-black/95 border-t-2 border-[#ffaa00] p-2 flex flex-col items-center justify-start z-10 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-1">
                      {/* Progress Bar Container */}
                      <div className="w-[95%] h-1 bg-gray-800 rounded-full overflow-hidden border border-white/10 shadow-inner mt-1">
                          <div 
                              className="h-full bg-red-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,0,0,0.8)]" 
                              style={{ width: \`\${gameState ? ((gameState.deadCountriesList?.length || 0) / (gameState.totalInitial || 1)) * 100 : 0}%\` }}
                          ></div>
                      </div>
                  
                      {/* Text */}
                      <div className="text-[10px] font-black text-white tracking-widest drop-shadow-md">
                          {gameState?.totalAlive || 0} / {gameState?.totalInitial || 0} FLAGS
                      </div>
                      
                      {/* Dead Flags Flex Grid */}
                      <div className="w-[95%] flex-1 overflow-hidden relative mt-1">
                          <div className="grid gap-[2px] w-full content-start overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white/20" style={{ gridTemplateColumns: 'repeat(32, minmax(0, 1fr))' }}>
                              {gameState?.deadCountriesList?.map((iso, idx) => (
                                  <img 
                                      key={\`\${iso}-\${idx}\`} 
                                      src={\`https://flagcdn.com/w20/\${iso}.png\`} 
                                      className="w-full aspect-[4/3] object-cover rounded-[1px] animate-in zoom-in duration-300 shadow-sm border border-white/20" 
                                      alt={iso}
                                  />
                              ))}
                          </div>
                      </div>
                 </div>
             </div>
        </main>`;

    content = before + newMain + after;
    fs.writeFileSync('page.tsx', content);
    console.log("Success");
} else {
    console.log("Failed to find main tags");
}
