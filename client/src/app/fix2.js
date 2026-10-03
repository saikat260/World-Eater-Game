const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Fix the victory overlay (lost in revert)
content = content.replace('bg-black/80', 'bg-black/30 pointer-events-none');
content = content.replace('max-h-32 max-w-[80%] object-contain rounded-xl', 'h-32 w-auto object-contain rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.5)]');
content = content.replace('mt-8 text-5xl font-black text-white uppercase drop-shadow-md animate-pulse text-center px-4 leading-tight break-words w-full max-w-[95%]', 'mt-6 text-4xl font-black text-white uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-pulse text-center px-4 leading-tight break-words');

// 2. Replace the footer UI
const startIdx = content.indexOf('<div className="h-[15%] w-full bg-black/95');
const endStr = '</div>\n                </div>';
const endIdx = content.indexOf(endStr, startIdx) + endStr.length;

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

content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
fs.writeFileSync('page.tsx', content);
