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

  // 1. State replacements
  content = content.replace(
    /const \[isLoadingContent, setIsLoadingContent\] = useState\(true\);/g,
    `const [isLoadingCat, setIsLoadingCat] = useState(true);
  const [isLoadingSrv, setIsLoadingSrv] = useState(true);
  const [isLoadingBnr, setIsLoadingBnr] = useState(true);`
  );

  // 2. Remove premature cache-based loading state flips
  content = content.replace(/if\s*\(\s*cachedCat\s*\|\|\s*cachedSrv\s*\|\|\s*cachedBnr\s*\)\s*\{\s*setIsLoadingContent\(false\);\s*\}/g, '');
  content = content.replace(/if\s*\(\s*cachedSrv\s*\|\|\s*cachedCat\s*\)\s*\{\s*setIsLoadingContent\(false\);\s*\}/g, '');
  content = content.replace(/if\s*\(\s*cachedCat\s*\|\|\s*cachedSrv\s*\)\s*\{\s*setIsLoadingContent\(false\);\s*\}/g, '');

  // 3. Update listeners
  content = content.replace(/setIsLoadingContent\(false\);/g, (match, offset, str) => {
    // We will do a generic replacement based on surrounding context
    return match; // We'll handle this with more specific regexes below
  });

  // Specifically target the exact lines in the unsub blocks
  content = content.replace(/setCategories\(list\);\s*localStorage\.setItem\('himistri_cache_cat', JSON\.stringify\(list\)\);\s*\}\s*setIsLoadingContent\(false\);/g, `setCategories(list);\n        localStorage.setItem('himistri_cache_cat', JSON.stringify(list));\n      }\n      setIsLoadingCat(false);`);
  content = content.replace(/setServices\(list\);\s*localStorage\.setItem\('himistri_cache_srv', JSON\.stringify\(list\)\);\s*\}\s*setIsLoadingContent\(false\);/g, `setServices(list);\n        localStorage.setItem('himistri_cache_srv', JSON.stringify(list));\n      }\n      setIsLoadingSrv(false);`);
  content = content.replace(/setBanners\(list\);\s*localStorage\.setItem\('himistri_cache_bnr', JSON\.stringify\(list\)\);\s*\}\s*setIsLoadingContent\(false\);/g, `setBanners(list);\n        localStorage.setItem('himistri_cache_bnr', JSON.stringify(list));\n      }\n      setIsLoadingBnr(false);`);

  // 4. Update timer
  content = content.replace(/const timer = setTimeout\(\(\) => setIsLoadingContent\(false\), \d+\);/g, `const timer = setTimeout(() => {\n      setIsLoadingCat(false);\n      setIsLoadingSrv(false);\n      setIsLoadingBnr(false);\n    }, 4000);`);
  content = content.replace(/const fallbackTimer = setTimeout\(\(\) => \{\s*setIsLoadingContent\(false\);\s*\}, \d+\);/g, `const fallbackTimer = setTimeout(() => {\n      setIsLoadingCat(false);\n      setIsLoadingSrv(false);\n      setIsLoadingBnr(false);\n    }, 4000);`);

  // 5. Update JSX conditions
  content = content.replace(/isLoadingContent && categories\.length === 0/g, 'isLoadingCat && categories.length === 0');
  content = content.replace(/isLoadingContent && banners\.length === 0/g, 'isLoadingBnr && banners.length === 0');
  content = content.replace(/isLoadingContent && popularServices\.length === 0/g, 'isLoadingSrv && popularServices.length === 0');
  content = content.replace(/isLoadingContent && filteredServices\.length === 0/g, 'isLoadingSrv && filteredServices.length === 0');
  
  // Clean up any stray `!isLoadingContent` (like in coupons block)
  content = content.replace(/&& !isLoadingContent/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
