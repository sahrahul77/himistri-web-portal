const fs = require('fs');
const path = require('path');

const files = [
  'pages/index.js',
  'pages/categories.js',
  'pages/services.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the fallback timer logic
  content = content.replace(/\s*\/\/\s*Fallback timer\s*const fallbackTimer = setTimeout\(\(\) => \{[\s\S]*?\}, \d+\);\s*/g, '\n\n    ');

  // Clean up the clearTimeout in the return of useEffect
  content = content.replace(/clearTimeout\(fallbackTimer\);\s*/g, '');
  content = content.replace(/clearTimeout\(timer\);\s*/g, '');
  
  // Replace the loading skeleton conditions to just rely on the boolean, which will now stay true until data is actually fetched
  
  // Wait, if I just remove the timer, the boolean will stay true until list.length > 0.
  // And we also need to make sure that if CACHE loads, it sets the boolean to false!
  content = content.replace(
    /if\s*\(\s*parsedCat\.length\s*>\s*0\s*\)\s*\{\s*setCategories\(parsedCat\);\s*\}/g,
    `if(parsedCat.length > 0) { setCategories(parsedCat); setIsLoadingCat(false); }`
  );
  content = content.replace(
    /if\s*\(\s*parsedSrv\.length\s*>\s*0\s*\)\s*\{\s*setServices\(parsedSrv\);\s*\}/g,
    `if(parsedSrv.length > 0) { setServices(parsedSrv); setIsLoadingSrv(false); }`
  );
  content = content.replace(
    /if\s*\(\s*parsedBnr\.length\s*>\s*0\s*\)\s*\{\s*setBanners\(parsedBnr\);\s*\}/g,
    `if(parsedBnr.length > 0) { setBanners(parsedBnr); setIsLoadingBnr(false); }`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated timer in ${file}`);
});
