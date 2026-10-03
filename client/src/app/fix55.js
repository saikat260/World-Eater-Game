const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const audioSystemRegex = /class AudioSystem \{[\s\S]*?const audio = new AudioSystem\(\);/;

const newAudioSystem = `class AudioSystem {
    ctx: AudioContext | null = null;
    masterCompressor: DynamicsCompressorNode | null = null;
    bgmBuffer: AudioBuffer | null = null;
    bgmSource: AudioBufferSourceNode | null = null;
    bgmGain: GainNode | null = null;
    bgmStarted: boolean = false;
    
    async loadBGM() {
        if (!this.ctx) return;
        try {
            const response = await fetch('/audio/bgm.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.bgmBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        } catch(e) {
            console.error("Failed to load BGM", e);
        }
    }

    playBGM() {
        if (!this.ctx || !this.bgmBuffer || this.bgmStarted) return;
        this.bgmStarted = true;

        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = this.bgmBuffer;
        this.bgmSource.loop = true; // True seamless loop

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.bgmGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 2.0); // Smooth 2s fade-in

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

    playPop() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterCompressor!);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + Math.random() * 400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    bounceTimestamps: number[] = [];

    playBounce(impact: number) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.bounceTimestamps = this.bounceTimestamps.filter(t => now - t < 0.1);
        if (this.bounceTimestamps.length > 5) return;
        this.bounceTimestamps.push(now);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterCompressor!);
        
        osc.type = 'triangle';
        const baseFreq = 150 + Math.random() * 50;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        const volume = Math.min(0.5, impact / 100);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playKill() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterCompressor!);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
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

const audio = new AudioSystem();`;

content = content.replace(audioSystemRegex, newAudioSystem);

// Inject cleanup logic into useEffect and add keydown listener
const oldUseEffect = /const initAudio = \(\) => \{ audio\.init\(\); window\.removeEventListener\('click', initAudio\); \};\s*window\.addEventListener\('click', initAudio\);/m;

const newUseEffect = `const initAudio = () => { audio.init(); window.removeEventListener('click', initAudio); window.removeEventListener('keydown', initAudio); };
        window.addEventListener('click', initAudio);
        window.addEventListener('keydown', initAudio);
        
        // Ensure cleanup on unmount
        return () => {
            audio.cleanup();
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
        };`;

if (content.includes("audio.cleanup()")) {
    console.log("Cleanup already present");
} else {
    content = content.replace(oldUseEffect, newUseEffect);
}

fs.writeFileSync('page.tsx', content);
console.log("Updated AudioSystem for BGM successfully.");
