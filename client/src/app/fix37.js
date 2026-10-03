const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Add a simple fade-in animation class to the list container
content = content.replace(
    /<div className="flex flex-col w-full">/,
    '<div key={safePage} className="flex flex-col w-full animate-[fadeIn_0.5s_ease-in-out]">'
);

fs.writeFileSync('page.tsx', content);

let cssContent = fs.readFileSync('globals.css', 'utf8');
if (!cssContent.includes('@keyframes fadeIn')) {
    cssContent += '\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(5px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n';
    fs.writeFileSync('globals.css', cssContent);
}

console.log("Added fade-in animation");
