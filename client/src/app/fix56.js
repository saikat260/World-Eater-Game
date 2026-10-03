const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Remove the bad early return block
content = content.replace(/\s*\/\/ Ensure cleanup on unmount\s*return \(\) => \{\s*audio\.cleanup\(\);\s*window\.removeEventListener\('click', initAudio\);\s*window\.removeEventListener\('keydown', initAudio\);\s*\};/m, '');

// Update the final return block
content = content.replace(/return \(\) => socket\.disconnect\(\);/, `return () => {
            audio.cleanup();
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
            socket.disconnect();
        };`);

fs.writeFileSync('page.tsx', content);
console.log("Fixed useEffect early return bug");
