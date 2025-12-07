import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

// Helper to convert external URL to base64 (handling CORS if possible)
const urlToDataUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Image fetch error:", error);
    throw error;
  }
};

// Generates a companion AI image based on a REAL input image to ensure similar composition/subject.
export const generateAICompanion = async (realImageUrl: string): Promise<string | null> => {
  try {
    const ai = getClient();
    const model = "gemini-2.5-flash-image"; 
    
    // Convert the real image URL to base64 so we can pass it to Gemini
    const realImageBase64 = await urlToDataUrl(realImageUrl);
    const cleanBase64 = realImageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    // UPDATED PROMPT: Stricter adherence to subject.
    const prompt = "Create a photorealistic replica of this image. Keep the EXACT same subject, composition, angle, and lighting. Do not change the scene. The goal is to create a generated version that is extremely hard to distinguish from the original.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Companion Generation Error:", error);
    return null;
  }
};

// Fallback for when we can't use an input image (e.g. CORS issues)
export const generateAIImageFromTopic = async (topic: string): Promise<string | null> => {
    try {
      const ai = getClient();
      const model = "gemini-2.5-flash-image"; 
      
      const prompt = `Generate a candid, realistic smartphone photo of ${topic}. It should look like a raw photo taken by a human.`;
  
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [{ text: prompt }]
        }
      });
  
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith('image')) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

// Takes an existing image and creates a "Glitch" (Edit)
export const generateGlitchImage = async (base64Image: string): Promise<string | null> => {
  try {
    const ai = getClient();
    const model = "gemini-2.5-flash-image";

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    // UPDATED PROMPT: Explicitly request 5 distinct changes.
    const prompt = "Edit this image to make 5 DISTINCT and SEPARATE changes. The changes should be spread out across the image. Examples: change a color of an object, add a small item, remove a detail, warp a texture, modify a background element. The changes must be visible but integrated realistically. Output the image only.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
     if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    return null;
  }
};