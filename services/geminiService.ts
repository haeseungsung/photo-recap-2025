import { GoogleGenAI, Type } from "@google/genai";
import { ColorData } from "../types";

const SYSTEM_INSTRUCTION = `
You are a creative aesthetic director and color analyst. 
Your goal is to analyze a set of colors and generate a witty, poetic, and trendy Korean name for the color palette.
The name should strictly follow the format: "Adjective Noun 팔레트" (e.g., "새벽의 우울 팔레트", "달콤한 휴식 팔레트", "열정적인 파동 팔레트").
Also provide 3 hashtags that describe the mood of these colors.
`;

export const analyzePaletteWithGemini = async (colors: ColorData[]): Promise<{ title: string; hashtags: string[] }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key not found, using fallback data.");
      return {
        title: "신비로운 미지 팔레트",
        hashtags: ["#2025", "#Colors", "#Vibe"]
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct prompt with color hex codes
    const colorStrings = colors.map(c => c.hex).join(", ");
    const prompt = `Here are the 5 dominant colors extracted from a user's 2025 photo album: ${colorStrings}. 
    Create a witty and insightful name for this palette in Korean and 3 mood hashtags.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The creative Korean name for the palette (Adjective Noun 팔레트)",
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 mood hashtags",
            },
          },
          required: ["title", "hashtags"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      title: "나만의 기록 팔레트",
      hashtags: ["#2025", "#Memories", "#Moment"]
    };
  }
};