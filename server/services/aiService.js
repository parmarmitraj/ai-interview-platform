const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

exports.generateAIQuestion = async (topic, difficulty = "Medium") => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const data = {
      contents: [{
        parts: [{ 
          text: `You are a technical interviewer. Generate one ${difficulty} level interview question about ${topic}. dont repeat question. Return ONLY the question text.` 
        }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!result.candidates || result.candidates.length === 0) {
      console.error("--- GEMINI ERROR DETAILS ---");
      console.error(JSON.stringify(result, null, 2)); 
      return "AI Error: Could not generate a question. Check your API Key or Topic.";
    }

    return result.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error("System Error:", error.message);
    return "Error generating question.";
  }
};

exports.evaluateUserAnswer = async (question, userAnswer) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const data = {
      contents: [{
        parts: [{ 
          text: `You are a technical interviewer. 
          Question: "${question}"
          User's Answer: "${userAnswer}"
          
          Provide your response in this EXACT format:
          Score: [A number 0-10]
          Feedback: [Your evaluation]
          ModelAnswer: [A perfect 3-sentence answer]` 
        }]
      }]
    };

    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();

    if (result.error) {
       console.error("Gemini Error:", result.error.message);
       return { score: 0, feedback: "Quota exceeded. Try again in a few minutes.", modelAnswer: "N/A" };
    }

    const rawAIResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const scoreMatch = rawAIResponse.match(/Score:\s*(\d+)/);
    const feedbackMatch = rawAIResponse.match(/Feedback:\s*([\s\S]*?)(?=ModelAnswer:|$)/);
    const modelMatch = rawAIResponse.match(/ModelAnswer:\s*([\s\S]*)/);

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
      feedback: feedbackMatch ? feedbackMatch[1].trim() : "AI provided feedback in a non-standard format.",
      modelAnswer: modelMatch ? modelMatch[1].trim() : "Model answer not generated."
    };

  } catch (error) {
    console.error("Evaluation System Error:", error.message);
    return { score: 0, feedback: "System error during evaluation.", modelAnswer: "" };
  }
};