const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const regex = /<div key=\{safePage\} className="flex flex-col w-full animate-\[fadeIn_0\.5s_ease-in-out\]">[\s\S]*?(?=<\/div>\s*<\/div>\s*\);\s*\}\s*return null;)/;

const fixedJSX = `<div key={safePage} className="flex flex-col w-full animate-[fadeIn_0.5s_ease-in-out]">
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
                                    ? <span className="uppercase tracking-wider">QUALIFIED</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>`;

content = content.replace(regex, fixedJSX);

fs.writeFileSync('page.tsx', content);
console.log("Fixed JSX syntax error");
