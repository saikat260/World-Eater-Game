const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const formatTimeFunc = `
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return \`\${m}:\${s < 10 ? '0' : ''}\${s}\`;
};
`;

content = content.replace(
    /export default function Home\(\) \{/,
    formatTimeFunc + '\nexport default function Home() {'
);

fs.writeFileSync('page.tsx', content);
console.log("Added formatTime function");
