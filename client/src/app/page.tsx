"use client";
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const ALL_ISOS = ["ad","ae","af","ag","al","am","ao","ar","at","au","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bn","bo","br","bs","bt","bw","by","bz","ca","cd","cf","cg","ch","ci","cl","cm","cn","co","cr","cu","cv","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","er","es","et","fi","fj","fm","fr","ga","gb","gd","ge","gh","gm","gn","gq","gr","gt","gw","gy","hn","hr","ht","hu","id","ie","il","in","iq","ir","is","it","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","me","mg","mh","mk","ml","mm","mn","mr","mt","mu","mv","mw","mx","my","mz","na","ne","ng","ni","nl","no","np","nr","nz","om","pa","pe","pg","ph","pk","pl","pt","pw","py","qa","ro","rs","ru","rw","sa","sb","sc","sd","se","sg","si","sk","sl","sm","sn","so","sr","ss","st","sv","sy","sz","td","tg","th","tj","tl","tm","tn","to","tr","tt","tv","tw","tz","ua","ug","us","uy","uz","vc","ve","vn","vu","ws","ye","za","zm","zw","hk","mo","pr","ps","aq","as","aw","ax","bl","bm","bq","bv","cc","ck","cw","cx","fk","fo","gf","gg","gi","gl","gp","gs","gu","hm","im","io","je","ky","mf","mp","mq","ms","nc","nf","nu","pf","pm","pn","re","sh","sj","tc","tf","tk","um","vg","vi","wf","yt","xk","va","eh","sx","ac"];

// Simple ASMR Sound Synthesizer using Web Audio API
class AudioSystem {
    ctx: AudioContext | null = null;
    masterCompressor: DynamicsCompressorNode | null = null;
    bgmBuffer: AudioBuffer | null = null;
    bgmSource: AudioBufferSourceNode | null = null;
    bgmGain: GainNode | null = null;
    bgmStarted: boolean = false;
    activeBGM: 'normal' | 'final' = 'normal';
    bgmFinalBuffer: AudioBuffer | null = null;
    bgmFinalSource: AudioBufferSourceNode | null = null;
    bgmFinalGain: GainNode | null = null;
    
    async loadBGM() {
        if (!this.ctx) return;
        try {
            const [res1, res2] = await Promise.all([ fetch('/audio/bgm.mp3'), fetch('/audio/bgm_final.mp3') ]); this.bgmBuffer = await this.ctx.decodeAudioData(await res1.arrayBuffer()); this.bgmFinalBuffer = await this.ctx.decodeAudioData(await res2.arrayBuffer());
        } catch(e) {
            console.error("Failed to load BGM", e);
        }
    }

    
    crossfadeToFinal() {
        if (!this.ctx || this.activeBGM === 'final' || !this.bgmFinalBuffer) return;
        this.activeBGM = 'final';
        
        this.bgmFinalSource = this.ctx.createBufferSource();
        this.bgmFinalSource.buffer = this.bgmFinalBuffer;
        this.bgmFinalSource.loop = true;
        
        this.bgmFinalGain = this.ctx.createGain();
        this.bgmFinalGain.gain.setValueAtTime(0, this.ctx.currentTime);
        
        this.bgmFinalSource.connect(this.bgmFinalGain);
        this.bgmFinalGain.connect(this.masterCompressor!);
        this.bgmFinalSource.start(0);

        const now = this.ctx.currentTime;
        if (this.bgmGain) {
            this.bgmGain.gain.cancelScheduledValues(now);
            this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
            this.bgmGain.gain.linearRampToValueAtTime(0, now + 2.5);
        }
        this.bgmFinalGain.gain.linearRampToValueAtTime(0.80, now + 2.5);
        
        setTimeout(() => {
            if (this.bgmSource) {
                this.bgmSource.stop();
                this.bgmSource.disconnect();
                this.bgmSource = null;
            }
        }, 3000);
    }

    crossfadeToNormal() {
        if (!this.ctx || this.activeBGM === 'normal' || !this.bgmBuffer) return;
        this.activeBGM = 'normal';
        
        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = this.bgmBuffer;
        this.bgmSource.loop = true;
        
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        
        this.bgmSource.connect(this.bgmGain);
        this.bgmGain.connect(this.masterCompressor!);
        this.bgmSource.start(0);

        const now = this.ctx.currentTime;
        if (this.bgmFinalGain) {
            this.bgmFinalGain.gain.cancelScheduledValues(now);
            this.bgmFinalGain.gain.setValueAtTime(this.bgmFinalGain.gain.value, now);
            this.bgmFinalGain.gain.linearRampToValueAtTime(0, now + 2.5);
        }
        this.bgmGain.gain.linearRampToValueAtTime(0.80, now + 2.5);
        
        setTimeout(() => {
            if (this.bgmFinalSource) {
                this.bgmFinalSource.stop();
                this.bgmFinalSource.disconnect();
                this.bgmFinalSource = null;
            }
        }, 3000);
    }

    playBGM() {
        if (!this.ctx || !this.bgmBuffer || this.bgmStarted) return;
        this.bgmStarted = true;

        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = this.bgmBuffer;
        this.bgmSource.loop = true; // True seamless loop

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.bgmGain.gain.linearRampToValueAtTime(0.80, this.ctx.currentTime + 2.0); // Smooth 2s fade-in

        this.bgmSource.connect(this.bgmGain);
        this.bgmGain.connect(this.masterCompressor!);

        this.bgmSource.start(0);

        // 24/7 Livestream Failsafe: Ensure context doesn't pause when tab is inactive
        const keepAlive = () => {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        };
        document.addEventListener('visibilitychange', keepAlive);
        window.addEventListener('focus', keepAlive);
    }

    
    duckBGM(isDucking: boolean) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const targetVolume = isDucking ? 0.20 : 0.80;
        
        if (this.activeBGM === 'normal' && this.bgmGain) {
            this.bgmGain.gain.cancelScheduledValues(now);
            this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
            this.bgmGain.gain.linearRampToValueAtTime(targetVolume, now + 0.5);
        } else if (this.activeBGM === 'final' && this.bgmFinalGain) {
            this.bgmFinalGain.gain.cancelScheduledValues(now);
            this.bgmFinalGain.gain.setValueAtTime(this.bgmFinalGain.gain.value, now);
            this.bgmFinalGain.gain.linearRampToValueAtTime(targetVolume, now + 0.5);
        }
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterCompressor = this.ctx.createDynamicsCompressor();
            
            // Compressor settings for punchy but safe sound
            this.masterCompressor.threshold.setValueAtTime(-10, this.ctx.currentTime);
            this.masterCompressor.knee.setValueAtTime(40, this.ctx.currentTime);
            this.masterCompressor.ratio.setValueAtTime(12, this.ctx.currentTime);
            this.masterCompressor.attack.setValueAtTime(0, this.ctx.currentTime);
            this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime);
            
            this.masterCompressor.connect(this.ctx.destination);
            
            // Silent buffer unlock for strict browsers (iOS)
            const silentOsc = this.ctx.createOscillator();
            const silentGain = this.ctx.createGain();
            silentGain.gain.value = 0;
            silentOsc.connect(silentGain);
            silentGain.connect(this.ctx.destination);
            silentOsc.start();
            silentOsc.stop(this.ctx.currentTime + 0.1);
            
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            // Load and play BGM seamlessly
            this.loadBGM().then(() => this.playBGM());
        }
    }
    
    cleanup() {
        if (this.bgmSource) {
            this.bgmSource.stop();
            this.bgmSource.disconnect();
            this.bgmSource = null;
        }
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
        this.bgmStarted = false;
    }

    popTimestamps: number[] = [];
    playPop() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.popTimestamps = this.popTimestamps.filter(t => now - t < 0.1);
        if (this.popTimestamps.length > 2) return;
        this.popTimestamps.push(now);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterCompressor!);
        
        // Satisfying soft bubble pop
        osc.type = 'sine';
        const baseFreq = 400 + (Math.random() * 200);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 300, now + 0.08); 
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }

    bounceTimestamps: number[] = [];

    playBounce(impact: number) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.bounceTimestamps = this.bounceTimestamps.filter(t => now - t < 0.1);
        if (this.bounceTimestamps.length > 2) return;
        this.bounceTimestamps.push(now);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterCompressor!);
        
        osc.type = 'triangle';
        const baseFreq = 150 + Math.random() * 50;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        const volume = Math.min(0.15, impact / 200);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    killTimestamps: number[] = [];
    playKill() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.killTimestamps = this.killTimestamps.filter(t => now - t < 0.15);
        if (this.killTimestamps.length > 1) return;
        this.killTimestamps.push(now);

        // Satisfying smooth deep gulp/bloop
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterCompressor!);
        
        osc.type = 'sine';
        osc2.type = 'triangle';
        
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.exponentialRampToValueAtTime(90, now + 0.2);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.2);
        osc2.stop(now + 0.2);
    }

    playShatter() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        const gain = this.ctx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterCompressor!);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        noise.start();
    }

    playVictory() {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterCompressor!);
        
        osc1.type = 'square';
        osc2.type = 'sawtooth';
        
        const now = this.ctx.currentTime;
        
        [osc1, osc2].forEach(osc => {
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.2); // C#5
            osc.frequency.setValueAtTime(659.25, now + 0.4); // E5
            osc.frequency.setValueAtTime(880, now + 0.6); // A5
        });
        
        osc2.detune.value = 10;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.setValueAtTime(0.3, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2);
        osc2.stop(now + 2);
    }
}

const audio = new AudioSystem();


const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hasSpokenTTS = useRef(false);
    // Refactor #1: physicsState mutable ref - ZERO React re-renders at 60fps
    const physicsStateRef = useRef<any>(null);
    const lastUiUpdateRef = useRef(0);
    const [gameState, setGameState] = useState<any>(null);
    const flagsCache = useRef<Record<string, HTMLCanvasElement>>({});
    const visualStates = useRef<Record<string, { wobbleStart: number, wobbleAmp: number, currentRadius?: number }>>({});
    const socketRef = useRef<Socket | null>(null);
    const [matchWinner, setMatchWinner] = useState<{name: string, iso: string, phase?: number} | null>(null);
    const [leaderboardPage, setLeaderboardPage] = useState(0);
    const confettiRef = useRef<any[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLeaderboardPage(p => p + 1);
        }, 3000); // paginate every 3 seconds
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        const initAudio = () => { audio.init(); window.removeEventListener('click', initAudio); window.removeEventListener('keydown', initAudio); };
        window.addEventListener('click', initAudio);
        window.addEventListener('keydown', initAudio);

        ALL_ISOS.forEach(iso => {
            if (!flagsCache.current[iso]) {
                const img = new Image();
                img.src = `https://flagcdn.com/w640/${iso}.png`;
                img.onload = () => {
                    const canvasSize = 512;
                    const offscreen = document.createElement('canvas');
                    offscreen.width = canvasSize;
                    offscreen.height = canvasSize;
                    const octx = offscreen.getContext('2d');
                    if (octx) {
                        octx.beginPath();
                        octx.arc(canvasSize/2, canvasSize/2, canvasSize/2, 0, Math.PI * 2);
                        octx.clip();
                        
                        const imgRatio = img.width / img.height;
                        let drawWidth, drawHeight;
                        if (imgRatio > 1) {
                            drawHeight = canvasSize;
                            drawWidth = canvasSize * imgRatio;
                        } else {
                            drawWidth = canvasSize;
                            drawHeight = canvasSize / imgRatio;
                        }
                        const x = (canvasSize - drawWidth) / 2;
                        const y = (canvasSize - drawHeight) / 2;
                        
                        octx.drawImage(img, x, y, drawWidth, drawHeight);
                    }
                    flagsCache.current[iso] = offscreen;
                };
            }
        });

        const socket = io('http://localhost:3002');
        socketRef.current = socket;

        socket.on('match-winner', (winner) => {
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

                const msg = new SpeechSynthesisUtterance(`${cname} is qualified for ${nextRound}!`);
                msg.volume = 1;
                msg.rate = 1.1;
                msg.pitch = 0.9;
                msg.onstart = () => audio.duckBGM(true);
                msg.onend = () => audio.duckBGM(false);
                msg.onerror = () => audio.duckBGM(false);
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
        });

        socket.on('state', (state) => {
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
            });
            
            state.events?.forEach((evt: any) => {
                if (evt.type === 'pop') audio.playPop();
                if (evt.type === 'bounce') { 
                    audio.playBounce(evt.impact || 100); 
                    if (evt.id) visualStates.current[evt.id] = { wobbleStart: Date.now(), wobbleAmp: 0.15 }; 
                }
                if (evt.type === 'kill') { 
                    audio.playKill();
                    if (evt.id) visualStates.current[evt.id] = { wobbleStart: Date.now(), wobbleAmp: 0.3 };
                }
                if (evt.type === 'shatter') {
                    audio.playShatter();
                }
            });

        });

        // Refactor #4: Isolated rAF loop - renders from physicsStateRef,
        //              completely independent of network/socket events
        let animFrameId: number;
        const renderLoop = () => {
            if (physicsStateRef.current) {
                renderCanvas(physicsStateRef.current);
            }
            animFrameId = requestAnimationFrame(renderLoop);
        };
        animFrameId = requestAnimationFrame(renderLoop);

        return () => {
            audio.cleanup();
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
            socket.disconnect();
        };
    }, []);

    const renderCanvas = (state: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (state.phase === 5) {
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              // Render Confetti during phase 5
              if (confettiRef.current.length > 0) {
                  confettiRef.current.forEach(c => {
                      ctx.save();
                      ctx.translate(c.x, c.y);
                      ctx.rotate(c.rot);
                      ctx.fillStyle = c.color;
                      ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size * 0.5);
                      ctx.restore();
                      c.x += c.vx;
                      c.y += c.vy;
                      c.rot += c.rotSpeed;
                      c.vx *= 0.99; // Air resistance
                      c.vy += 0.2;  // Gravity
                  });
                  confettiRef.current = confettiRef.current.filter(c => c.y < canvas.height + 50);
              }
              return;
          }

        if (state.bounds) {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 5;
              ctx.strokeRect(state.bounds.xMin, state.bounds.yMin, state.bounds.xMax - state.bounds.xMin, state.bounds.yMax - state.bounds.yMin);
          }

        ctx.fillStyle = '#00ff00';
        state.spikes?.forEach((s: any) => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#00f2fe';
        state.stardust?.forEach((sd: any) => {
            ctx.beginPath();
            ctx.arc(sd.x, sd.y, sd.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Fix #8: Server already pre-sorts ascending by radius; direct reference with 0 allocation
        const sortedCountries = state.countries || [];
        const now = Date.now();
        let lastFontSize = -1;

        sortedCountries.forEach((c: any) => {
            ctx.save();
            ctx.translate(c.x, c.y);

            let speed = Math.hypot(c.vx || 0, c.vy || 0);
            let angle = Math.atan2(c.vy || 0, c.vx || 0);
            let stretch = 1.0 + Math.min(0.3, speed / 1000); 
            let squash = 1.0 / stretch; 

            let wobble = 0;
            let vState = visualStates.current[c.id];
            if (vState) {
                let t = (now - vState.wobbleStart) / 1000; 
                if (t < 1.0) { 
                    let A = vState.wobbleAmp;
                    let omega = 20; 
                    let lambda = 3; 
                    wobble = A * Math.sin(omega * t) * Math.exp(-lambda * t);
                }
            }

            ctx.rotate(angle);
            ctx.scale(stretch + wobble, squash - wobble);
            ctx.rotate(-angle);

            if (state.isInvincible) {
                ctx.beginPath();
                ctx.arc(0, 0, c.radius + 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.fill();
            }

            const cachedCanvas = flagsCache.current[c.iso];
            if (cachedCanvas) {
                ctx.drawImage(cachedCanvas, -c.radius, -c.radius, c.radius * 2, c.radius * 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#444';
                ctx.fill();
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0); 

            if (c.radius > 30 || state.totalAlive < 20) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${Math.max(14, c.radius * 0.25)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(c.name, c.x, c.y);
                ctx.fillText(c.name, c.x, c.y);
            }

            ctx.restore();
        });

        // Render Confetti
        if (confettiRef.current.length > 0) {
            confettiRef.current.forEach(c => {
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rot);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size * 0.5);
                ctx.restore();

                c.x += c.vx;
                c.y += c.vy;
                c.rot += c.rotSpeed;
                c.vx *= 0.99; // Air resistance
                c.vy += 0.2;  // Gravity
            });
            confettiRef.current = confettiRef.current.filter(c => c.y < canvas.height + 50);
        }
    };

    const rawTimer = gameState?.timer || 0;
    const mins = Math.floor(rawTimer / 60).toString().padStart(2, '0');
    const secs = Math.floor(rawTimer % 60).toString().padStart(2, '0');

    return (
        <main className="w-full h-screen bg-black flex justify-center items-center overflow-hidden text-white font-sans">
    <button 
        onClick={() => { if(confirm('Are you sure you want to reset the entire tournament?')) socketRef.current?.emit('reset-tournament'); }}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded shadow-lg text-sm transition-all"
    >
        RESET TOURNAMENT
    </button>
    
             <div className="relative w-[56.25vh] max-w-[100vw] h-[100vh] bg-black border-2 border-[#1a1a2e] flex flex-col">
                 
                 
{(() => {
    const phaseNumber = parseInt(gameState?.phaseName?.match(/\d+/)?.[0] || "1");
    let qualTitle = "QUALIFIED FOR QUARTER-FINAL";
    if (phaseNumber === 2) qualTitle = "QUALIFIED FOR SEMI-FINAL";
    if (phaseNumber === 3) qualTitle = "QUALIFIED FOR FINAL";
    if (phaseNumber === 4) qualTitle = "CHAMPION";
    
    const allWinners = gameState?.qualified_winners || [];
    const currentWinners = allWinners.filter(w => w.wins >= phaseNumber);
    
    const rowsPerPage = 5;
    const totalPages = Math.ceil(currentWinners.length / rowsPerPage) || 1;
    const safePage = currentWinners.length > 0 ? (leaderboardPage % totalPages) : 0;
    const startIndex = safePage * rowsPerPage;
    const recentWinners = currentWinners.slice(startIndex, startIndex + rowsPerPage);
    
    return (
        <div className="absolute top-[1vh] left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-20 flex flex-col gap-1">
            {/* Phase Timer and Round */}
            <div className="text-center text-red-500 text-[10px] font-bold tracking-widest drop-shadow-md">
                ROUND {gameState?.match || 1} <span className="inline-block mx-1">{String.fromCodePoint(0x23F1)}</span> {formatTime(gameState?.tournamentTimer || 0)}
            </div>
            
            {/* Leaderboard - Only show if not Champion phase (phase 5) */}
            {phaseNumber < 5 && (
                <div className="w-full bg-[#1a0505]/90 border border-red-500 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(255,0,0,0.3)] backdrop-blur-sm">
                    <div className="text-white text-center font-bold tracking-widest text-[8px] py-[3px] border-b border-red-500/50 uppercase">
                        {qualTitle}
                    </div>
                    <div key={safePage} className="flex flex-col w-full h-[85px] animate-[fadeIn_0.5s_ease-in-out]">
                        {recentWinners.length === 0 ? null : recentWinners.map((winner, i) => (
                            <div key={winner.iso + i} className={`flex items-center justify-between px-2 py-[2px] ${i % 2 === 0 ? 'bg-red-900/20' : 'bg-transparent'} border-b border-red-500/20 last:border-0`}>
                                <div className="text-red-500 font-bold text-[8px] w-5">#{startIndex + i + 1}</div>
                                <div className="flex items-center gap-1.5 flex-1 justify-center">
                                    <img src={`https://flagcdn.com/w20/${winner.iso}.png`} alt={winner.iso} className="w-3 h-2 object-cover rounded-[1px] shadow-sm" />
                                    <span className="text-white text-[8px] font-semibold tracking-wide">
                                        {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(winner.iso.toUpperCase()); } catch(e) { return winner.name; } })()}
                                    </span>
                                </div>
                                <div className="text-green-400 font-bold text-[7px] flex items-center gap-1 w-14 justify-end">
                                    {String.fromCharCode(10003)} <span className="uppercase tracking-wider">QUALIFIED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
})()}

                   {/* 15vh Top HUD */}
                   <div className="h-[15vh] w-full flex flex-col p-4 z-10 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0">
                      <div className="text-center font-bold text-xl text-[#00f2fe] tracking-wider mb-2" style={{ textShadow: '0 0 10px #00f2fe' }}>
                          
                      </div>
                 </div>
                 
                 {/* Canvas Container */}
                   <div className="absolute w-full text-center text-red-500 text-[10px] font-bold tracking-widest z-10" style={{ top: 'calc(11.25vh + 100px - 10px)', transform: 'translateY(-100%)' }}>
                       {gameState?.phaseName?.toUpperCase()} <span className="inline-block mx-1">{String.fromCodePoint(0x23F1)}</span> {formatTime(gameState?.phaseTimer || 0)}
                   </div>
                   <div className="h-[calc(65vh-100px)] w-full relative mt-[calc(11.25vh+100px)] shrink-0">
                    <canvas ref={canvasRef} width={1080} height={1440} className="w-full h-full absolute inset-0 block" style={{ touchAction: 'none' }} />
                    
                    {matchWinner && (<div className="absolute inset-0 z-50 bg-black/30 pointer-events-none flex flex-col items-center justify-center animate-in fade-in duration-500"><h1 className="text-5xl font-bold text-[#ffaa00] mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(255,170,0,0.8)] animate-bounce">VICTORY!</h1>
                        {matchWinner.phase && matchWinner.phase < 4 && (
                            <h2 className="text-2xl font-bold text-[#00f2fe] mb-8 tracking-widest drop-shadow-md text-center px-4 animate-pulse">
                                QUALIFIED FOR {matchWinner.phase === 1 ? 'QUARTER-FINAL' : matchWinner.phase === 2 ? 'SEMI-FINAL' : 'GRAND FINAL'}
                            </h2>
                        )}<div className="relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.5)] transform hover:scale-110 transition-transform animate-in slide-in-from-bottom-24 duration-700 flex justify-center items-center"><img src={`https://flagcdn.com/w320/${matchWinner.iso}.png`} className="h-20 w-auto object-contain rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.5)]" /></div><h2 className="mt-4 text-2xl font-black text-white uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-pulse text-center px-4 leading-tight break-words">{(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(matchWinner.iso.toUpperCase()); } catch(e) { return matchWinner.name; } })()}</h2></div>)}
                    
                    {gameState?.phase === 5 && (
                        <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
                            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 mb-2 tracking-[0.2em] animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">TOURNAMENT CHAMPION</h1>
                            
                            {gameState?.winner && (
                                <div className="flex flex-col items-center mb-8 transform hover:scale-105 transition-transform mt-8">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-yellow-500/30 blur-xl rounded-full animate-pulse"></div>
                                        <img src={`https://flagcdn.com/w320/${gameState.winner.iso}.png`} className="w-48 h-auto object-cover rounded-xl shadow-[0_0_40px_rgba(255,215,0,0.6)] border-4 border-yellow-500/50 relative z-10" />
                                        <div className="absolute -top-6 -right-6 text-6xl drop-shadow-lg z-20 animate-bounce">👑</div>
                                    </div>
                                    <h2 className="text-4xl font-black text-white mt-6 tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)] text-center">
                                        {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(gameState.winner.iso.toUpperCase()); } catch(e) { return gameState.winner.name; } })()}
                                    </h2>
                                </div>
                            )}

                            <div className="flex w-full max-w-md justify-between items-stretch gap-6 mt-4">
                                {gameState?.runnerUp && (
                                    <div className="flex flex-col items-center flex-1 bg-gradient-to-b from-gray-800/80 to-transparent p-4 rounded-2xl border border-gray-600/30 justify-between">
                                        <h3 className="text-gray-300 font-bold text-xs tracking-widest mb-3">🥈 RUNNER UP</h3>
                                        <img src={`https://flagcdn.com/w160/${gameState.runnerUp.iso}.png`} className="w-24 h-auto rounded-lg shadow-lg mb-2" />
                                        <span className="text-gray-100 font-bold mt-auto text-center uppercase text-xs">
                                            {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(gameState.runnerUp.iso.toUpperCase()); } catch(e) { return gameState.runnerUp.name; } })()}
                                        </span>
                                    </div>
                                )}
                                
                                {gameState?.mostKills && (
                                    <div className="flex flex-col items-center flex-1 bg-gradient-to-b from-red-900/80 to-transparent p-4 rounded-2xl border border-red-500/30 justify-between">
                                        <h3 className="text-red-400 font-bold text-xs tracking-widest mb-3">💀 MOST KILLS ({gameState.mostKills.kills})</h3>
                                        <img src={`https://flagcdn.com/w160/${gameState.mostKills.iso}.png`} className="w-24 h-auto rounded-lg shadow-[0_0_15px_rgba(255,0,0,0.5)] mb-2" />
                                        <span className="text-red-100 font-bold mt-auto text-center uppercase text-xs">
                                            {(() => { try { return new Intl.DisplayNames(["en"], { type: "region" }).of(gameState.mostKills.iso.toUpperCase()); } catch(e) { return gameState.mostKills.name; } })()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-8 text-center">
                                <div className="text-gray-400 text-[10px] font-bold tracking-[0.3em] mb-1">NEW TOURNAMENT IN</div>
                                <div className="text-2xl font-black text-white tabular-nums tracking-widest">{formatTime(gameState?.countdown || 0)}</div>
                            </div>
                        </div>
                    )}
\n{gameState?.isPaused && !matchWinner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                            <button 
                                onClick={() => socketRef.current?.emit('toggle-play')}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-6 px-12 rounded-full text-4xl shadow-[0_0_30px_rgba(255,0,0,0.8)] transition-all hover:scale-110"
                            >
                                START GAME
                            </button>
                        </div>
                    )}
                 </div>

                 {/* Footer Area */}
                   <div className="flex-1 w-full bg-black/95 pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 gap-[2px] -mt-[calc((65vh-100px)/72)] relative">
                      {/* Progress Bar Container */}
                      <div className="w-[95%] h-1 bg-gray-800 rounded-full overflow-hidden border border-white/10 shadow-inner">
                          <div 
                              className="h-full bg-red-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,0,0,0.8)]" 
                              style={{ width: `${gameState ? ((gameState.deadCountriesList?.length || 0) / (gameState.totalInitial || 1)) * 100 : 0}%` }}
                          ></div>
                      </div>
                  
                      {/* Text */}
                      <div className="text-[10px] font-black text-white tracking-widest drop-shadow-md">
                          {gameState?.totalAlive || 0} / {gameState?.totalInitial || 0} FLAGS
                      </div>
                      
                      {/* Dead Flags Flex Grid */}
                      <div className="w-[95%] flex-1 overflow-hidden relative">
                          {(() => {
    const maxCols = 32;
    const maxRows = 8;
    const cols = Math.max(4, Math.min(maxCols, gameState?.totalInitial || maxCols));
    const itemWidth = `calc((100% - ${(cols - 1) * 2}px) / ${cols})`;
    const flagRes = cols <= 8 ? 'w160' : 'w40';
    return (
        <div className="w-full relative shrink-0" style={{ aspectRatio: `${maxCols} / ${maxRows * 0.75}` }}>
            <div dir="rtl" className="absolute bottom-0 left-0 right-0 flex flex-wrap-reverse content-start w-full overflow-visible pr-1" style={{ gap: '2px' }}>
                {gameState?.deadCountriesList?.filter(iso => typeof iso === "string" && iso.length >= 2).map((iso, idx) => (
                    <img 
                        key={`${iso}-${idx}`} 
                        src={`https://flagcdn.com/${flagRes}/${iso}.png`} 
                        className="aspect-[4/3] object-cover rounded-[1px] animate-drop shadow-sm min-w-0" 
                        style={{ width: itemWidth }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }} 
                        alt={iso}
                    />
                ))}
            </div>
        </div>
    );
})()}
                      </div>
                 </div>
             </div>
        </main>
    );
}


