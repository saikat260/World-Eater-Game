const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Audio crossfade methods
const audioCrossfade = `
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
`;
if (!content.includes('crossfadeToFinal')) {
    content = content.replace(/bgmStarted: boolean = false;/, "bgmStarted: boolean = false;\n    activeBGM: 'normal' | 'final' = 'normal';\n    bgmFinalBuffer: AudioBuffer | null = null;\n    bgmFinalSource: AudioBufferSourceNode | null = null;\n    bgmFinalGain: GainNode | null = null;");
    content = content.replace(/const response = await fetch\('\/audio\/bgm\.mp3'\);\s*const arrayBuffer = await response\.arrayBuffer\(\);\s*this\.bgmBuffer = await this\.ctx\.decodeAudioData\(arrayBuffer\);/, `const [res1, res2] = await Promise.all([ fetch('/audio/bgm.mp3'), fetch('/audio/bgm_final.mp3') ]); this.bgmBuffer = await this.ctx.decodeAudioData(await res1.arrayBuffer()); this.bgmFinalBuffer = await this.ctx.decodeAudioData(await res2.arrayBuffer());`);
    content = content.replace(/playBGM\(\) \{/, audioCrossfade + "\n    playBGM() {");
}

fs.writeFileSync('page.tsx', content);
console.log("Audio injected");
