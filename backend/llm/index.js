const axios = require('axios');
require('dotenv').config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_MODEL = 'meta-llama/Llama-3-8b-chat-hf';

async function queryLLM(prompt) {
  const response = await axios.post(
    'https://api.together.xyz/v1/chat/completions',
    {
      model: TOGETHER_MODEL,
      messages: [{ role: 'user', content: prompt }],
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

  return response.data.choices[0].message.content;
}

module.exports = { queryLLM };
