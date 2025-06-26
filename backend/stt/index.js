const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function transcribeAudio(audioPath) {
  return new Promise((resolve, reject) => {
    const whisperPath = path.join(__dirname, 'whisper.exe');
    if (!fs.existsSync(whisperPath)) return reject('whisper.exe not found');

    const process = spawn(whisperPath, [audioPath, '--model', 'base', '--language', 'en']);

    process.stdout.on('data', data => {
      const output = data.toString();
      if (output.includes('->')) {
        const text = output.split('->').pop().trim();
        resolve(text);
      }
    });

    process.stderr.on('data', data => {
      console.error('[STT Error]', data.toString());
    });

    process.on('exit', code => {
      if (code !== 0) reject('Whisper failed with code ' + code);
    });
  });
}

module.exports = { transcribeAudio };
