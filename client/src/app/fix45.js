const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace the ? with stopwatch emoji
content = content.replace(
    /<span className="inline-block mx-1">\?<\/span>/,
    '<span className="inline-block mx-1">{String.fromCodePoint(0x23F1)}</span>'
);

fs.writeFileSync('page.tsx', content);
console.log("Fixed stopwatch emoji");
