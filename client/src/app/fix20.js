const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Find the grid container block and replace it
const searchBlock = /<div dir="rtl" className="grid gap-\[2px\] w-full h-full content-start overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-white\/20" style={{ gridTemplateColumns: `repeat\(\$\{Math\.min\(32, gameState\?\.totalInitial \|\| 32\)\}, minmax\(0, 1fr\)\)` }}>\s*\{gameState\?\.deadCountriesList\?\.filter\(iso => typeof iso === "string" && iso\.length >= 2\)\.map\(\(iso, idx\) => \(\s*<img\s*key=\{\`\$\{iso\}-\$\{idx\}\`\}\s*src=\{\`https:\/\/flagcdn\.com\/w20\/\$\{iso\}\.png\`\}\s*className="w-full aspect-\[4\/3\] object-cover rounded-\[1px\] animate-in zoom-in duration-300 shadow-sm border border-white\/20 min-w-0" onError=\{\(e\) => \{ e\.currentTarget\.style\.display = "none"; \}\}\s*alt=\{iso\}\s*\/>\s*\)\)\}\s*<\/div>/m;

const replaceBlock = `{(() => {
    const cols = Math.min(32, gameState?.totalInitial || 32);
    const rows = Math.ceil((gameState?.totalInitial || 1) / cols);
    const itemWidth = \`calc((100% - \${(cols - 1) * 2}px) / \${cols})\`;
    return (
        <div className="w-full relative shrink-0" style={{ aspectRatio: \`\${cols} / \${rows * 0.75}\` }}>
            <div dir="rtl" className="absolute bottom-0 left-0 right-0 flex flex-wrap-reverse content-start w-full overflow-visible pr-1" style={{ gap: '2px' }}>
                {gameState?.deadCountriesList?.filter(iso => typeof iso === "string" && iso.length >= 2).map((iso, idx) => (
                    <img 
                        key={\`\${iso}-\${idx}\`} 
                        src={\`https://flagcdn.com/w20/\${iso}.png\`} 
                        className="aspect-[4/3] object-cover rounded-[1px] animate-in zoom-in duration-300 shadow-sm border border-white/20 min-w-0" 
                        style={{ width: itemWidth }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }} 
                        alt={iso}
                    />
                ))}
            </div>
        </div>
    );
})()}`;

if(content.match(searchBlock)) {
    content = content.replace(searchBlock, replaceBlock);
    fs.writeFileSync('page.tsx', content);
    console.log("Successfully replaced block.");
} else {
    console.log("Block not found. Please check regex.");
}
