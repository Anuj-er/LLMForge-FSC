// backend/services/summaryService.js

// This service collects all model outputs
// and formats them before sending them to the summarizer
const generateSummary = async (query, responses) => {
  try {
    // In a production app, we would send all responses to an LLM (like Gemini or GPT-4)
    // to synthesize a final conclusion. We simulate it here.
    
    const delay = 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    let summary = `Final AI Summary for query "${query}":\n\n`;
    responses.forEach(res => {
      summary += `- ${res.modelName} provided a valid response.\n`;
    });
    summary += `\nAll models successfully processed the request. This represents the aggregated consensus from our LLMForge system.`;

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error.message);
    return 'Failed to generate summary.';
  }
};

module.exports = {
  generateSummary,
};
