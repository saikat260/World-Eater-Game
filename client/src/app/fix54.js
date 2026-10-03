const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

const oldFlagCache = /ALL_ISOS\.forEach\(iso => \{\s*if \(\!flagsCache\.current\[iso\]\) \{\s*const img = new Image\(\);\s*img\.src = `https:\/\/flagcdn\.com\/w320\/\$\{iso\}\.png`;\s*img\.onload = \(\) => \{\s*const offscreen = document\.createElement\('canvas'\);\s*offscreen\.width = 320;\s*offscreen\.height = 320;\s*const octx = offscreen\.getContext\('2d'\);\s*if \(octx\) \{\s*octx\.beginPath\(\);\s*octx\.arc\(160, 160, 160, 0, Math\.PI \* 2\);\s*octx\.clip\(\);\s*octx\.drawImage\(img, 0, 0, 320, 320\);\s*\}\s*flagsCache\.current\[iso\] = offscreen;\s*\};\s*\}\s*\}\);/m;

const newFlagCache = `ALL_ISOS.forEach(iso => {
            if (!flagsCache.current[iso]) {
                const img = new Image();
                img.src = \`https://flagcdn.com/w640/\${iso}.png\`;
                img.onload = () => {
                    const canvasSize = 512;
                    const offscreen = document.createElement('canvas');
                    offscreen.width = canvasSize;
                    offscreen.height = canvasSize;
                    const octx = offscreen.getContext('2d');
                    if (octx) {
                        octx.beginPath();
                        octx.arc(canvasSize/2, canvasSize/2, canvasSize/2, 0, Math.PI * 2);
                        octx.clip();
                        
                        const imgRatio = img.width / img.height;
                        let drawWidth, drawHeight;
                        if (imgRatio > 1) {
                            drawHeight = canvasSize;
                            drawWidth = canvasSize * imgRatio;
                        } else {
                            drawWidth = canvasSize;
                            drawHeight = canvasSize / imgRatio;
                        }
                        const x = (canvasSize - drawWidth) / 2;
                        const y = (canvasSize - drawHeight) / 2;
                        
                        octx.drawImage(img, x, y, drawWidth, drawHeight);
                    }
                    flagsCache.current[iso] = offscreen;
                };
            }
        });`;

content = content.replace(oldFlagCache, newFlagCache);

fs.writeFileSync('page.tsx', content);
console.log("Updated flag cache logic to 512x512 resolution with object-cover.");
