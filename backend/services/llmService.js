// backend/services/llmService.js
const axios = require('axios');

const fetchGeminiResponse = async (query, previousTurns = []) => {
  try {
    const contents = [];
    previousTurns.forEach(turn => {
      contents.push({ role: 'user', parts: [{ text: turn.query }] });
      const geminiResponse = turn.responses.find(r => r.modelName.includes('Gemini'));
      if (geminiResponse) {
        contents.push({ role: 'model', parts: [{ text: geminiResponse.answer }] });
      }
    });
    contents.push({ role: 'user', parts: [{ text: query }] });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return {
      modelName: 'Google (Gemini 2.5 Flash)',
      answer: response.data.candidates[0].content.parts[0].text,
    };
  } catch (error) {
    console.error('Error fetching Gemini response:', error.response?.data || error.message);
    return {
      modelName: 'Google (Gemini 2.5 Flash)',
      answer: `Error: ${error.response?.data?.error?.message || error.message}`,
    };
  }
};

const fetchGroqResponse = async (query, previousTurns = []) => {
  try {
    const messages = [];
    previousTurns.forEach(turn => {
      messages.push({ role: 'user', content: turn.query });
      const groqResponse = turn.responses.find(r => r.modelName.includes('Groq'));
      if (groqResponse) {
        messages.push({ role: 'assistant', content: groqResponse.answer });
      }
    });
    messages.push({ role: 'user', content: query });

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return {
      modelName: 'Groq (Llama 3.1 8B Instant)',
      answer: response.data.choices[0].message.content,
    };
  } catch (error) {
    console.error('Error fetching Groq response:', error.response?.data || error.message);
    return {
      modelName: 'Groq (Llama 3.1 8B Instant)',
      answer: `Error: ${error.response?.data?.error?.message || error.message}`,
    };
  }
};

const getLlmResponses = async (query, previousTurns = []) => {
  // Call all models concurrently
  const results = await Promise.allSettled([
    fetchGeminiResponse(query, previousTurns),
    fetchGroqResponse(query, previousTurns)
  ]);

  // Map results back to the expected array format
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // Should rarely happen since we catch errors inside the fetch functions themselves,
      // but safe to have a fallback.
      return {
        modelName: 'Unknown Model',
        answer: `Unhandled error during fetch: ${result.reason}`
      };
    }
  });
};

module.exports = {
  getLlmResponses,
};
