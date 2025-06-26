const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const musicDir = path.join(__dirname, 'music');
const ytDlp = path.join(__dirname, 'yt-dlp.exe');

function playLocal() {
  const files = fs.readdirSync(musicDir).filter(file => file.endsWith('.mp3'));
  if (files.length === 0) return console.log('[❌] No MP3s found.');

  const random = files[Math.floor(Math.random() * files.length)];
  console.log('[🎵] Playing local file:', random);
  spawn('start', [path.join(musicDir, random)], { shell: true });
}

function playYouTube(query) {
  console.log('[🌐] Streaming from YouTube:', query);
  spawn(ytDlp, [`ytsearch:${query}`, '-x', '--audio-format', 'mp3', '-o', 'yt_music.mp3'], { cwd: __dirname })
    .on('close', () => {
      spawn('start', ['yt_music.mp3'], { cwd: __dirname, shell: true });
    });
}

module.exports = { playLocal, playYouTube };
