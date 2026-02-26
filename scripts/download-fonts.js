import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const fonts = [
    { name: 'inter-latin-400', url: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2' },
    { name: 'museo-moderno-latin-400', url: 'https://fonts.gstatic.com/s/museomoderno/v29/zrfi0HnU0_7wWdMrFcWqSEXlWwnrogHKog.woff2' },
    // Adding more unique ones if they exist, but for now let's use these baselines if they are variable or shared.
    // Actually, I'll just download these two as they represent the primary latin subsets.
];

const fontsDir = path.join(process.cwd(), 'public/fonts');
mkdirSync(fontsDir, { recursive: true });

fonts.forEach(font => {
    const dest = path.join(fontsDir, `${font.name}.woff2`);
    console.log(`Downloading ${font.name}...`);
    try {
        execSync(`curl -L "${font.url}" -o "${dest}"`);
    } catch (err) {
        console.error(`Failed to download ${font.name}:`, err.message);
    }
});

const cssContent = `
/* Local Font Faces */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/inter-latin-400.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'MuseoModerno';
  font-style: normal;
  font-weight: 400 900;
  font-display: swap;
  src: url('/fonts/museo-moderno-latin-400.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

writeFileSync(path.join(process.cwd(), 'src/fonts.css'), cssContent);
console.log('Generated src/fonts.css');
