#!/usr/bin/env node

/**
 * Script to remove all dark: mode classes from JSX and CSS files
 * Usage: node scripts/remove-dark-mode.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function removeDarkClasses(content) {
  // Remove patterns like `dark:class-name `
  content = content.replace(/\s+dark:[a-zA-Z0-9\-\[\]\/\.#:\(\),]*(?=\s|'|"|$)/g, '');
  
  // Clean up extra spaces
  content = content.replace(/  +/g, ' ');
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const newContent = removeDarkClasses(content);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      callback(filePath);
    }
  });
}

console.log('Removing dark mode classes from codebase...\n');

let filesUpdated = 0;
walkDir(srcDir, (filePath) => {
  if (processFile(filePath)) {
    filesUpdated++;
  }
});

console.log(`\n✓ Process complete! Updated ${filesUpdated} files.`);
