// backend/tools/playMusic/index.js

const fs    = require('fs');
const path  = require('path');
const yts   = require('yt-search');
const { spawn } = require('child_process');

// cross‐platform “open URL in default browser”
function openExternal(url) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '""', url], { shell: true, detached: true });
  } else if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true });
  } else {
    spawn('xdg-open', [url], { detached: true });
  }
}

// Play a random local .mp3
function playLocal() {
  const musicDir = path.join(__dirname, 'music');
  if (!fs.existsSync(musicDir)) {
    return console.error('[playMusic] Music directory not found:', musicDir);
  }
  const files = fs.readdirSync(musicDir).filter(f => f.toLowerCase().endsWith('.mp3'));
  if (!files.length) {
    return console.error('[playMusic] No MP3 files in:', musicDir);
  }
  const choice = files[Math.floor(Math.random() * files.length)];
  console.log(`[🎵] Playing local file: ${choice}`);
  openExternal(path.join(musicDir, choice));
}

// Search YouTube and open the top result with autoplay enabled
async function playYouTube(query) {
  console.log(`[🌐] Searching YouTube for: ${query}`);
  try {
    const r = await yts(query);
    if (r && r.videos && r.videos.length) {
      const top = r.videos[0]; // most relevant
      // build URL with autoplay
      const base = top.url; // e.g. https://www.youtube.com/watch?v=VIDEO_ID
      const autoplayUrl = base.includes('?')
        ? `${base}&autoplay=1`
        : `${base}?autoplay=1`;
      console.log(`[🎬] Opening top result: ${top.title} (autoplay)`);
      openExternal(autoplayUrl);
    } else {
      console.log('[🎬] No results found; opening search page');
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&autoplay=1`;
      openExternal(searchUrl);
    }
  } catch (err) {
    console.error('[playMusic] YouTube search failed:', err);
    const fallback = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&autoplay=1`;
    openExternal(fallback);
  }
}

module.exports = { playLocal, playYouTube };
