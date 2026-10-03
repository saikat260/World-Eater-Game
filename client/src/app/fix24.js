const fs = require('fs');
let content = fs.readFileSync('page.tsx', 'utf8');

// 1. Update Canvas Border
const canvasBorderRegex = /if \(state\.bounds\) \{\s*ctx\.strokeStyle = [^;]+;\s*ctx\.lineWidth = [^;]+;\s*ctx\.shadowBlur = 20;\s*ctx\.shadowColor = ctx\.strokeStyle;\s*ctx\.strokeRect[^;]+;\s*ctx\.shadowBlur = 0;\s*\}/m;
const newCanvasBorder = `if (state.bounds) {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 5;
              ctx.strokeRect(state.bounds.xMin, state.bounds.yMin, state.bounds.xMax - state.bounds.xMin, state.bounds.yMax - state.bounds.yMin);
          }`;
content = content.replace(canvasBorderRegex, newCanvasBorder);

// 2. Remove yellow line (border and shadow) from footer
// The footer class: "flex-1 w-full bg-black/95 border-t-2 border-[#ffaa00] pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 shadow-[0_-5px_20px_rgba(255,170,0,0.2)] gap-[2px] -mt-[0.9vh] relative"
const footerRegex = /className="flex-1 w-full bg-black\/95 border-t-2 border-\[#ffaa00\] pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 shadow-\[0_-5px_20px_rgba\(255,170,0,0\.2\)\] gap-\[2px\] -mt-\[0\.9vh\] relative"/g;
const newFooter = `className="flex-1 w-full bg-black/95 pt-1 px-2 pb-2 flex flex-col items-center justify-start z-10 gap-[2px] -mt-[0.9vh] relative"`;
content = content.replace(footerRegex, newFooter);

fs.writeFileSync('page.tsx', content);
console.log("Canvas border made white without glow, footer yellow line removed.");
