import fs from 'fs';
let content = fs.readFileSync('physics.js', 'utf8');

content = content.replace(
    /let numSpikes = phase === 1 \? 4 : \(phase === 2 \? 10 : 0\);/g,
    'let numSpikes = phase === 5 ? 0 : phase * 5;'
);

content = content.replace(
    /let stardustCount = phase === 1 \? 150 : \(phase === 2 \? 100 : 0\);/g, // Just in case it was 0 for phase 3
    'let stardustCount = phase === 5 ? 0 : Math.max(50, 150 - (phase * 30));' 
);

// If it's something else like 50, let's just make a generic replace
content = content.replace(
    /let stardustCount = .*/g,
    'let stardustCount = phase === 5 ? 0 : Math.max(50, 200 - (phase * 50));'
);

fs.writeFileSync('physics.js', content);
console.log("Updated physics.js successfully");
