const fs = require('fs');
const path = 'layout.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('suppressHydrationWarning')) {
    content = content.replace(/<body([^>]*)>/, '<body$1 suppressHydrationWarning>');
    fs.writeFileSync(path, content);
    console.log("Added suppressHydrationWarning to body");
} else {
    console.log("suppressHydrationWarning already exists");
}
