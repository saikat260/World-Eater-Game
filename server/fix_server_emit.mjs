import fs from 'fs';

let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
    'isPaused: !isPlaying',
    'isPaused: !isPlaying,\r\n        isPlaying: isPlaying'
);

fs.writeFileSync('server.js', content);
console.log('server.js isPaused and isPlaying both emitted successfully');
