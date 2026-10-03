const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// Replace the phase 5 block
const phase5Regex = /if \(state\.phase === 5\) \{[\s\S]*?return;\s*\}/;
content = content.replace(phase5Regex, `if (state.phase === 5) {
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
          }`);

fs.writeFileSync('page.tsx', content);
console.log("Success phase 5");
