const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Update useState for matchWinner
content = content.replace(/useState<\{name: string, iso: string\} \| null>\(null\);/, "useState<{name: string, iso: string, phase?: number} | null>(null);");

// Update socket.on('match-winner')
const oldMatchWinnerListener = /socket\.on\('match-winner', \(winner\) => \{[\s\S]*?setTimeout\(\(\) => \{\s*setMatchWinner\(null\);\s*\}, 4500\);\s*\}\);/;
const newMatchWinnerListener = `socket.on('match-winner', (winner) => {
            setMatchWinner(winner);
            audio.playVictory();
            
            // TTS and UI logic for next round
            if (winner.phase && winner.phase < 4) {
                let nextRound = "the Next Round";
                if (winner.phase === 1) nextRound = "the Quarter-Final";
                if (winner.phase === 2) nextRound = "the Semi-Final";
                if (winner.phase === 3) nextRound = "the Grand Final";
                
                let cname = winner.name;
                try {
                    cname = new Intl.DisplayNames(["en"], { type: "region" }).of(winner.iso.toUpperCase()) || winner.name;
                } catch(e) {}

                const msg = new SpeechSynthesisUtterance(\`\${cname} is qualified for \${nextRound}!\`);
                msg.volume = 1;
                msg.rate = 1.1;
                msg.pitch = 0.9;
                window.speechSynthesis.speak(msg);
            }

            // Generate confetti
            const newConfetti = Array.from({length: 150}).map(() => ({
                x: Math.random() * 1080,
                y: -50 - Math.random() * 500, // starts above screen
                vx: (Math.random() - 0.5) * 15,
                vy: 5 + Math.random() * 15,
                color: ['#ffaa00', '#ff003c', '#00f2fe', '#00ffcc', '#ffffff'][Math.floor(Math.random() * 5)],
                size: 10 + Math.random() * 15,
            }));
            confettiRef.current = newConfetti;

            setTimeout(() => {
                setMatchWinner(null);
            }, 4500);
        });`;
content = content.replace(oldMatchWinnerListener, newMatchWinnerListener);

// Update matchWinner UI
const oldWinnerUI = /<h1 className="text-5xl font-bold text-\[#ffaa00\] mb-8 tracking-widest drop-shadow-\[0_0_20px_rgba\(255,170,0,0\.8\)\] animate-bounce">VICTORY!<\/h1>/;
const newWinnerUI = `<h1 className="text-5xl font-bold text-[#ffaa00] mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(255,170,0,0.8)] animate-bounce">VICTORY!</h1>
                        {matchWinner.phase && matchWinner.phase < 4 && (
                            <h2 className="text-2xl font-bold text-[#00f2fe] mb-8 tracking-widest drop-shadow-md text-center px-4 animate-pulse">
                                QUALIFIED FOR {matchWinner.phase === 1 ? 'QUARTER-FINAL' : matchWinner.phase === 2 ? 'SEMI-FINAL' : 'GRAND FINAL'}
                            </h2>
                        )}`;
content = content.replace(oldWinnerUI, newWinnerUI);

fs.writeFileSync('page.tsx', content);
console.log("page.tsx updated with TTS and UI for match qualifications");
