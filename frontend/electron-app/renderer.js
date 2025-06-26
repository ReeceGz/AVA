// frontend/electron-app/renderer.js

const inputEl   = document.getElementById('input');
const logEl     = document.getElementById('log');
const trackEl   = document.getElementById('track');
const playBtn   = document.getElementById('playBtn');
const voiceBtn  = document.getElementById('voiceBtn');

window.ava.onLog(msg => {
  logEl.innerHTML += `<div>${msg}</div>`;
  logEl.scrollTop = logEl.scrollHeight;
});

async function askAva() {
  const text = inputEl.value.trim();
  if (!text) return;
  logEl.innerHTML += `<div><b>You:</b> ${text}</div>`;
  const resp = await window.ava.query(text);
  logEl.innerHTML += `<div><b>AVA:</b> ${resp}</div><br/>`;
  inputEl.value = '';
  logEl.scrollTop = logEl.scrollHeight;
}

function playSomeMusic() {
  const query = trackEl.value.trim();
  console.log('[Renderer] playSomeMusic()', query);
  window.ava.playMusic(query);
  logEl.innerHTML += `<div>[Music] ${query || 'Random local track'}…</div>`;
}

playBtn.addEventListener('click', playSomeMusic);

voiceBtn.addEventListener('click', () => {
  logEl.innerHTML += `<div><b>[Voice]</b> listening…</div>`;
  window.ava.voice();
});

// expose text ask for inline onclick
window.askAva = askAva;
