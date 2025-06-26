const axios = require('axios');
require('dotenv').config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_MODEL   = 'meta-llama/Llama-3-8b-chat-hf';

// — Personality prompt
const SYSTEM_PROMPT = `
You are A.V.A (Adaptive Virtual Assistant), an ultra-aware, helpful virtual assistant with a friendly yet no-nonsense tone.
You speak in short, clear sentences, inject the occasional joke, and always tell it like it is.
Your behavior should mimic that of JARVIS; Tony Stark's AI Assitant.
`.trim();

async function queryLLM(userPrompt) {
  // build the chat messages array
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: userPrompt }
  ];

  const response = await axios.post(
    'https://api.together.xyz/v1/chat/completions',
    {
      model: TOGETHER_MODEL,
      messages,
      max_tokens: 300,
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content.trim();
}

module.exports = { queryLLM };
