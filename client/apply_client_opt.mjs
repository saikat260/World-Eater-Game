import fs from 'fs';

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add lastUiUpdateRef in Home()
content = content.replace(
    'const physicsStateRef = useRef<any>(null);\r\n    const [gameState, setGameState] = useState<any>(null);',
    'const physicsStateRef = useRef<any>(null);\r\n    const lastUiUpdateRef = useRef(0);\r\n    const [gameState, setGameState] = useState<any>(null);'
);

// 2. Smart UI React state throttling in socket.on('state')
const oldSocketState = `        socket.on('state', (state) => {
            // Refactor #1: Always update fast mutable ref (no re-render)
            physicsStateRef.current = state;
            // Only trigger React re-render when UI-relevant data changes
            setGameState((prev: any) => {
                if (!prev || prev.phase !== state.phase || prev.match !== state.match ||
                    prev.isPlaying !== state.isPlaying || prev.countdown !== state.countdown) {
                    return state;
                }
                return prev;
            });`;

const newSocketState = `        socket.on('state', (state) => {
            // Refactor #1: Always update fast mutable ref (60 FPS Canvas rendering)
            physicsStateRef.current = state;

            // Enterprise React UI Throttling:
            // Instant priority updates: kills (dead flags drop immediately), phase/match/pause changes
            // Throttled updates: timers and counters update every 250ms (4 FPS, saves 93% React overhead)
            const now = Date.now();
            const hasKill = state.events?.some((evt: any) => evt.type === 'kill');
            const isPriority = !gameState ||
                gameState.phase !== state.phase ||
                gameState.match !== state.match ||
                gameState.isPaused !== state.isPaused ||
                gameState.isPlaying !== state.isPlaying ||
                state.countdown !== undefined;
            const isThrottleTick = (now - lastUiUpdateRef.current) >= 250;

            if (isPriority || hasKill || isThrottleTick) {
                lastUiUpdateRef.current = now;
                setGameState(state);
            }`;

content = content.replace(oldSocketState, newSocketState);

// 3. Fix #8: Remove client [...state.countries].sort() since server pre-sorts ascending by radius
content = content.replace(
    '        const sortedCountries = [...(state.countries || [])].sort((a,b) => a.radius - b.radius);\r\n        const now = Date.now();',
    '        // Fix #8: Server already pre-sorts ascending by radius; direct reference with 0 allocation\r\n        const sortedCountries = state.countries || [];\r\n        const now = Date.now();\r\n        let lastFontSize = -1;'
);

// 4. Fix #9: Cache font changes to prevent GPU canvas state thrashing
const oldFontBlock = `            if (c.radius > 30 || state.totalAlive < 20) {
                ctx.fillStyle = '#ffffff';
                ctx.font = \`bold \${Math.max(14, c.radius * 0.25)}px sans-serif\`;
                ctx.textAlign = 'center';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(c.name, c.x, c.y);
                ctx.fillText(c.name, c.x, c.y);
            }`;

const newFontBlock = `            if (c.radius > 30 || state.totalAlive < 20) {
                const fontSize = Math.max(14, Math.round(c.radius * 0.25));
                if (fontSize !== lastFontSize) {
                    ctx.font = \`bold \${fontSize}px sans-serif\`;
                    lastFontSize = fontSize;
                }
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(c.name, c.x, c.y);
                ctx.fillText(c.name, c.x, c.y);
            }`;

content = content.replace(oldFontBlock, newFontBlock);

fs.writeFileSync('src/app/page.tsx', content);
console.log('page.tsx successfully updated with Fix #8, Fix #9, and Smart UI Throttling');
