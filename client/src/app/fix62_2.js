const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Inside Home component:
// 1. We need a ref for TTS
const homeTop = /const canvasRef = useRef<HTMLCanvasElement>\(null\);/;
if (!content.includes('hasSpokenTTS')) {
    content = content.replace(homeTop, `const canvasRef = useRef<HTMLCanvasElement>(null);\n    const hasSpokenTTS = useRef(false);`);
}

// 2. Update socket.on('state')
const socketStateRegex = /socket\.on\('state', \(state\) => \{\s*if \(state\.phase === 5\) \{[\s\S]*?setGameState\(state\);\s*\}/;
const newSocketState = `socket.on('state', (state) => {
            setGameState(state);
            
            // Audio transitions
            if (state.match >= 75) {
                audio.crossfadeToFinal();
            } else if (state.match === 1 && state.phase !== 5) {
                audio.crossfadeToNormal();
            }

            if (state.phase === 5) {
                if (!hasSpokenTTS.current && state.winner) {
                    hasSpokenTTS.current = true;
                    const msg = new SpeechSynthesisUtterance(\`The Tournament is over! \${state.winner.name} has conquered the world and is the Ultimate Emperor!\`);
                    msg.volume = 1;
                    msg.rate = 1.1;
                    msg.pitch = 0.9;
                    window.speechSynthesis.speak(msg);
                }
            } else {
                hasSpokenTTS.current = false;
            }
`;
content = content.replace(socketStateRegex, newSocketState);

fs.writeFileSync('page.tsx', content);
console.log("Socket state updated");
