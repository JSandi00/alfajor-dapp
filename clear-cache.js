const fs = require('fs');
const path = require('path');

// Clean Next.js cache
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Cleared .next cache');
}

// Clean node_modules/.cache if it exists
const nodeModulesCache = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(nodeModulesCache)) {
  fs.rmSync(nodeModulesCache, { recursive: true, force: true });
  console.log('✅ Cleared node_modules cache');
}

console.log('🎉 All caches cleared successfully!');
console.log('Now run: npm run dev');
