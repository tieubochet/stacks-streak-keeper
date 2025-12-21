
import { GoogleGenAI } from "@google/genai";

export const generateStoryFromWord = async (word: string, currentStory: string, genre: string = "general") => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please ensure it's selected via the UI.");
    return `In a world without magic, the ${word} was still a mystery. (AI Error: Missing API Key)`;
  }

  try {
    // Khởi tạo SDK chỉ khi chắc chắn có API Key
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
