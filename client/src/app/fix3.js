const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace('bg-black/80', 'bg-black/30 pointer-events-none');
content = content.replace('max-h-48 max-w-[80vw] object-contain rounded-xl', 'h-32 w-auto object-contain rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.5)]');
content = content.replace('mt-8 text-5xl font-black text-white uppercase drop-shadow-md animate-pulse text-center px-4 leading-tight break-words max-w-[90vw]', 'mt-6 text-4xl font-black text-white uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-pulse text-center px-4 leading-tight break-words');

const oldBlock = `<div className="h-[15%] w-full bg-black/95 border-t-2 border-[#ff003c] p-3 flex flex-col z-10 absolute bottom-0 left-0 shadow-[0_-5px_20px_rgba(255,0,60,0.3)]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-[#ffaa00]">ALIVE: {gameState?.totalAlive || 0} / {gameState?.totalInitial || 0} FLAGS</span>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <div className="grid grid-cols-16 gap-[2px] opacity-80" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                            {ALL_ISOS.map(iso => {
                                const isAlive = gameState?.countries?.some((c:any) => c.iso === iso);
                                return (
                                    <div key={iso} className="relative w-4 h-3">
                                        <img 
                                          src={\`https://flagcdn.com/w20/\${iso}.png\`} 
                                          alt={iso} 
                                          className={\`w-full h-full object-cover transition-all \${!isAlive ? 'grayscale opacity-30' : ''}\`}
                                        />
                                        {!isAlive && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-[10px]">X</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
  
                    <div className="text-center mt-2">
                        <div className="inline-block bg-[#ff003c]/20 border border-[#ff003c] text-[#ff003c] px-4 py-1 rounded-full text-xs font-bold tracking-widest" style={{ textShadow: '0 0 5px #ff003c' }}>
                            ?? @YourChannelName ??
                        </div>
                    </div>
                </div>`;

const newBlock = `<div className="h-[15%] w-full bg-black/95 border-t-2 border-[#ffaa00] p-3 flex flex-col items-center justify-start z-10 absolute bottom-0 left-0 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-2">
                    {/* Progress Bar Container */}
                    <div className="w-[95%] h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10 shadow-inner mt-1">
                        <div 
                            className="h-full bg-red-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,0,0,0.8)]" 
                            style={{ width: \`\${gameState ? ((gameState.deadCountriesList?.length || 0) / (gameState.totalInitial || 1)) * 100 : 0}%\` }}
                        ></div>
                    </div>
                
                    {/* Text */}
                    <div className="text-sm font-black text-white tracking-widest drop-shadow-md">
                        {gameState?.totalAlive || 0} / {gameState?.totalInitial || 0} FLAGS
                    </div>
                    
                    {/* Dead Flags Flex Grid */}
                    <div className="w-[95%] flex-1 overflow-hidden relative mt-1">
                        <div className="flex flex-wrap justify-start gap-[3px] content-start w-full h-full overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white/20">
                            {gameState?.deadCountriesList?.map((iso, idx) => (
                                <img 
                                    key={\`\${iso}-\${idx}\`} 
                                    src={\`https://flagcdn.com/w20/\${iso}.png\`} 
                                    className="w-[18px] h-[13px] object-cover rounded-[1px] animate-in zoom-in duration-300 shadow-sm border border-white/20" 
                                    alt={iso}
                                />
                            ))}
                        </div>
                    </div>
                </div>`;

// Replace ignoring precise emoji byte sequences by just using indexOf logic or replacing everything from start of the block to the end of the block
const startIdx = content.indexOf('<div className="h-[15%] w-full bg-black/95');
const matchWinnerIdx = content.indexOf('export default function Home() {');
const footerEndIdx = content.lastIndexOf('</div>', matchWinnerIdx) + 6;

if(startIdx !== -1) {
    let before = content.substring(0, startIdx);
    // Find the end of the footer block. The footer block ends right before </div>\n           </div>\n        </main>
    const mainEndIdx = content.indexOf('</main>');
    const footerEnd = content.lastIndexOf('</div>', content.lastIndexOf('</div>', content.lastIndexOf('</div>', mainEndIdx - 1) - 1) - 1) + 6;
    let after = content.substring(footerEnd);
    content = before + newBlock + after;
}

fs.writeFileSync('page.tsx', content);
console.log("Success");
