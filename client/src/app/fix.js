const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf-8');

const startRegex = /sortedCountries\.forEach\(\(c: any\) => \{/;
const endRegex = /ctx\.restore\(\);\n\s*\}\n\s*\}\);/;

let startMatch = content.match(startRegex);
let endMatch = content.match(endRegex);

if (startMatch && endMatch && startMatch.index < endMatch.index) {
    let before = content.substring(0, startMatch.index);
    let after = content.substring(endMatch.index + endMatch[0].length);
    
    const replacement = `        sortedCountries.forEach((c: any) => {
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
                ctx.font = \\\`bold \\\${Math.max(14, c.radius * 0.25)}px sans-serif\\\`;
                ctx.textAlign = 'center';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(c.name, c.x, c.y);
                ctx.fillText(c.name, c.x, c.y);
            }

            ctx.restore();
        });`;
    fs.writeFileSync('page.tsx', before + replacement.replace(/\\\\`/g, '`').replace(/\\\$/g, '$') + after);
    console.log('Reverted via regex');
} else {
    console.log('Regex replace failed');
}
