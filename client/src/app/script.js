const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const startIdx = content.indexOf('<div className="h-[15%] w-full bg-black/95');
const endStr = '</div>\n                </div>';
const endIdx = content.indexOf(endStr, startIdx) + endStr.length;

const newBlock = \<div className="h-[15%] w-full bg-black/95 border-t-2 border-[#ffaa00] p-3 flex flex-col items-center justify-start z-10 absolute bottom-0 left-0 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-2">
                    {/* Progress Bar Container */}
                    <div className="w-[95%] h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10 shadow-inner mt-1">
                        <div 
                            className="h-full bg-red-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,0,0,0.8)]" 
                            style={{ width: \\\\%\ }}
                        ></div>
                    </div>
                
                    {/* Text */}
                    <div className="text-sm font-black text-white tracking-widest drop-shadow-md">
                        {gameState?.totalAlive || 0} / {gameState?.totalInitial || 0} FLAGS
                    </div>
                    
                    {/* Dead Flags Flex Grid */}
                    <div className="w-[95%] flex-1 overflow-hidden relative mt-1">
                        <div className="flex flex-wrap justify-start gap-[3px] content-start w-full h-full">
                            {gameState?.deadCountriesList?.map((iso, idx) => (
                                <img 
                                    key={\\\\-\\\\} 
                                    src={\\\https://flagcdn.com/w20/\.png\\\} 
                                    className="w-[18px] h-[13px] object-cover rounded-[1px] animate-in zoom-in duration-300 shadow-sm border border-white/20" 
                                    alt={iso}
                                />
                            ))}
                        </div>
                    </div>
                </div>\;

content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
fs.writeFileSync('page.tsx', content);
