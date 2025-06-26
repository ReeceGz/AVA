const { PvPorcupine, BuiltinKeyword } = require('@picovoice/porcupine-node');
const { PvRecorder } = require('@picovoice/pvrecorder-node');

let porcupine = null;
let recorder = null;

async function initWakeWord(callback) {
  try {
    porcupine = await PvPorcupine.create([BuiltinKeyword.AVA]);
    recorder = new PvRecorder(porcupine.frameLength);
    recorder.start();

    console.log('[🎙️] Wake word listener initialized (say "Hey AVA")');

    recorder.on('frame', pcm => {
      const keywordIndex = porcupine.process(pcm);
      if (keywordIndex >= 0) {
        console.log('[👂] Wake word detected!');
        callback();
      }
    });
  } catch (err) {
    console.error('[❌] Wake word error:', err);
  }
}

module.exports = { initWakeWord };
