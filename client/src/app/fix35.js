const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const emptyStateCheck = `
                <div className="flex flex-col w-full">
                    {recentWinners.length === 0 ? (
                        <div className="text-white/50 text-center text-[10px] py-2 italic">Awaiting first result...</div>
                    ) : (
                        recentWinners.map((winner, i) => (
`;

content = content.replace(
    /<div className="flex flex-col w-full">\s*\{recentWinners\.map\(\(winner, i\) => \(/,
    emptyStateCheck
);
content = content.replace(
    /\)\)\}\s*<\/div>/,
    '))}\n                    )}\n                </div>'
);

fs.writeFileSync('page.tsx', content);
console.log("Added empty state to leaderboard");
