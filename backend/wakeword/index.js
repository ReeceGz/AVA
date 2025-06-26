require('dotenv').config();
const path = require('path');
const { Porcupine }        = require('@picovoice/porcupine-node');
const { PvRecorder }       = require('@picovoice/pvrecorder-node');

let porcupine;
let recorder;

async function initWakeWord(callback) {
  try {
    const accessKey = process.env.PICOVOICE_ACCESS_KEY;
    if (!accessKey) throw new Error('Missing PICOVOICE_ACCESS_KEY in .env');

    // Initialize Porcupine with custom keyword
    porcupine = new Porcupine(
      accessKey,
      [ path.join(__dirname, 'AVA.ppn') ],
      [ 0.5 ]
    );

    // Initialize recorder
    recorder = new PvRecorder(porcupine.frameLength);
    await recorder.start();

    console.log('[WAKE] Wake word listener initialized (say "Hey AVA")');

    // === Async loop instead of recorder.on ===
    (async () => {
      while (true) {
        try {
          const pcm = await recorder.read();           // :contentReference[oaicite:0]{index=0}
          const idx = porcupine.process(pcm);
          if (idx >= 0) {
            console.log('[DETECT] Wake word detected!');
            callback();
          }
        } catch (readError) {
          console.error('[ERROR] Recorder read error:', readError);
          break;
        }
      }
    })();

  } catch (err) {
    console.error('[ERROR] Wake word error:', err);
  }
}

module.exports = { initWakeWord };
