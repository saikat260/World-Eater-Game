import fs from 'fs';

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Ensure lastUiUpdateRef is declared
if (!content.includes('lastUiUpdateRef')) {
    content = content.replace(
        'const physicsStateRef = useRef<any>(null);',
        'const physicsStateRef = useRef<any>(null);\r\n    const lastUiUpdateRef = useRef(0);'
    );
}

// Replace the setGameState block inside socket.on('state')
const oldBlockRegex = /socket\.on\('state',\s*\(state\)\s*=>\s*\{[\s\S]*?setGameState\(\(prev:\s*any\)\s*=>\s*\{[\s\S]*?return prev;\s*\}\);/;

const newBlock = `socket.on('state', (state) => {
            // Refactor #1: Always update fast mutable ref (60 FPS Canvas rendering)
            physicsStateRef.current = state;
            
            // Smart React UI update:
            // - Instant: pause/play toggle, match/phase change, kill events
            // - Throttled: 4 FPS (250ms) for timers and counters
            setGameState((prev: any) => {
                const now = Date.now();
                if (
                    !prev ||
                    prev.isPaused !== state.isPaused ||
                    prev.isPlaying !== state.isPlaying ||
                    prev.match !== state.match ||
                    prev.phaseName !== state.phaseName ||
                    prev.phase !== state.phase ||
                    prev.countdown !== state.countdown ||
                    (state.events && state.events.some((evt: any) => evt.type === 'kill')) ||
                    (now - (lastUiUpdateRef.current || 0)) >= 250
                ) {
                    lastUiUpdateRef.current = now;
                    return state;
                }
                return prev;
            });`;

content = content.replace(oldBlockRegex, newBlock);

fs.writeFileSync('src/app/page.tsx', content);
console.log('page.tsx setGameState successfully fixed!');
