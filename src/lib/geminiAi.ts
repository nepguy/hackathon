// src/lib/geminiAi.ts

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Generates an enhanced travel alert using the Gemini AI.
 * @param originalAlert - The original alert object from the existing service.
 * @returns A promise that resolves to a string with the AI-enhanced alert.
 */
export const generateEnhancedAlert = async (originalAlert: any): Promise<string> => {
  if (!API_KEY) {
    console.error("VITE_GEMINI_API_KEY is not set in .env file");
    return "AI analysis is currently unavailable.";
  }

  const prompt = `
    Based on the following travel alert, provide a concise and helpful summary for a traveler. 
    Focus on practical advice and the direct impact on their plans. Keep it to 2-3 short sentences.

    Original Alert:
    - Title: ${originalAlert.headline}
    - Country: ${originalAlert.country_name}
    - Details: ${originalAlert.details}
    - Advice: ${originalAlert.advice}
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ "text": prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Gemini API Error:", errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      return "Could not generate AI analysis for this alert.";
    }

  } catch (error) {
    console.error("Error contacting Gemini AI:", error);
    return "Failed to get AI-powered insights for this alert.";
  }
};

export const geminiAiService = {
  generateEnhancedAlert,
}; 