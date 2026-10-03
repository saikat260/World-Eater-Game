const fs = require('fs');
let content = fs.readFileSync('physics.js', 'utf8');

// Initialize phaseTimer in constructor
content = content.replace(
    /this\.matchTimer = 0;\s*this\.isInvincible = true;/g,
    'this.matchTimer = 0;\n        this.isInvincible = true;\n        if (typeof this.phaseTimer === "undefined") this.phaseTimer = 0;'
);

// Update phaseTimer in update(dt)
content = content.replace(
    /this\.matchTimer \+= dt;/,
    'this.matchTimer += dt;\n        this.phaseTimer += dt;'
);

// Add phaseTimer to getState()
content = content.replace(
    /timer: this\.matchTimer,/,
    'timer: this.matchTimer,\n            phaseTimer: this.phaseTimer,'
);

fs.writeFileSync('physics.js', content);
console.log("Updated physics.js with phaseTimer");
