import Groq from "groq-sdk";

// Khởi tạo Groq Client
// Lưu ý: dangerouslyAllowBrowser: true là bắt buộc khi chạy trên Vite (Client-side)
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

/**
 * Hàm tạo nội dung story dựa trên số ngày streak
 * @param streakCount Số ngày user đã duy trì
 * @param prompt (Tùy chọn) Prompt tùy chỉnh từ context
 */
export const generateStory = async (streakCount: number, customPrompt?: string) => {
  try {
    const systemPrompt = `You are a creative fantasy narrator for a habit-tracking RPG game. 
    Write a VERY SHORT (max 1 sentence, under 200 characters), epic update.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: customPrompt || `Describe the event for day ${streakCount}.`
        }
      ],
      model: "llama-3.1-8b-instant", // Model mạnh và nhanh nhất hiện tại trên Groq
      temperature: 0.7,
      max_tokens: 60, // Giữ câu trả lời ngắn gọn
    });

    let content = completion.choices[0]?.message?.content || "";
    if (content.length > 250) {
        content = content.substring(0, 247) + "...";
    }
    return content;
  } catch (error) {
    console.error("Error generating story with Groq:", error);
    return "The ancient scrolls are silent today. (Connection Error)";
  }
};

// Hàm wrapper tổng quát nếu bạn dùng ở chỗ khác
export const getAIResponse = async (prompt: string) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
        });
        return completion.choices[0]?.message?.content;
    } catch (e) {
        console.error(e);
        return null;
    }
}