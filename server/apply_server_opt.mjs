import fs from 'fs';

let content = fs.readFileSync('server.js', 'utf8');

// Declare lastPhase5Emit
content = content.replace(
    'let celebrationStartTime = 0;\r\nlet celebrationDuration = 180;',
    'let celebrationStartTime = 0;\r\nlet celebrationDuration = 180;\r\nlet lastPhase5Emit = 0;'
);

// Reset lastPhase5Emit in reset-tournament
content = content.replace(
    "currentPhaseNum = 1; isPlaying = false; engine.phaseTimer = 0; engine.tournamentTimer = 0; startMatchLogic();",
    "currentPhaseNum = 1; isPlaying = false; lastPhase5Emit = 0; engine.phaseTimer = 0; engine.tournamentTimer = 0; startMatchLogic();"
);

// In startMatchLogic
content = content.replace(
    '    if (currentPhaseNum === 5) {\r\n        celebrationStartTime = Date.now();\r\n        return; // Handled in gameLoop now\r\n    }',
    '    if (currentPhaseNum === 5) {\r\n        celebrationStartTime = Date.now();\r\n        lastPhase5Emit = 0;\r\n        return; // Handled in gameLoop now\r\n    }'
);

// In gameLoop
const oldPhase5 = `    if (currentPhaseNum === 5) {
        let elapsed = (Date.now() - celebrationStartTime) / 1000;
        let remaining = Math.max(0, celebrationDuration - elapsed);
        
        let allWinners = Object.values(gameState.qualified_winners);
        let winner = allWinners.length > 0 ? allWinners[allWinners.length - 1] : null;
        let runnerUp = allWinners.length > 1 ? allWinners[allWinners.length - 2] : null;
        
        let mostKills = { iso: '', name: '', kills: 0 };
        if (gameState.total_kills) {
            for (const [iso, kills] of Object.entries(gameState.total_kills)) {
                if (kills > mostKills.kills) {
                    // Try to find name from ALL_COUNTRIES
                    let cname = iso;
                    if (typeof ALL_COUNTRIES !== 'undefined') {
                        let c = ALL_COUNTRIES.find(x => x.iso === iso);
                        if (c) cname = c.name;
                    }
                    mostKills = { iso, name: cname, kills };
                }
            }
        }

        io.emit('state', { 
            phase: 5, 
            winner: winner,
            runnerUp: runnerUp,
            mostKills: mostKills,
            countdown: remaining
        });

        if (remaining <= 0) {
            currentPhaseNum = 1;
            resetTournament().then(s => {
                gameState = s;
                startMatchLogic();
            });
        }
        return;
    }`;

const newPhase5 = `    if (currentPhaseNum === 5) {
        let elapsed = (Date.now() - celebrationStartTime) / 1000;
        let remaining = Math.max(0, celebrationDuration - elapsed);

        // Edge case: check reboot condition every tick with 0 latency
        if (remaining <= 0) {
            currentPhaseNum = 1;
            lastPhase5Emit = 0;
            resetTournament().then(s => {
                gameState = s;
                startMatchLogic();
            });
            return;
        }
        
        // Fix #6: Throttle Phase 5 socket emit to 1 FPS (every 1000ms)
        let nowTick = Date.now();
        if (nowTick - lastPhase5Emit < 1000) {
            return;
        }
        lastPhase5Emit = nowTick;
        
        let allWinners = Object.values(gameState.qualified_winners);
        let winner = allWinners.length > 0 ? allWinners[allWinners.length - 1] : null;
        let runnerUp = allWinners.length > 1 ? allWinners[allWinners.length - 2] : null;
        
        let mostKills = { iso: '', name: '', kills: 0 };
        if (gameState.total_kills) {
            for (const [iso, kills] of Object.entries(gameState.total_kills)) {
                if (kills > mostKills.kills) {
                    let cname = iso;
                    if (typeof ALL_COUNTRIES !== 'undefined') {
                        let c = ALL_COUNTRIES.find(x => x.iso === iso);
                        if (c) cname = c.name;
                    }
                    mostKills = { iso, name: cname, kills };
                }
            }
        }

        io.emit('state', { 
            phase: 5, 
            winner: winner,
            runnerUp: runnerUp,
            mostKills: mostKills,
            countdown: remaining
        });
        return;
    }`;

content = content.replace(oldPhase5, newPhase5);

fs.writeFileSync('server.js', content);
console.log('server.js updated with Fix #6 (Phase 5 throttle)');
