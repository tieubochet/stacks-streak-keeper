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
    The user has maintained a streak of ${streakCount} days. 
    Write a VERY SHORT (max 2 sentences), epic, encouraging update about their hero's journey based on this streak.
    Style: Adventure, RPG, Epic.`;

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
      max_tokens: 100, // Giữ câu trả lời ngắn gọn
    });

    return completion.choices[0]?.message?.content || "Your legend continues to grow...";
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