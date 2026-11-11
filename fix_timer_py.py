import re

files = [
    '/Users/rahulshah/Library/Caches/Google/AndroidStudio2026.2.1/projects/myapplication2.a726a877/.artifacts/12c039fc-79f6-47bf-97f8-2a0cd098a6e9/web_app_nextjs/pages/index.js',
    '/Users/rahulshah/Library/Caches/Google/AndroidStudio2026.2.1/projects/myapplication2.a726a877/.artifacts/12c039fc-79f6-47bf-97f8-2a0cd098a6e9/web_app_nextjs/pages/categories.js',
    '/Users/rahulshah/Library/Caches/Google/AndroidStudio2026.2.1/projects/myapplication2.a726a877/.artifacts/12c039fc-79f6-47bf-97f8-2a0cd098a6e9/web_app_nextjs/pages/services.js'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # We want to replace the body of fallbackTimer / timer with nothing
    content = re.sub(r'const (fallbackTimer|timer) = setTimeout\(\(\) => \{[^}]*\}, \d+\);', 
                     r'const \1 = setTimeout(() => {}, 4000);', content)

    with open(file, 'w') as f:
        f.write(content)
    print(f"Updated {file}")
