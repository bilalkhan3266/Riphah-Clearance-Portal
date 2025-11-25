const fs = require('fs');
const path = require('path');

const emojis = ['🔄','📌','✅','❌','⏳','📋','💬','✕','✓','📚','🧪','💊','💰','👔','💻','🏛','🔬','🏠','🎓','🎉','📊','⚠','👑','📈','📂','💾','👤','🔍','⭐','🏆','📄','🔒','🔑','🏢','🎯','🌐','⚡','🚀','💡','🔔','🌟','👨‍💼'];

function walkDir(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) files.push(...walkDir(full));
    else if (full.endsWith('.js')) files.push(full);
  }
  return files;
}

const deptDir = path.join(__dirname, 'faculty-clearance-system', 'frontend', 'src', 'components', 'Departments');
const files = walkDir(deptDir);
let found = false;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const e of emojis) {
      if (lines[i].includes(e)) {
        found = true;
        console.log(`${path.basename(f)}:${i+1}: [${e}] ${lines[i].trim().substring(0, 80)}`);
      }
    }
  }
}

if (!found) console.log('NO EMOJIS FOUND - ALL CLEAN!');
