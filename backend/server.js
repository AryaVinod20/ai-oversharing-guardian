const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/analyze', async (req, res) => {
  const { postText } = req.body;

  if (!postText) {
    return res.status(400).json({ error: 'No post text provided' });
  }

  try {
    const prompt = `
      You are a privacy and security expert.
      Analyze this social media post for privacy risks:
      "${postText}"

      Check for these risks:
      1. Physical Security (empty home, location)
      2. Location Privacy (real-time whereabouts)
      3. Financial Exposure (valuables, money)
      4. Personal Safety (children, routines)

      Reply in this exact JSON format only, no extra text:
      {
        "risk_score": <number from 1 to 10>,
        "risk_level": "<LOW or MEDIUM or HIGH>",
        "findings": [
          {
            "category": "<category name>",
            "issue": "<what is risky in plain English>"
          }
        ],
        "safer_version": "<rewrite the post more safely>"
      }
    `;

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    });

    const text = result.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned);

    res.json({ success: true, data });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});