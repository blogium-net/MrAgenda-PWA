import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "../types";

// @google/genai kütüphanesi, Content türünü içe aktarma haritalarıyla kolayca içe aktarılabilecek şekilde doğrudan dışa aktarmaz.
// Tür güvenliğini sağlamak için burada tanımlıyoruz.
interface Part {
    text: string;
}
interface Content {
    role: 'user' | 'model';
    parts: Part[];
}


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will not be available.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generatePlanStream = async (chatHistory: ChatMessage[]) => {
  if (!API_KEY) {
    // Return a stream that yields an error message
    return (async function* () {
      yield { text: "API Anahtarı yapılandırılmadığı için AI hizmeti kullanılamıyor." };
    })();
  }
  
  const contents: Content[] = chatHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }]
  }));

  try {
    return ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: `You are MrAgenda, a friendly and helpful AI assistant. Your primary language is Turkish. Be conversational and helpful. If the user provides a very short or vague input like "deneme" or "selam", respond with a warm greeting and ask how you can help, for example: "Merhaba! Size nasıl yardımcı olabilirim?". For specific questions, provide direct and concise answers. Use Markdown for formatting when appropriate (e.g., **bold**, *italic*, lists). For structured data like schedules or tables, use fenced code blocks (\`\`\`) to preserve formatting.`,
      }
    });
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    // Return a stream that yields an error message
    return (async function* () {
      yield { text: "Üzgünüm, bir hata oluştu ve isteğinizi işleme alamadım. Lütfen daha sonra tekrar deneyin." };
    })();
  }
};