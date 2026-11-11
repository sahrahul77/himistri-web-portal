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

  // Replace fallbackTimer body with empty function to prevent forced isLoading = false
  content = content.replace(
    /const fallbackTimer = setTimeout\(\(\) => \{\s*setIsLoadingCat\(false\);\s*setIsLoadingSrv\(false\);\s*setIsLoadingBnr\(false\);\s*\}, 4000\);/g,
    `const fallbackTimer = setTimeout(() => {\n      // Fallback removed to let skeletons spin endlessly until real data arrives\n    }, 4000);`
  );

  content = content.replace(
    /const timer = setTimeout\(\(\) => \{\s*setIsLoadingCat\(false\);\s*setIsLoadingSrv\(false\);\s*\}, 4000\);/g,
    `const timer = setTimeout(() => {\n      // Fallback removed to let skeletons spin endlessly until real data arrives\n    }, 4000);`
  );

  content = content.replace(
    /const timer = setTimeout\(\(\) => \{\s*setIsLoadingSrv\(false\);\s*setIsLoadingCat\(false\);\s*\}, 4000\);/g,
    `const timer = setTimeout(() => {\n      // Fallback removed to let skeletons spin endlessly until real data arrives\n    }, 4000);`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated timer in ${file}`);
});
