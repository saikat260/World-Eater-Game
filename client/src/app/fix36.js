const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Inject the state
content = content.replace(
    /const \[matchWinner, setMatchWinner\] = useState<\{name: string, iso: string\} \| null>\(null\);/,
    'const [matchWinner, setMatchWinner] = useState<{name: string, iso: string} | null>(null);\n    const [leaderboardPage, setLeaderboardPage] = useState(0);'
);

// Inject the useEffect for auto-pagination
const paginationEffect = `
    useEffect(() => {
        const interval = setInterval(() => {
            setLeaderboardPage(p => p + 1);
        }, 3000); // paginate every 3 seconds
        return () => clearInterval(interval);
    }, []);
`;
content = content.replace(
    /useEffect\(\(\) => \{\n        const initAudio/,
    paginationEffect + '\n    useEffect(() => {\n        const initAudio'
);

// Update the leaderboard logic
const oldLogic = `const recentWinners = currentWinners.slice(-5);
    const startIndex = Math.max(0, currentWinners.length - 5);`;

const newLogic = `
    const rowsPerPage = 5;
    const totalPages = Math.ceil(currentWinners.length / rowsPerPage) || 1;
    // Auto-paginate safely
    const safePage = currentWinners.length > 0 ? (leaderboardPage % totalPages) : 0;
    const startIndex = safePage * rowsPerPage;
    const recentWinners = currentWinners.slice(startIndex, startIndex + rowsPerPage);
`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync('page.tsx', content);
console.log("Added leaderboard pagination logic");
