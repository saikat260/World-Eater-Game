import fs from 'fs';

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// ============================================================
// REFACTOR #1: Add physicsStateRef (decouple 60fps from React)
// ============================================================
content = content.replace(
    'const hasSpokenTTS = useRef(false);\r\n    const [gameState, setGameState] = useState<any>(null);',
    'const hasSpokenTTS = useRef(false);\r\n    // Refactor #1: physicsState mutable ref - ZERO React re-renders at 60fps\r\n    const physicsStateRef = useRef<any>(null);\r\n    const [gameState, setGameState] = useState<any>(null);'
);

// ============================================================
// REFACTOR #1 cont: socket.on(state) - write to ref, only 
//                   trigger React setState on phase/match changes
// ============================================================
content = content.replace(
    "        socket.on('state', (state) => {\r\n            setGameState(state);\r\n            ",
    "        socket.on('state', (state) => {\r\n            // Refactor #1: Always update fast mutable ref (no re-render)\r\n            physicsStateRef.current = state;\r\n            // Only trigger React re-render when UI-relevant data changes\r\n            setGameState((prev: any) => {\r\n                if (!prev || prev.phase !== state.phase || prev.match !== state.match ||\r\n                    prev.isPlaying !== state.isPlaying || prev.countdown !== state.countdown) {\r\n                    return state;\r\n                }\r\n                return prev;\r\n            });\r\n            "
);

// ============================================================
// REFACTOR #4: Remove rAF from inside socket.on
// ============================================================
content = content.replace(
    "\r\n            requestAnimationFrame(() => renderCanvas(state));\r\n        });\r\n\r\n        return () => {",
    "\r\n        });\r\n\r\n        // Refactor #4: Isolated rAF loop - renders from physicsStateRef,\r\n        //              completely independent of network/socket events\r\n        let animFrameId: number;\r\n        const renderLoop = () => {\r\n            if (physicsStateRef.current) {\r\n                renderCanvas(physicsStateRef.current);\r\n            }\r\n            animFrameId = requestAnimationFrame(renderLoop);\r\n        };\r\n        animFrameId = requestAnimationFrame(renderLoop);\r\n\r\n        return () => {"
);

// Cancel animFrameId in cleanup
content = content.replace(
    "        return () => {\r\n            audio.cleanup();\r\n            window.removeEventListener('click', initAudio);\r\n            window.removeEventListener('keydown', initAudio);\r\n            socket.disconnect();\r\n        };",
    "        return () => {\r\n            cancelAnimationFrame(animFrameId);\r\n            audio.cleanup();\r\n            window.removeEventListener('click', initAudio);\r\n            window.removeEventListener('keydown', initAudio);\r\n            socket.disconnect();\r\n        };"
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Refactors #1 and #4 applied to page.tsx');
