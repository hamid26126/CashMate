require('dotenv').config();
const axios = require('axios');

async function testGroq() {
  try {
    console.log('API Key exists:', !!process.env.GROQ_API_KEY);
    
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found in .env');
      return;
    }
    
    const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
    const GROQ_MODEL = 'llama-3.1-8b-instant';
    
    console.log(`\nTesting Groq API with model: ${GROQ_MODEL}`);
    console.log('Endpoint:', GROQ_API_ENDPOINT);
    
    const response = await axios.post(
      GROQ_API_ENDPOINT,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: 'Say hello and confirm you are Groq API!'
          }
        ],
        temperature: 0.7,
        max_tokens: 256
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Groq API Connection Successful!');
    console.log('Response:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testGroq();
