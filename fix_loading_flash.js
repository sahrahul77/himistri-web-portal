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

  // Fix Categories
  content = content.replace(
    /if \(list\.length > 0\) \{\s*setCategories\(list\);\s*localStorage\.setItem\('himistri_cache_cat', JSON\.stringify\(list\)\);\s*\}\s*setIsLoadingCat\(false\);/g,
    `if (list.length > 0) {
        setCategories(list);
        localStorage.setItem('himistri_cache_cat', JSON.stringify(list));
        setIsLoadingCat(false);
      }`
  );

  // Fix Services
  content = content.replace(
    /if \(list\.length > 0\) \{\s*setServices\(list\);\s*localStorage\.setItem\('himistri_cache_srv', JSON\.stringify\(list\)\);\s*\}\s*setIsLoadingSrv\(false\);/g,
    `if (list.length > 0) {
        setServices(list);
        localStorage.setItem('himistri_cache_srv', JSON.stringify(list));
        setIsLoadingSrv(false);
      }`
  );

  // Fix Banners (index.js only)
  content = content.replace(
    /if \(list\.length > 0\) \{\s*setBanners\(list\);\s*localStorage\.setItem\('himistri_cache_bnr', JSON\.stringify\(list\)\);\s*\}\s*setIsLoadingBnr\(false\);/g,
    `if (list.length > 0) {
        setBanners(list);
        localStorage.setItem('himistri_cache_bnr', JSON.stringify(list));
        setIsLoadingBnr(false);
      }`
  );

  // Also remove the old `setIsLoadingContent(false)` errors just in case
  content = content.replace(/if\s*\(\s*cachedCat\s*\|\|\s*cachedSrv\s*\|\|\s*cachedBnr\s*\)\s*\{\s*setIsLoadingContent\(false\);\s*\}/g, '');
  content = content.replace(/if\s*\(\s*cachedCat\s*\|\|\s*cachedSrv\s*\)\s*\{\s*setIsLoadingContent\(false\);\s*\}/g, '');
  content = content.replace(/if\s*\(\s*cachedSrv\s*\|\|\s*cachedCat\s*\)\s*\{\s*setIsLoadingContent\(false\);\s*\}/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
});
