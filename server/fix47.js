import fs from 'fs';
let content = fs.readFileSync('physics.js', 'utf8');

content = content.replace(
    /if \(typeof this\.phaseTimer === "undefined"\) this\.phaseTimer = 0;/g,
    'if (typeof this.phaseTimer === "undefined") this.phaseTimer = 0;\n        if (typeof this.tournamentTimer === "undefined") this.tournamentTimer = 0;'
);

content = content.replace(
    /this\.phaseTimer \+= dt;/g,
    'this.phaseTimer += dt;\n        this.tournamentTimer += dt;'
);

content = content.replace(
    /phaseTimer: this\.phaseTimer \|\| 0,/g,
    'phaseTimer: this.phaseTimer || 0,\n            tournamentTimer: this.tournamentTimer || 0,'
);

fs.writeFileSync('physics.js', content);
console.log("Updated physics.js for tournamentTimer");
