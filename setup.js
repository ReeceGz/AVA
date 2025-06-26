const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function installDeps() {
  console.log('[🔧] Installing Node dependencies...');
  execSync('npm install', { stdio: 'inherit' });
}

function setupEnv() {
  if (!fs.existsSync('.env')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('[📄] .env file created. Add your API keys.');
  }
}

function installWhisperCpp() {
  const binPath = path.join(__dirname, 'backend', 'stt', 'whisper.exe');
  if (!fs.existsSync(binPath)) {
    console.log('[⬇️] Downloading whisper.exe...');
    // You must manually download from: https://github.com/ggerganov/whisper.cpp/releases
    console.log('[!] Please manually download whisper.exe and place in /backend/stt/');
  }
}

function installYtDlp() {
  const ytPath = path.join(__dirname, 'backend', 'tools', 'playMusic', 'yt-dlp.exe');
  if (!fs.existsSync(ytPath)) {
    console.log('[⬇️] Downloading yt-dlp...');
    execSync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe -o backend/tools/playMusic/yt-dlp.exe');
  }
}

console.log('🧠 JARVIS Hybrid Installer Started...');
installDeps();
setupEnv();
installWhisperCpp();
installYtDlp();
console.log('✅ Setup complete. Run "npm run start" to launch JARVIS.');
