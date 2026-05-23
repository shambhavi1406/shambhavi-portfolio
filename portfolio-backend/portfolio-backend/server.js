const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",        // Fast & good quality
        messages: [
          { role: "system", content: system },
          ...messages
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API Error');
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    
    res.json({ content: [{ text: reply }] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: "Something went wrong. Please check your API key and internet connection." 
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Groq Backend Server running on http://localhost:${PORT}`);
});