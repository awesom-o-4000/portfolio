import { AnalysisSection } from './types';

export const PICSUM_BASE = "https://picsum.photos/500/500";

// Simulation of the "Phase 1 & 4" Output requested by the prompt
export const ARCHITECT_ANALYSIS: AnalysisSection[] = [
  {
    title: "PHASE 1: CRITICAL GDD ANALYSIS",
    content: "Evaluation of 'Real or AI?' core loops and failure vectors.",
    items: [
      {
        label: "Failure Mode 1: User Retention (The 'Boredom Wall')",
        text: "Users typically fatigue after ~50 binary choices. SOLUTION: Implement 'Narrative Layers'. Instead of random images, group them into 'Operations' (e.g., 'Operation Deepfake: Celebrities', 'Operation Biome: Nature'). Unlocking new operations requires high accuracy."
      },
      {
        label: "Failure Mode 2: Technical Cost vs. Latency",
        text: "Real-time generation for every user is cost-prohibitive ($0.002/image adds up). SOLUTION: Use a 'Hybrid Cache' system. Pre-generate 90% of content (Tier 1). Only use real-time generation (Tier 2) for 'Glitch Mode' or high-stakes 'Boss Levels' to manage margins."
      },
      {
        label: "Failure Mode 3: Anti-Cheat (Glitch Mode)",
        text: "Users might inspect network traffic to find the difference mask. SOLUTION: Server-side validation is mandatory in production. For this prototype, we use client-side pixel-diffing on the Canvas, but in prod, coordinates should be hashed and verified remotely."
      }
    ]
  },
  {
    title: "PHASE 2: GLITCH MODE STRATEGY",
    content: "Technical implementation for the 'Find the Differences' engine.",
    items: [
      {
        label: "In-painting Pipeline",
        text: "Utilizing Gemini 2.5 Flash Image. We convert the user's upload to Base64, prompt the model to 'Modify one subtle detail: change color, add an object, or warp a texture' while maintaining the original composition."
      },
      {
        label: "Masking & Detection",
        text: "We calculate the difference map (Delta E) between the Original and AI-modified image. We compute the centroid of the changed pixels to create a dynamic 'Hit Box'. If the user's click falls within radius R of the centroid, score = success."
      }
    ]
  },
  {
    title: "PHASE 4: MONETIZATION & HOOKS",
    content: "Driving DAU through psychological loops.",
    items: [
      {
        label: "Hook 1: The Humanity Score (Identity)",
        text: "A rolling percentage showing how 'Human' you are based on detection accuracy. 'You are in the top 1% of observers.' People defend their identity."
      },
      {
        label: "Hook 2: Asymmetric PvP (Glitch Bounty)",
        text: "Players create glitches. If other players FAIL to find the difference, the Creator earns credits. This outsources content generation to the user base (scalable)."
      },
      {
        label: "Hook 3: Collective Defense",
        text: "Global progress bar: 'AI Deception Rate vs. Human Detection Rate'. A weekly community goal to keep Human Detection above 50% grants server-wide buffs."
      }
    ]
  }
];