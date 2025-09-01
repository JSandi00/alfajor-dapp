const fs = require('fs');
const path = require('path');

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Deleted: ${dirPath}`);
  }
}

console.log('🧹 Cleaning Next.js cache and build files...');

// Delete .next directory
deleteDirectory(path.join(__dirname, '.next'));

// Delete node_modules/.cache if it exists
deleteDirectory(path.join(__dirname, 'node_modules', '.cache'));

console.log('✨ Cache cleaned successfully!');
console.log('Run: npm run dev');
