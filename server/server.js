import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PhysicsEngine } from './physics.js';
import { loadState, saveState, resetTournament } from './state.js';
import fs from 'fs/promises';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

let ALL_COUNTRIES = [];

async function loadCountries() {
    const data = await fs.readFile('./countries.json', 'utf-8');
    const isos = JSON.parse(data);
    ALL_COUNTRIES = isos.map(iso => ({
        iso, name: iso.toUpperCase(), wins: 0
    }));
}

let engine = new PhysicsEngine();
let gameState = null;
let currentPhaseNum = 1;
let celebrationStartTime = 0;
let celebrationDuration = 180;
let lastPhase5Emit = 0;
let lastTick = Date.now();
let serverLoopInterval = null;
let isPlaying = false; let matchEnding = false;

async function initServer() {
    await loadCountries();
    gameState = await loadState();
    
    // Parse phase
    if (gameState.current_phase.includes("Phase 1")) currentPhaseNum = 1;
    else if (gameState.current_phase.includes("Phase 2")) currentPhaseNum = 2;
    else if (gameState.current_phase.includes("Phase 3")) currentPhaseNum = 3;
    else if (gameState.current_phase.includes("Phase 4")) currentPhaseNum = 4;
    else if (gameState.current_phase.includes("Phase 5")) currentPhaseNum = 5;

    startMatchLogic();

    io.on('connection', (socket) => {
        socket.emit('init', {
            match: gameState.current_match,
            phase: gameState.current_phase,
            totalMatches: 75
        });
        
        socket.on('reset-tournament', async () => { gameState = await resetTournament(); currentPhaseNum = 1; isPlaying = false; lastPhase5Emit = 0; engine.phaseTimer = 0; engine.tournamentTimer = 0; startMatchLogic(); }); socket.on('toggle-play', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                lastTick = Date.now(); // Prevent large dt
            }
        });
    });

    
    serverLoopInterval = setInterval(gameLoop, 1000 / 60);
    httpServer.listen(3002, () => console.log('Server running on port 3002'));
}

function startMatchLogic() {
    if (currentPhaseNum === 5) {
        celebrationStartTime = Date.now();
        return; // Handled in gameLoop now
    }

    let participants = [];
    if (currentPhaseNum === 1) {
        participants = ALL_COUNTRIES;
    } else {
        let uniqueWinners = Object.values(gameState.qualified_winners);
        if (currentPhaseNum === 2) {
            // Pick a slice for this match. For simplicity in this demo, just pick 8 random from winners
            participants = uniqueWinners.slice(0, 8); 
        } else if (currentPhaseNum === 3) {
            participants = uniqueWinners.slice(0, 4);
        } else if (currentPhaseNum === 4) {
            participants = uniqueWinners.slice(0, 2);
        }
    }

    engine.initMatch(participants, currentPhaseNum); matchEnding = false;
    lastTick = Date.now();
}

async function gameLoop() {
    if (currentPhaseNum === 5) {
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
    }

    let now = Date.now();
    let dt = (now - lastTick) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTick = now;

    if (isPlaying) {
        engine.update(dt);
        engine.events.forEach(evt => {
            if (evt.type === 'kill' && evt.killerIso) {
                gameState.total_kills = gameState.total_kills || {};
                gameState.total_kills[evt.killerIso] = (gameState.total_kills[evt.killerIso] || 0) + 1;
            }
        });
    }
    
    let stateData = engine.getState();
    let alive = stateData.countries;

    io.emit('state', {
        match: gameState.current_match,
        phaseName: gameState.current_phase,
        timer: stateData.timer,
        phaseTimer: stateData.phaseTimer,
          tournamentTimer: stateData.tournamentTimer,
        bounds: stateData.bounds,
        isInvincible: stateData.isInvincible,
        countries: alive,
        stardust: stateData.stardust,
        spikes: stateData.spikes,
        totalAlive: alive.length,
        totalInitial: engine.countries.length, deadCountriesList: stateData.deadCountriesList,
        qualified_winners: Object.values(gameState.qualified_winners),
        events: engine.events,
        isPaused: !isPlaying,
        isPlaying: isPlaying
    });
    engine.events = [];

    if (alive.length <= 1 && stateData.timer > 5 && !matchEnding) { matchEnding = true;
        let winner = alive[0] || { iso: 'unknown', name: 'NOBODY', wins: 0 };
        await handleMatchEnd(winner);
    }
}

async function handleMatchEnd(winner) {
    // Save winner
    if (!gameState.qualified_winners[winner.iso]) {
        gameState.qualified_winners[winner.iso] = { name: winner.name, iso: winner.iso, wins: 0 };
    }
    gameState.qualified_winners[winner.iso].wins += 1;
    gameState.current_match += 1;

    // Transitions
    if (gameState.current_match > 64 && currentPhaseNum === 1) {
        gameState.current_phase = "Phase 2: Quarter-Finals";
        currentPhaseNum = 2;
        engine.phaseTimer = 0; engine.tournamentTimer = 0;
    } else if (gameState.current_match > 72 && currentPhaseNum === 2) {
        gameState.current_phase = "Phase 3: Semi-Finals";
        currentPhaseNum = 3;
        engine.phaseTimer = 0; engine.tournamentTimer = 0;
    } else if (gameState.current_match > 74 && currentPhaseNum === 3) {
        gameState.current_phase = "Phase 4: Grand Final";
        currentPhaseNum = 4;
        engine.phaseTimer = 0; engine.tournamentTimer = 0;
    } else if (gameState.current_match > 75) {
        gameState.current_phase = "Phase 5: Celebration";
        currentPhaseNum = 5;
        engine.phaseTimer = 0; engine.tournamentTimer = 0;
    }

    await saveState(gameState);
    
    // Emit match-winner event for celebration overlay
    io.emit('match-winner', { iso: winner.iso, name: winner.name, phase: currentPhaseNum });

    // Brief pause before next match
    
    setTimeout(() => {
        startMatchLogic();
        
    }, 5000);
}

initServer();
