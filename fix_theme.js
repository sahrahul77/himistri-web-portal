const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const files = walkSync('pages');

const oldToggleRegex = /const toggleTheme = \(\) => \{\s*setIsDark\(!isDark\);\s*document\.documentElement\.setAttribute\('data-theme', !isDark \? 'dark' : 'light'\);\s*\};/g;

const newToggle = `const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.match(oldToggleRegex)) {
    content = content.replace(oldToggleRegex, newToggle);
    fs.writeFileSync(file, content);
    console.log('Fixed toggleTheme in:', file);
  }
});

// Update _app.js to enforce dark mode on initial mount globally
let appContent = fs.readFileSync('pages/_app.js', 'utf8');
if (!appContent.includes("document.documentElement.classList.add('dark')")) {
  appContent = appContent.replace(
    "function AuthGuard({ children }) {",
    "function AuthGuard({ children }) {\n  useEffect(() => {\n    document.documentElement.classList.add('dark');\n    document.documentElement.setAttribute('data-theme', 'dark');\n  }, []);\n"
  );
  fs.writeFileSync('pages/_app.js', appContent);
  console.log('Enforced global dark mode mount in pages/_app.js');
}
