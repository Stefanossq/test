import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CharacterClass, GeneratedLore } from "../types";

// Initialize the client.
// Note: In a real production app, ensure API_KEY is set in your env.
// We handle the case where it might be missing gracefully in the UI.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateCharacterLore = async (characterClass: CharacterClass): Promise<GeneratedLore> => {
  if (!apiKey) {
    return {
      story: "API Key missing. This warrior fights in the void of configuration.",
      quote: "Configure your environment variables, traveler."
    };
  }

  try {
    const prompt = `
      Generate a short, witty, and unique backstory and a battle cry for a sci-fi fantasy character of class: ${characterClass}.
      Keep it under 40 words.
      Format as JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING },
            quote: { type: Type.STRING }
          },
          required: ["story", "quote"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as GeneratedLore;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      story: "The archives are incomplete. Connection to the neural net failed.",
      quote: "Error... System... Failure..."
    };
  }
};

export const generateCharacterSpeech = async (text: string, characterClass: CharacterClass): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    // Select voice based on class for personality
    let voiceName = 'Kore'; // Default Female
    if (characterClass === CharacterClass.WARRIOR) voiceName = 'Fenrir'; // Deep, strong
    if (characterClass === CharacterClass.ROGUE) voiceName = 'Puck'; // Mid-range
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
