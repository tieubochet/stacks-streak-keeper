
import { GoogleGenAI } from "@google/genai";

// Hàm hỗ trợ delay cho cơ chế retry
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateStoryFromWord = async (
  word: string, 
  currentStory: string, 
  genre: string = "general",
  retries: number = 3
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return `The story paused. (Error: Missing API Key)`;
  }

  const prompt = `
    Task: Continue a collaborative story.
    Genre: ${genre}
    New Word to include: "${word}"
    Existing Story: "${currentStory || "The journey began."}"
    
    Instruction: Write the NEXT SHORT PART of the story (max 2 sentences) that naturally incorporates the word "${word}". 
    The tone should match the genre "${genre}". 
    Return only the new text segment, nothing else.
  `;

  for (let i = 0; i < retries; i++) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Tối ưu nhất cho quota và tốc độ
        contents: prompt,
      });
      
      return response.text?.trim() || `And then, the ${word} changed everything.`;
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      
      if (isRateLimit && i < retries - 1) {
        // Exponential backoff: 2s, 4s, 8s...
        const waitTime = Math.pow(2, i + 1) * 1000;
        console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      
      console.error("Gemini API Error:", error);
      if (isRateLimit) {
        return `[Limit Hit] The ${word} appeared, but the narrator needed a moment to breathe.`;
      }
      break;
    }
  }

  return `Suddenly, a ${word} appeared on the horizon.`;
};
