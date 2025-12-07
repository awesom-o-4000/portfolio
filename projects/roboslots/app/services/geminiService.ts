import { GoogleGenAI } from "@google/genai";
import { BattleResult, Robot } from "../types";
import { MOCK_ROBOT_IMAGES, MOCK_BATTLE_IMAGES } from "../constants";
import { calculatePower } from "./gameLogic";

export const generateBattleCommentary = async (
  result: BattleResult,
  playerRobot: Robot,
  enemyPower: number
): Promise<string> => {
  try {
    if (!process.env.API_KEY) throw new Error("No API Key");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const winnerName = result.winner === 'PLAYER' ? playerRobot.name : result.enemyName;
    const loserName = result.winner === 'PLAYER' ? result.enemyName : playerRobot.name;
    const turns = result.log.length;
    const playerPower = calculatePower(playerRobot);

    const prompt = `
      Write a short, high-energy, sci-fi sportscaster style summary (max 2 sentences) of a robot battle.
      Winner: ${winnerName} (Power: ${playerPower})
      Loser: ${loserName} (Power: ${enemyPower})
      Turns taken: ${turns}
      The match was intense. Mention a specific move if possible.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() ?? "The arena is silent. A victor stands.";
  } catch (error) {
    console.warn("Gemini generation failed or disabled. Using fallback.", error);
    const winQuotes = [
        "Unbelievable upset! The underdog takes the crown!",
        "Total domination in the arena today!",
        "Sparks flew and metal crunched, but only one remains standing!",
        "A tactical masterclass concluded with a devastating finisher."
    ];
    return winQuotes[Math.floor(Math.random() * winQuotes.length)];
  }
};

export const generateRobotImage = async (robot: Robot): Promise<string | undefined> => {
    try {
        if (!process.env.API_KEY) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const partsDesc = Object.values(robot.parts)
            .filter(p => p !== undefined)
            .map(p => `The robot has a ${p!.name} which looks like: ${p!.description}`)
            .join(". ");

        const prompt = `
            Create a high-fidelity 3D glossy render of a toy-like robot character.
            The robot MUST be built using these specific components:
            ${partsDesc}
            
            Material: Shiny plastic and clean metal textures.
            Lighting: Soft volumetric studio lighting, rim lighting.
            Style: High quality, 4k, digital art, toy photography, vibrant colors.
            The robot should be standing in a heroic pose.
            IMPORTANT: Render with a transparent background, PNG format. No background elements, no shadows.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return undefined;
    } catch (error) {
        console.warn("Image generation failed or disabled. Using fallback.", error);
        const randomIndex = Math.floor(Math.random() * MOCK_ROBOT_IMAGES.length);
        return MOCK_ROBOT_IMAGES[randomIndex];
    }
}

export const generateBattleImage = async (robot: Robot, enemyName: string, outcome: 'VICTORY' | 'DEFEAT'): Promise<string | undefined> => {
    try {
        if (!process.env.API_KEY) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const partsDesc = Object.values(robot.parts)
            .filter(p => p !== undefined)
            .map(p => p!.description)
            .join(", ");

        const actionPrompt = outcome === 'VICTORY' 
            ? "The robot is standing triumphantly over the defeated enemy, sparks flying, holding its weapon high." 
            : "The robot is heavily damaged, kneeling on the ground, with smoke rising from its joints and some armor plates missing or broken, while the enemy looms in the background.";

        const prompt = `
            A cinematic sports photography action shot of a robot battle.
            Main Robot Appearance: It is crucial that the robot is built from these exact parts: ${partsDesc}.
            Situation: ${actionPrompt}
            Opponent: ${enemyName}.
            
            Style: Dramatic, depth of field, motion blur, particle effects, high contrast, 4k resolution, Unreal Engine 5 render style.
            Perspective: Low angle dynamic shot.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return undefined;
    } catch (error) {
        console.warn("Battle image generation failed. Using fallback.", error);
        const randomIndex = Math.floor(Math.random() * MOCK_BATTLE_IMAGES.length);
        return MOCK_BATTLE_IMAGES[randomIndex];
    }
}

export const analyzeRobot = async (robot: Robot): Promise<string> => {
    try {
        if (!process.env.API_KEY) throw new Error("No API Key");

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const partsList = Object.values(robot.parts).map(p => p?.name).join(", ");
        const robotPower = calculatePower(robot);
        const prompt = `
          Analyze this battle mech configuration: ${partsList}. Total Power Level: ${robotPower}.
          Give a 1-sentence tactical assessment of its strengths or weaknesses in a cool sci-fi AI voice.
        `;
    
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
    
        return response.text?.trim() ?? "System Offline. Tactical analysis unavailable. Power levels nominal.";
      } catch (error) {
        console.warn("Gemini analysis failed or disabled.", error);
        return "System Offline. Tactical analysis unavailable. Power levels nominal.";
      }
}