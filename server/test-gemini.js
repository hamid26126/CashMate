require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('GenAI initialized');
    
    // Wait a bit for the quota to potentially reset
    console.log('\nWaiting 20 seconds for potential quota reset...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Try different model names
    const modelNames = [
      'gemini-2.0-flash',
      'gemini-2.0-pro-exp-20250212',
      'gemini-2.0-flash-thinking-exp-1219',
      'learnlm-1.5-pro-experimental'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello!');
        console.log(`✓ Success with ${modelName}`);
        console.log('Response:', result.response.text().substring(0, 100));
        return;
      } catch (err) {
        const msg = err.message;
        if (msg.includes('429')) {
          console.log(`⚠ Rate limited for ${modelName}`);
        } else if (msg.includes('404')) {
          console.log(`✗ Not found: ${modelName}`);
        } else {
          console.log(`✗ Error: ${msg.substring(0, 80)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGemini();
