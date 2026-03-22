const fs = require('fs');
const path = require('path');

try {
  const htmlPath = path.join(__dirname, '../dsa/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Match all <style> blocks
  const styleMatches = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);

  console.log(`Found ${styleMatches.length} <style> blocks.`);

  // Block 0 is usually Shared Design System (which is already in globals.css from editorial.css)
  // Blocks 1 and 2 contain the Home-specific and Practice Tree CSS.
  let cssToAppend = '';

  styleMatches.forEach((cssBlock, index) => {
    if (cssBlock.includes('HOME-SPECIFIC STYLES') || cssBlock.includes('PRACTICE SECTION')) {
      cssToAppend += `\n/* EXTRACTED BLOCK ${index} */\n` + cssBlock;
    }
  });

  const globalsPath = path.join(__dirname, 'app/globals.css');
  fs.appendFileSync(globalsPath, cssToAppend);
  console.log('Successfully appended missing landing page CSS to globals.css!');

} catch (err) {
  console.error("Extraction failed:", err);
}
