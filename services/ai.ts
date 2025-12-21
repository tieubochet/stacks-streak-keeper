
import { GoogleGenAI } from "@google/genai";

export const generateStoryFromWord = async (word: string, currentStory: string, genre: string = "general") => {
  // Khởi tạo instance ngay trước khi gọi API để tránh stale API key
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    return `The story paused as the world waited for a key. (AI Error: Missing API Key)`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Task: Continue a collaborative story.
      Genre: ${genre}
      New Word to include: "${word}"
      Existing Story: "${currentStory || "The journey began."}"
      
      Instruction: Write the NEXT SHORT PART of the story (max 2 sentences) that naturally incorporates the word "${word}". 
      The tone should match the genre "${genre}". 
      Return only the new text segment, nothing else.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || `And then, the ${word} changed everything.`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Suddenly, a ${word} appeared on the horizon.`;
  }
};
