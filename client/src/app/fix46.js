const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const paginationEffect = `
    useEffect(() => {
        const interval = setInterval(() => {
            setLeaderboardPage(p => p + 1);
        }, 3000); // paginate every 3 seconds
        return () => clearInterval(interval);
    }, []);
`;

content = content.replace(
    /const confettiRef = useRef<any\[\]>\(\[\]\);/,
    'const confettiRef = useRef<any[]>([]);\n' + paginationEffect
);

fs.writeFileSync('page.tsx', content);
console.log("Added pagination setInterval");
