#!/usr/bin/env node

/**
 * Configuration Validator
 * Run this script to verify your Firebase and MongoDB setup
 * 
 * Usage: node scripts/validate-config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
};

function checkEnvFile() {
  log.title('🔍 Checking Environment Files');

  const envPath = path.join(projectRoot, '.env.local');
  const envExamplePath = path.join(projectRoot, '.env.example');

  if (!fs.existsSync(envPath)) {
    log.error('.env.local not found');
    log.info('Run: cp .env.example .env.local');
    return false;
  }

  log.success('.env.local exists');

  if (!fs.existsSync(envExamplePath)) {
    log.warning('.env.example not found (should exist for reference)');
  } else {
    log.success('.env.example exists');
  }

  return true;
}

function validateEnvVariables() {
  log.title('📋 Validating Environment Variables');

  const envPath = path.join(projectRoot, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log.error('Cannot validate: .env.local not found');
    return { valid: false, missing: [], empty: [] };
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Required variables for frontend (VITE_*)
  const requiredFrontend = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  // Required variables for backend
  const requiredBackend = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'MONGODB_URI',
  ];

  const required = [...requiredFrontend, ...requiredBackend];
  const missing = [];
  const empty = [];

  required.forEach((key) => {
    const regex = new RegExp(`^${key}=(.*)$`, 'm');
    const match = envContent.match(regex);
    
    if (!match) {
      missing.push(key);
    } else if (!match[1] || match[1].trim() === '') {
      empty.push(key);
    }
  });

  if (missing.length === 0 && empty.length === 0) {
    log.success('All required variables are set and not empty');
    return { valid: true, missing: [], empty: [] };
  }

  if (missing.length > 0) {
    missing.forEach((key) => {
      log.error(`Missing: ${key}`);
    });
  }

  if (empty.length > 0) {
    empty.forEach((key) => {
      log.warning(`Empty: ${key}`);
    });
  }

  return {
    valid: missing.length === 0,
    missing,
    empty,
  };
}

function validateMongoDBUri() {
  log.title('🗄️  Validating MongoDB Configuration');

  const envPath = path.join(projectRoot, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);

  if (!match || !match[1]) {
    log.error('MONGODB_URI not found');
    return false;
  }

  const uri = match[1].trim();

  // Check MongoDB URI format
  const mongoDbRegex = /^mongodb\+srv:\/\/[^:]+:[^@]+@[^/]+\/[^?]+/;
  if (!mongoDbRegex.test(uri)) {
    log.error('MONGODB_URI format is invalid');
    log.info('Expected format: mongodb+srv://username:password@cluster.mongodb.net/database');
    return false;
  }

  log.success('MONGODB_URI format is valid');

  // Check for credentials
  if (uri.includes('username') || uri.includes('password')) {
    log.warning('MONGODB_URI contains placeholder credentials (username/password)');
    return false;
  }

  log.success('MONGODB_URI appears to have real credentials');

  return true;
}

function validateFirebaseConfig() {
  log.title('🔥 Validating Firebase Configuration');

  const envPath = path.join(projectRoot, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');

  let isValid = true;

  // Check Firebase client config
  const firebaseKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  firebaseKeys.forEach((key) => {
    const regex = new RegExp(`^${key}=(.+)$`, 'm');
    const match = envContent.match(regex);
    if (match && match[1]?.trim()) {
      log.success(`${key} is configured`);
    } else {
      log.error(`${key} is missing or empty`);
      isValid = false;
    }
  });

  // Check Firebase Admin SDK config
  const adminKeys = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
  ];

  adminKeys.forEach((key) => {
    const regex = new RegExp(`^${key}=(.+)$`, 'm');
    const match = envContent.match(regex);
    if (match && match[1]?.trim()) {
      log.success(`${key} is configured`);
    } else {
      log.error(`${key} is missing or empty`);
      isValid = false;
    }
  });

  // Check private key format
  const privateKeyMatch = envContent.match(/^FIREBASE_PRIVATE_KEY=(.+)$/m);
  if (privateKeyMatch) {
    const privateKey = privateKeyMatch[1];
    if (privateKey.includes('BEGIN PRIVATE KEY') && privateKey.includes('END PRIVATE KEY')) {
      log.success('FIREBASE_PRIVATE_KEY contains key markers');
      if (privateKey.includes('\\n')) {
        log.success('FIREBASE_PRIVATE_KEY has escaped newlines (correct format)');
      } else if (!privateKey.includes('\n')) {
        log.error('FIREBASE_PRIVATE_KEY appears to be single line without newlines');
        isValid = false;
      }
    } else {
      log.error('FIREBASE_PRIVATE_KEY is missing BEGIN/END markers');
      isValid = false;
    }
  }

  return isValid;
}

function checkPackageJson() {
  log.title('📦 Checking Dependencies');

  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log.error('package.json not found');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['firebase', 'mongoose', 'express', 'axios'];

  let allPresent = true;
  requiredDeps.forEach((dep) => {
    if (packageJson.dependencies[dep]) {
      log.success(`${dep} is installed`);
    } else {
      log.error(`${dep} is not installed`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkGitIgnore() {
  log.title('🔐 Checking Security');

  const gitignorePath = path.join(projectRoot, '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    log.warning('.gitignore not found - environment variables might be committed!');
    return false;
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

  if (gitignoreContent.includes('.env.local') || gitignoreContent.includes('.env')) {
    log.success('.env files are in .gitignore');
    return true;
  } else {
    log.error('.env.local is NOT in .gitignore - credentials could be exposed!');
    log.info('Add .env.local to .gitignore immediately');
    return false;
  }
}

function main() {
  console.log(`
${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.blue}║     Firebase + MongoDB Configuration Validator             ║${colors.reset}
${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  const results = {
    envFile: checkEnvFile(),
    envVariables: validateEnvVariables(),
    firebase: validateFirebaseConfig(),
    mongodb: validateMongoDBUri(),
    packages: checkPackageJson(),
    security: checkGitIgnore(),
  };

  // Summary
  log.title('📊 Summary');

  const allChecks = [
    { name: 'Environment File', passed: results.envFile },
    { name: 'Environment Variables', passed: results.envVariables.valid },
    { name: 'Firebase Configuration', passed: results.firebase },
    { name: 'MongoDB Configuration', passed: results.mongodb },
    { name: 'Dependencies', passed: results.packages },
    { name: 'Security (.gitignore)', passed: results.security },
  ];

  const passedCount = allChecks.filter((c) => c.passed).length;
  const totalCount = allChecks.length;

  allChecks.forEach((check) => {
    if (check.passed) {
      log.success(check.name);
    } else {
      log.error(check.name);
    }
  });

  console.log(`\n${passedCount}/${totalCount} checks passed`);

  if (passedCount === totalCount) {
    console.log(`\n${colors.green}${colors.bold}🎉 All checks passed! You're ready to start.${colors.reset}`);
    console.log(`\nNext steps:\n`);
    console.log(`  1. Start backend:   pnpm run dev:backend`);
    console.log(`  2. Start frontend:  pnpm run dev`);
    console.log(`  3. Open browser:    http://localhost:5173\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Configuration incomplete. Please fix the issues above.${colors.reset}\n`);
    console.log(`See SETUP_GUIDE.md and TROUBLESHOOTING.md for help.\n`);
    process.exit(1);
  }
}

main();
