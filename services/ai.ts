
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with the mandatory named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryFromWord = async (word: string, currentStory: string, genre: string = "general") => {
  const prompt = `
    Task: Continue a collaborative story.
    Genre: ${genre}
    New Word to include: "${word}"
    Existing Story: "${currentStory || "The journey began."}"
    
    Instruction: Write the NEXT SHORT PART of the story (max 2 sentences) that naturally incorporates the word "${word}". 
    The tone should match the genre "${genre}". 
    Return only the new text segment, nothing else.
  `;

  try {
    // Call generateContent with the model name and prompt directly as contents.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Extract generated text directly from the text property (do not call as a method).
    return response.text?.trim() || `And then, the ${word} changed everything.`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Suddenly, a ${word} appeared on the horizon.`;
  }
};
