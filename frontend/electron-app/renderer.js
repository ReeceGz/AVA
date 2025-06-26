const input = document.getElementById('input');
const log = document.getElementById('log');

async function askAVA() {
  const text = input.value;
  if (!text.trim()) return;

  log.innerHTML += `<div><b>You:</b> ${text}</div>`;
  const response = await window.AVA.query(text);
  log.innerHTML += `<div><b>A.V.A:</b> ${response}</div><br/>`;

  input.value = '';
  log.scrollTop = log.scrollHeight;
}
