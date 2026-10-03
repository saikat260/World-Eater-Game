const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

content = content.replace(
    /if \(phaseNumber < 5 && currentWinners\.length > 0\) \{/g,
    'if (phaseNumber < 5) {'
);

fs.writeFileSync('page.tsx', content);
console.log("Updated page.tsx to always show leaderboard");
