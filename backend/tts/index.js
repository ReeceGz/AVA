const axios = require('axios');
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

async function speak(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

  const response = await axios.post(url, {
    text,
    model_id: 'eleven_monolingual_v1',
    voice_settings: { stability: 0.5, similarity_boost: 0.5 }
  }, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    responseType: 'stream'
  });

  const file = require('fs').createWriteStream('response.mp3');
  response.data.pipe(file);
  file.on('finish', () => {
    require('child_process').exec(`start response.mp3`);
  });
}

module.exports = { speak };
