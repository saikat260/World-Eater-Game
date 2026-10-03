const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Add duckBGM to AudioSystem
const duckBGMCode = `
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
`;

if (!content.includes('duckBGM')) {
    content = content.replace(/init\(\) \{/, duckBGMCode + "\n    init() {");
}

// 2. Add ducking events to Phase 5 TTS
const phase5TTSRegex = /const msg = new SpeechSynthesisUtterance\(\`The Tournament is over! \$\{state\.winner\.name\} has conquered the world and is the Ultimate Emperor!\`\);\s*msg\.volume = 1;\s*msg\.rate = 1\.1;\s*msg\.pitch = 0\.9;\s*window\.speechSynthesis\.speak\(msg\);/;
const newPhase5TTS = `const msg = new SpeechSynthesisUtterance(\`The Tournament is over! \${state.winner.name} has conquered the world and is the Ultimate Emperor!\`);
                    msg.volume = 1;
                    msg.rate = 1.1;
                    msg.pitch = 0.9;
                    msg.onstart = () => audio.duckBGM(true);
                    msg.onend = () => audio.duckBGM(false);
                    msg.onerror = () => audio.duckBGM(false);
                    window.speechSynthesis.speak(msg);`;
content = content.replace(phase5TTSRegex, newPhase5TTS);

// 3. Add ducking events to Match Winner TTS
const matchWinnerTTSRegex = /const msg = new SpeechSynthesisUtterance\(\`\$\{cname\} is qualified for \$\{nextRound\}!\`\);\s*msg\.volume = 1;\s*msg\.rate = 1\.1;\s*msg\.pitch = 0\.9;\s*window\.speechSynthesis\.speak\(msg\);/;
const newMatchWinnerTTS = `const msg = new SpeechSynthesisUtterance(\`\${cname} is qualified for \${nextRound}!\`);
                msg.volume = 1;
                msg.rate = 1.1;
                msg.pitch = 0.9;
                msg.onstart = () => audio.duckBGM(true);
                msg.onend = () => audio.duckBGM(false);
                msg.onerror = () => audio.duckBGM(false);
                window.speechSynthesis.speak(msg);`;
content = content.replace(matchWinnerTTSRegex, newMatchWinnerTTS);

fs.writeFileSync('page.tsx', content);
console.log("Audio ducking implemented for TTS");
