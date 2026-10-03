const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const mainMatch = content.match(/<main[^>]*>/);
if (mainMatch) {
    const mainStart = mainMatch.index + mainMatch[0].length;
    
    // Add reset button inside <main> but outside the container
    const resetButton = `
    <button 
        onClick={() => { if(confirm('Are you sure you want to reset the entire tournament?')) socketRef.current?.emit('reset-tournament'); }}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded shadow-lg text-sm transition-all"
    >
        RESET TOURNAMENT
    </button>
    `;
    
    content = content.substring(0, mainStart) + resetButton + content.substring(mainStart);
    fs.writeFileSync('page.tsx', content);
    console.log("Added reset button");
} else {
    console.log("Could not find <main> tag");
}
