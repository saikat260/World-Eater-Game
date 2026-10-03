const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const searchBlock = /\{\(\(\) => \{\s*const cols = Math\.min\(32, gameState\?\.totalInitial \|\| 32\);\s*const rows = Math\.ceil\(\(gameState\?\.totalInitial \|\| 1\) \/ cols\);\s*const itemWidth = `calc\(\(100% - \$\{\(cols - 1\) \* 2\}px\) \/ \$\{cols\}\)`;\s*return \(\s*<div className="w-full relative shrink-0" style=\{\{ aspectRatio: `\$\{cols\} \/ \$\{rows \* 0\.75\}` \}\}>\s*<div dir="rtl" className="absolute bottom-0 left-0 right-0 flex flex-wrap-reverse content-start w-full overflow-visible pr-1" style=\{\{ gap: '2px' \}\}>\s*\{gameState\?\.deadCountriesList\?\.filter\(iso => typeof iso === "string" && iso\.length >= 2\)\.map\(\(iso, idx\) => \(\s*<img\s*key=\{\`\$\{iso\}-\$\{idx\}\`\}\s*src=\{\`https:\/\/flagcdn\.com\/w20\/\$\{iso\}\.png\`\}\s*className="aspect-\[4\/3\] object-cover rounded-\[1px\] animate-in zoom-in duration-300 shadow-sm border border-white\/20 min-w-0"\s*style=\{\{ width: itemWidth \}\}\s*onError=\{\(e\) => \{ e\.currentTarget\.style\.display = "none"; \}\}\s*alt=\{iso\}\s*\/>\s*\)\)\}\s*<\/div>\s*<\/div>\s*\);\s*\}\)\(\)\}/m;

const replaceBlock = `{(() => {
    const maxCols = 32;
    const maxRows = 8;
    const cols = Math.max(4, Math.min(maxCols, gameState?.totalInitial || maxCols));
    const itemWidth = \`calc((100% - \${(cols - 1) * 2}px) / \${cols})\`;
    const flagRes = cols <= 8 ? 'w160' : 'w40';
    return (
        <div className="w-full relative shrink-0" style={{ aspectRatio: \`\${maxCols} / \${maxRows * 0.75}\` }}>
            <div dir="rtl" className="absolute bottom-0 left-0 right-0 flex flex-wrap-reverse content-start w-full overflow-visible pr-1" style={{ gap: '2px' }}>
                {gameState?.deadCountriesList?.filter(iso => typeof iso === "string" && iso.length >= 2).map((iso, idx) => (
                    <img 
                        key={\`\${iso}-\${idx}\`} 
                        src={\`https://flagcdn.com/\${flagRes}/\${iso}.png\`} 
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

if (content.match(searchBlock)) {
    content = content.replace(searchBlock, replaceBlock);
    fs.writeFileSync('page.tsx', content);
    console.log("Successfully replaced block.");
} else {
    console.log("Block not found.");
}
