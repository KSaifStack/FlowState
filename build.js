// node build.js to build
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(' Starting FlowState Build Process...\n');

function runCommand(command, description) {
    console.log(` ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(` ${description} completed\n`);
        return true;
    } catch (error) {
        console.error(` ${description} failed:`, error.message);
        return false;
    }
}

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(` ${description} found`);
        return true;
    } else {
        console.log(` ${description} missing at: ${filePath}`);
        return false;
    }
}

// Pre-build checks
console.log('🔍 Pre-build Checks:\n');
const checks = [
    checkFile('build/icon.ico', 'Icon file'),
    checkFile('backend/Backend.csproj', 'Backend project'),
    checkFile('electron/main.js', 'Electron main'),
    checkFile('electron/preload.js', 'Electron preload')
];

if (checks.includes(false)) {
    console.error('\n Pre-build checks failed. Please fix the issues above.\n');
    process.exit(1);
}

console.log('\n All pre-build checks passed!\n');

// Step 1: Build Frontend (Vite)
if (!runCommand('npm run build --prefix frontend', 'Building frontend with Vite')) {
    process.exit(1);
}

// Step 2: Build Backend (.NET)
const backendCommand = 'dotnet publish backend/Backend.csproj -c Release -o backend/bin/Release/net8.0/publish --self-contained false';
if (!runCommand(backendCommand, 'Building .NET backend')) {
    process.exit(1);
}

// Step 3: Verify backend output
if (!checkFile('backend/bin/Release/net8.0/publish/Backend.exe', 'Backend executable')) {
    console.error('❌ Backend build succeeded but .exe not found');
    process.exit(1);
}

// Step 4: Install electron dependencies
console.log('Installing Electron dependencies...');
try {
    if (fs.existsSync('electron/package.json')) {
        execSync('cd electron && npm install', { stdio: 'inherit' });
        console.log(' Electron dependencies installed\n');
    }
} catch (error) {
    console.error(' Failed to install electron dependencies');
}

// Step 5: Build Electron App
if (!runCommand('npx electron-builder --win', 'Building Electron installer')) {
    process.exit(1);
}

console.log('\n Build Complete!\n');
console.log('Your installer is ready in: dist-electron/');
console.log('Installer name: FlowState Setup 1.0.0.exe\n');
console.log('Next steps:');
console.log('   1. Test the installer on a clean Windows machine');
console.log('   2. Share the .exe file with users');
console.log('   3. Users run the installer to install FlowState\n');