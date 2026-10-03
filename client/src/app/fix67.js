const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// The loop is probably state.countries?.forEach or state.countries.forEach
const targetLoop = /state\.countries(\?)?\.forEach\(\(c: any\) => \{/;
// Wait, I don't know the exact signature. Let me just replace the radius assignments.
// `let r = c.radius * scale;` -> I can inject the lerp right before this!

let newContent = content.replace(/let r = c\.radius \* scale;/g, `
            // LERP RADIUS for smooth scale animation
            if (!visualStates.current[c.id]) {
                visualStates.current[c.id] = { wobbleStart: 0, wobbleAmp: 0, currentRadius: c.radius };
            }
            let vStateLerp = visualStates.current[c.id];
            if (vStateLerp.currentRadius === undefined) {
                vStateLerp.currentRadius = c.radius;
            }
            vStateLerp.currentRadius += (c.radius - vStateLerp.currentRadius) * 0.15;
            let displayRadius = vStateLerp.currentRadius;
            
            let r = displayRadius * scale;
`);

fs.writeFileSync('page.tsx', newContent);
console.log("Lerp injected");
