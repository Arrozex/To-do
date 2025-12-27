import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIGeneratedTask } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const suggestBreakdown = async (goal: string): Promise<AIGeneratedTask[]> => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return [];
  }

  const modelId = "gemini-3-flash-preview";
  
  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        content: { type: Type.STRING, description: "The specific actionable task content" },
        estimatedDurationHours: { type: Type.NUMBER, description: "Estimated time in hours" },
        priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
      },
      required: ["content", "estimatedDurationHours", "priority"],
      propertyOrdering: ["content", "estimatedDurationHours", "priority"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Break down the following goal into 3-5 concrete, actionable tasks: "${goal}". Keep descriptions concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a helpful productivity assistant. Provide output in JSON format."
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as AIGeneratedTask[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
