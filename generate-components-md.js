const fs = require('fs');
const path = require('path');

const uiDir = path.join(process.cwd(), 'src/components/ui');
const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));

let md = '## UI Components\n\n';

for (const file of files) {
  const content = fs.readFileSync(path.join(uiDir, file), 'utf8');
  md += `### ${file}\n\n`;
  md += `- File: \`src/components/ui/${file}\`\n`;
  md += `- Description: Shared UI component\n\n`;
  md += '```tsx\n' + content + '\n```\n\n';
}

fs.mkdirSync(path.join(process.cwd(), '.superdesign/init'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), '.superdesign/init/components.md'), md);
console.log('Created components.md');
