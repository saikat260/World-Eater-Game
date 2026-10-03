import fs from 'fs';
let content = fs.readFileSync('server.js', 'utf8');

// Emit phaseTimer in io.emit('state')
content = content.replace(
    /timer: stateData\.timer,/g,
    'timer: stateData.timer,\n        phaseTimer: stateData.phaseTimer,'
);

// Reset tournament
content = content.replace(
    /gameState = await resetTournament\(\); currentPhaseNum = 1; isPlaying = false; startMatchLogic\(\);/g,
    'gameState = await resetTournament(); currentPhaseNum = 1; isPlaying = false; engine.phaseTimer = 0; startMatchLogic();'
);

// Phase transitions
const transitions = [
    'gameState.current_phase = "Phase 2: Quarter-Finals";\n        currentPhaseNum = 2;',
    'gameState.current_phase = "Phase 3: Semi-Finals";\n        currentPhaseNum = 3;',
    'gameState.current_phase = "Phase 4: Grand Final";\n        currentPhaseNum = 4;',
    'gameState.current_phase = "Phase 5: Celebration";\n        currentPhaseNum = 5;'
];

transitions.forEach((trans, i) => {
    // Note: Use a flexible regex to match the exact transitions if they might have different whitespace
    const regexStr = trans.replace(/\s+/g, '\\s*');
    const regex = new RegExp(regexStr, 'g');
    content = content.replace(regex, trans + '\n        engine.phaseTimer = 0;');
});

fs.writeFileSync('server.js', content);
console.log("Updated server.js with phaseTimer reset logic");
