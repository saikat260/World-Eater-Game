const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf-8');

const startRegex = /sortedCountries\.forEach\(\(c: any\) => \{/;
const endRegex = /ctx\.restore\(\);\s*\n\s*\}\);/;

let startMatch = content.match(startRegex);
let endMatch = content.match(endRegex);

if (startMatch && endMatch && startMatch.index < endMatch.index) {
    let before = content.substring(0, startMatch.index);
    let after = content.substring(endMatch.index + endMatch[0].length);
    
    const replacement = `        sortedCountries.forEach((c: any) => {
            let vState = visualStates.current[c.id];
            if (!vState) {
                visualStates.current[c.id] = { wobbleStart: 0, wobbleAmp: 0, x: c.x, y: c.y, currentRadius: c.radius };
                vState = visualStates.current[c.id];
            }

            // Interpolation / Smoothing
            vState.x += (c.x - vState.x) * 0.4;
            vState.y += (c.y - vState.y) * 0.4;
            vState.currentRadius += (c.radius - vState.currentRadius) * 0.15;

            const drawX = vState.x;
            const drawY = vState.y;
            const drawR = Math.max(5, vState.currentRadius);

            if (drawR < 40) {
                // SIMPLE RENDER
                if (state.isInvincible) {
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, drawR + 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';
                    ctx.fill();
                }

                const cachedCanvas = flagsCache.current[c.iso];
                if (cachedCanvas) {
                    ctx.drawImage(cachedCanvas, drawX - drawR, drawY - drawR, drawR * 2, drawR * 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2);
                    ctx.fillStyle = '#444';
                    ctx.fill();
                }

                if (state.totalAlive < 20) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = \\\`bold \\\${Math.max(14, drawR * 0.25)}px sans-serif\\\`;
                    ctx.textAlign = 'center';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 3;
                    ctx.strokeText(c.name, drawX, drawY);
                    ctx.fillText(c.name, drawX, drawY);
                }
            } else {
                // FULL RENDER
                ctx.save();
                ctx.translate(drawX, drawY);

                let speed = Math.hypot(c.vx || 0, c.vy || 0);
                let angle = Math.atan2(c.vy || 0, c.vx || 0);
                let stretch = 1.0 + Math.min(0.3, speed / 1000); 
                let squash = 1.0 / stretch; 

                let wobble = 0;
                let t = (now - vState.wobbleStart) / 1000; 
                if (t < 1.0) { 
                    let A = vState.wobbleAmp;
                    wobble = A * Math.sin(20 * t) * Math.exp(-3 * t);
                }

                ctx.rotate(angle);
                ctx.scale(stretch + wobble, squash - wobble);
                ctx.rotate(-angle);

                if (state.isInvincible) {
                    ctx.beginPath();
                    ctx.arc(0, 0, drawR + 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';
                    ctx.fill();
                }

                const cachedCanvas = flagsCache.current[c.iso];
                if (cachedCanvas) {
                    ctx.drawImage(cachedCanvas, -drawR, -drawR, drawR * 2, drawR * 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, drawR, 0, Math.PI * 2);
                    ctx.fillStyle = '#444';
                    ctx.fill();
                }

                ctx.setTransform(1, 0, 0, 1, 0, 0); 
                ctx.fillStyle = '#ffffff';
                ctx.font = \\\`bold \\\${Math.max(14, drawR * 0.25)}px sans-serif\\\`;
                ctx.textAlign = 'center';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(c.name, drawX, drawY);
                ctx.fillText(c.name, drawX, drawY);
                ctx.restore();
            }
        });`;
    fs.writeFileSync('page.tsx', before + replacement.replace(/\\\\`/g, '`').replace(/\\\$/g, '$') + after);
    console.log('Replaced via regex');
} else {
    console.log('Regex replace failed');
}
