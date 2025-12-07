import { GoogleGenAI, Type } from "@google/genai";
import { GameLevel } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

// Simple UUID fallback for non-secure contexts
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Fetches prompts, sanitizes them, and returns a 5-word prompt array.
const getTargetPrompt = async (): Promise<string[]> => {
  if (!(window as any)._prompts) {
    try {
        const response = await fetch('./prompts.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        (window as any)._prompts = data.prompts;
    } catch (error) {
        console.error("Could not load local prompts.json, falling back.", error);
        // Fallback if the JSON file is missing.
        return ["a", "surreal", "dreamscape", "in", "space"];
    }
  }

  const prompts = (window as any)._prompts as string[];
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  // Sanitize and split
  return randomPrompt
    .toLowerCase()
    .replace(/[.,]/g, '') // Remove periods and commas
    .split(/\s+/) // Split by whitespace
    .filter(Boolean); // Remove empty strings
};


/**
 * Generates a game level:
 * 1. Fetches a 5-word prompt directly from the local JSON file.
 * 2. Uses a text model to create 20 distractors based on that prompt.
 * 3. Uses an image model to generate the image from that prompt.
 */
export const generateLevel = async (): Promise<GameLevel> => {
  const ai = createClient();
  
  let promptWords: string[] = [];
  let attempts = 0;
  const MAX_PROMPT_ATTEMPTS = 5;

  // Retry fetching a valid prompt if the first one is malformed
  while (attempts < MAX_PROMPT_ATTEMPTS) {
    promptWords = await getTargetPrompt();
    if (promptWords.length === 5) {
      break; // Found a valid prompt
    }
    attempts++;
    console.warn(`Attempt ${attempts}: Prompt "${promptWords.join(' ')}" is not 5 words long. Retrying...`);
  }

  if (promptWords.length !== 5) {
    console.error("Failed to find a valid 5-word prompt after multiple attempts.");
    // Provide a hardcoded fallback to prevent crashing the game
    promptWords = ["a", "surreal", "dreamscape", "in", "space"];
  }

  // Step 1: Generate the distractors
  const textModel = "gemini-2.5-flash";
  const textPrompt = `
    The user is playing a word game. The correct answer is the 5-word phrase: "${promptWords.join(' ')}".
    
    Your task is to generate 20 distractor words for this phrase.
    
    CRITICAL: The distractors MUST include:
    1. Thematically similar nouns, adjectives, or verbs.
    2. Common linking words (prepositions, conjunctions like "of", "in", "with", "and", "the").
    3. Words that are visually or conceptually similar but incorrect.
    
    The goal is to make the game challenging.
    
    Return strictly JSON.
  `;

  const textResponse = await ai.models.generateContent({
    model: textModel,
    contents: textPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          distractors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "20 distractor words including common linking words.",
          },
        },
        required: ["distractors"],
      },
    },
  });

  const textData = JSON.parse(textResponse.text || "{}");
  
  if (!textData.distractors) {
    throw new Error("Failed to generate valid distractor data");
  }
  const distractorWords: string[] = textData.distractors.map((w: string) => w.toLowerCase());
  
  // Combine and shuffle for the word bank
  const wordBank = [...promptWords, ...distractorWords].sort(() => 0.5 - Math.random());

  // Step 2: Generate the image
  const imagePrompt = promptWords.join(" ");
  
  const imageResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: imagePrompt,
    config: {}
  });

  let imageUrl = "";
  if (imageResponse.candidates?.[0]?.content?.parts) {
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!imageUrl) {
    throw new Error("Failed to generate image");
  }

  return {
    id: generateId(),
    imageUrl,
    targetPrompt: promptWords,
    wordBank,
  };
};