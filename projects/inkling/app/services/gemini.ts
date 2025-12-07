import { GoogleGenAI } from "@google/genai";

// Helper to remove data:image/png;base64, prefix for API calls
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1] || dataUrl;
};

// Supported Aspect Ratios by the Model
const SUPPORTED_RATIOS = {
  "1:1": 1,
  "3:4": 3 / 4,
  "4:3": 4 / 3,
  "9:16": 9 / 16,
  "16:9": 16 / 9,
};

// Calculate closest supported aspect ratio
export const getClosestAspectRatio = (width: number, height: number): string => {
  const targetRatio = width / height;
  let closest = "1:1";
  let minDiff = Infinity;

  for (const [ratioStr, ratioVal] of Object.entries(SUPPORTED_RATIOS)) {
    const diff = Math.abs(targetRatio - ratioVal);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ratioStr;
    }
  }
  return closest;
};

/**
 * Prepares an image for the Gemini model by:
 * 1. Loading it
 * 2. Determining closest supported aspect ratio
 * 3. Cropping the image to EXACTLY match that ratio (Center Crop)
 * 4. Resizing to a safe max dimension (1024px)
 * 
 * This prevents the model from reframing/shifting the content.
 */
export const prepareImageForModel = (base64Str: string): Promise<{ processedBase64: string, aspectRatio: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const srcW = img.width;
      const srcH = img.height;

      // 1. Determine Target Ratio
      const ratioKey = getClosestAspectRatio(srcW, srcH);
      const targetRatio = SUPPORTED_RATIOS[ratioKey as keyof typeof SUPPORTED_RATIOS];

      // 2. Calculate Crop Dimensions (Center Crop)
      let cropW = srcW;
      let cropH = srcH;

      if (srcW / srcH > targetRatio) {
        // Source is wider than target -> Crop Width
        cropW = srcH * targetRatio;
      } else {
        // Source is taller than target -> Crop Height
        cropH = srcW / targetRatio;
      }

      // 3. Resize logic (Max 1024px)
      const MAX_SIZE = 1024;
      let finalW = cropW;
      let finalH = cropH;

      if (finalW > MAX_SIZE || finalH > MAX_SIZE) {
        const scale = MAX_SIZE / Math.max(finalW, finalH);
        finalW *= scale;
        finalH *= scale;
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw crop center
      const offsetX = (srcW - cropW) / 2;
      const offsetY = (srcH - cropH) / 2;

      ctx.drawImage(
        img,
        offsetX, offsetY, cropW, cropH, // Source Crop
        0, 0, finalW, finalH            // Dest Size
      );

      resolve({
        processedBase64: canvas.toDataURL('image/jpeg', 0.95), // High quality
        aspectRatio: ratioKey
      });
    };
    img.onerror = (e) => reject(e);
  });
};

const getClient = () => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const describeTattooImage = async (imageBase64: string): Promise<string> => {
  const ai = getClient();
  if (!ai) throw new Error("API Key missing. Please set your key in the environment.");

  const { processedBase64 } = await prepareImageForModel(imageBase64);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64(processedBase64)
            }
          },
          {
            text: "Act as a professional tattoo artist. Analyze the style, subject matter, and artistic technique of this image. Provide a concise, creative prompt (max 2 sentences) that could be used to generate a tattoo design in this exact style."
          }
        ]
      }
    });

    return response.text || "A unique custom tattoo design based on the reference.";
  } catch (error) {
    console.error("Description error:", error);
    return "A creative tattoo design based on the uploaded image.";
  }
};

export const generateTattooDesign = async (
  prompt: string,
  style: string,
  referenceImage?: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) throw new Error("API Key missing.");
  if (!ai) throw new Error("API Key missing.");

  let fullPrompt = `Create a professional tattoo design.
  Concept: "${prompt}".
  ${style ? `Style: ${style}.` : 'Style: Choose the most aesthetically appropriate tattoo style for this concept.'}
  
  CRITICAL REQUIREMENTS:
  1. Output MUST be a clean, high-contrast design on a pure WHITE background.
  2. Do NOT include human skin, body parts, realistic rooms, or tools. Just the artwork.
  3. The design should be suitable for a stencil.
  `;

  if (referenceImage) {
    fullPrompt += `\n4. Use the attached image as a visual reference. Transform it into the requested style while keeping the main subject matter.`;
  }

  const parts: any[] = [{ text: fullPrompt }];
  let aspectRatio = "1:1";

  if (referenceImage) {
    // We use the new helper to ensure ratio match
    const prep = await prepareImageForModel(referenceImage);
    aspectRatio = prep.aspectRatio;

    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64(prep.processedBase64)
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};

/**
 * Takes a rough composite (Tattoo simply overlaid on Body) and uses Gemini
 * to blend it realistically into the skin.
 */
export const compositeTattooOnBody = async (
  compositeImageBase64: string
): Promise<string> => {
  const ai = getClient();

  // 1. Pre-process input to EXACTLY match supported aspect ratio
  // This prevents the AI from cropping/reframing and moving the tattoo
  const { processedBase64, aspectRatio } = await prepareImageForModel(compositeImageBase64);

  // Strict prompt for the Flash model
  // Refined to minimize hallucination and forcing it to stick to the input pixels
  const prompt = `
  STRICT IMAGE EDITING TASK:
  Input: A photo of a person with a tattoo overlaid on their body (composite image).
  Output: The EXACT same photo, but with the tattoo texture blended realistically into the skin.

  RULES:
  1. PIXEL PERFECT: Do NOT change the position, size, or shape of the tattoo. 
  2. Do NOT change the background, the body, or the lighting.
  3. COLOR RETENTION: The tattoo MUST remain BRIGHT, VIVID, and COLORFUL. Do NOT make it dark or transparent. It should look like fresh ink.
  4. The aspect ratio and framing must remain IDENTICAL to the input.
  5. Act as a "texture blender" only. Do not hallucinate new objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64(processedBase64)
            }
          },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio, // Now guaranteed to match input dimensions
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No composite image generated.");

  } catch (error) {
    console.error("Try-on error:", error);
    throw error;
  }
};