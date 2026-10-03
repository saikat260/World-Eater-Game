import fs from 'fs';
let content = fs.readFileSync('server.js', 'utf8');

// 1. Add total_kills tracker
content = content.replace(/engine\.update\(dt\);/g, `engine.update(dt);
        engine.events.forEach(evt => {
            if (evt.type === 'kill' && evt.killerIso) {
                gameState.total_kills = gameState.total_kills || {};
                gameState.total_kills[evt.killerIso] = (gameState.total_kills[evt.killerIso] || 0) + 1;
            }
        });`);

// 2. Add celebration timer state in server.js
content = content.replace(/let currentPhaseNum = 1;/, 'let currentPhaseNum = 1;\nlet celebrationStartTime = 0;\nlet celebrationDuration = 180;');

// 3. Update startMatchLogic Phase 5 handler
const startMatchOld = /if \(currentPhaseNum === 5\) \{\s*setTimeout\(async \(\) => \{\s*gameState = await resetTournament\(\);\s*currentPhaseNum = 1;\s*startMatchLogic\(\);\s*\}, 180000\); \/\/ 3 mins celebration\s*return;\s*\}/;
const startMatchNew = `if (currentPhaseNum === 5) {
        celebrationStartTime = Date.now();
        return; // Handled in gameLoop now
    }`;
content = content.replace(startMatchOld, startMatchNew);

// 4. Update gameLoop Phase 5
const gameLoopOld = /if \(currentPhaseNum === 5\) \{\s*io\.emit\('state', \{ phase: 5, winner: Object\.values\(gameState\.qualified_winners\)\.pop\(\) \}\);\s*return;\s*\}/;
const gameLoopNew = `if (currentPhaseNum === 5) {
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
content = content.replace(gameLoopOld, gameLoopNew);

// 5. Clear total_kills on reset-tournament
content = content.replace(/engine\.tournamentTimer = 0;\s*engine\.events = \[\];/, 'engine.tournamentTimer = 0; engine.events = []; gameState.total_kills = {};');

fs.writeFileSync('server.js', content);
console.log("Updated server.js for epic celebration");
