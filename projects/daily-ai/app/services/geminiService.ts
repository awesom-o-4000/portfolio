import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DailyUpdate, AIAnalysisResult, MeetingStatus, AVATAR_COLORS, DayRecord } from "../types";

const apiKey = process.env.API_KEY || '';

// Fallback logic if API key is missing or fails
const getFallbackAnalysis = (updates: DailyUpdate[]): AIAnalysisResult => {
  const activeUpdates = updates.filter(u => !u.isDayOff);
  
  if (activeUpdates.length === 0) {
     return {
      status: MeetingStatus.CANCELLED,
      summary: "Whole team is off.",
      reasoning: "No active team members today.",
      priorityItems: []
    };
  }

  const avgScore = activeUpdates.reduce((a, b) => a + b.necessityScore, 0) / activeUpdates.length;
  const highScorers = activeUpdates.filter(u => u.necessityScore > 7).map(u => u.user);
  
  return {
    status: avgScore > 6 ? MeetingStatus.CONFIRMED : MeetingStatus.CANCELLED,
    summary: `Avg score ${avgScore.toFixed(1)}/10. ${highScorers.length > 0 ? `${highScorers.join(', ')} need sync.` : 'Most work is async.'}`,
    reasoning: avgScore > 6 
      ? "Several team members have high-priority items."
      : "Routine work detected. Sync not required.",
    priorityItems: activeUpdates.filter(u => u.blockers && u.blockers !== 'None').map(u => `${u.user}: ${u.blockers}`)
  };
};

/**
 * Executes a Gemini API call with exponential backoff for rate limits (429) and server errors (5xx).
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  let delay = 1000; // Start with 1 second

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      // Extract status code from various possible error structures
      const status = error?.status || error?.response?.status || error?.code || 0;
      
      // Check if error is retryable (429 Too Many Requests or 5xx Server Errors)
      const isRetryable = status === 429 || status === 503 || status >= 500;
      
      if (!isRetryable || attempt >= maxRetries) {
        throw error;
      }

      console.warn(`Gemini API Error (${status}). Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries})...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
      attempt++;
    }
  }
}

// New function to transcribe audio and split into fields
export const transcribeAudio = async (base64Audio: string): Promise<{ yesterday: string, today: string, blockers: string }> => {
  if (!apiKey) {
    console.warn("No API Key for transcription");
    return { yesterday: "Audio transcription unavailable (No API Key)", today: "", blockers: "" };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Helper prompt to force JSON structure from raw audio
  const prompt = `
    Listen to this daily standup update. 
    Extract what the user did yesterday, what they are doing today, and any blockers.
    Return JSON.
  `;

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: base64Audio } }, // Assuming wav/webm from MediaRecorder
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            yesterday: { type: Type.STRING },
            today: { type: Type.STRING },
            blockers: { type: Type.STRING }
          }
        }
      }
    }));

    return JSON.parse(response.text!) as { yesterday: string, today: string, blockers: string };
  } catch (e) {
    console.error("Transcription failed", e);
    return { yesterday: "Transcription failed (Please try again)", today: "", blockers: "" };
  }
};

export const analyzeUpdates = async (updates: DailyUpdate[]): Promise<AIAnalysisResult> => {
  const activeUpdates = updates.filter(u => !u.isDayOff);
  
  if (activeUpdates.length === 0) {
    return {
      status: MeetingStatus.CANCELLED,
      summary: "Everyone is off today! 🌴",
      reasoning: "No active updates submitted.",
      priorityItems: []
    };
  }

  if (!apiKey) {
    console.warn("No API Key provided, using fallback analysis logic.");
    // Simulate delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return getFallbackAnalysis(updates);
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare multimodal content
  let textPrompt = `
    Analyze these standup updates to decide if a 15-min sync meeting is necessary.
    Ignore users who are OFF.
    
    Criteria:
    - CONFIRMED if avg score of ACTIVE users > 6 OR critical blockers exist.
    - CANCELLED if routine work and low scores.
    
    Output JSON:
    {
      "status": "CONFIRMED" | "CANCELLED",
      "summary": "Friendly, short summary (max 10 words).",
      "reasoning": "Brief reason why.",
      "priorityItems": ["List critical blockers only"]
    }

    Updates:
  `;

  const parts: any[] = [];

  updates.forEach(u => {
    if (u.isDayOff) {
      textPrompt += `\n[${u.user}] is OFF today.`;
    } else {
      textPrompt += `\n
      [${u.user} - ${u.role}]
      Score: ${u.necessityScore}/10
      Work: ${u.today}
      Blockers: ${u.blockers}
      ${u.attachments?.length ? `(User attached ${u.attachments.length} images/files)` : ''}
      `;

      // If there are image attachments, add them to the prompt for context
      if (u.attachments) {
        u.attachments.forEach(att => {
          if (att.type === 'image' && att.url.startsWith('data:image')) {
             try {
               const base64Data = att.url.split(',')[1];
               const mimeType = att.url.substring(att.url.indexOf(':') + 1, att.url.indexOf(';'));
               parts.push({ inlineData: { mimeType, data: base64Data } });
             } catch (err) {
               console.warn("Failed to process attachment for analysis", err);
             }
          }
        });
      }
    }
  });

  // Add the text prompt at the end
  parts.push({ text: textPrompt });

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: [MeetingStatus.CANCELLED, MeetingStatus.CONFIRMED] },
            summary: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            priorityItems: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }));

    const parsed = JSON.parse(response.text!);
    
    return {
      ...parsed,
      priorityItems: Array.isArray(parsed.priorityItems) ? parsed.priorityItems : []
    } as AIAnalysisResult;

  } catch (error: any) {
    const isQuotaError = error?.status === 429 || error?.code === 429;
    if (isQuotaError) {
      console.warn("Gemini Quota Exceeded. Switching to fallback logic.");
    } else {
      console.error("Gemini Analysis Failed", error);
    }
    return getFallbackAnalysis(updates);
  }
};

export const generateInitialTeam = (): DailyUpdate[] => {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    { id: '1', user: 'Alex', role: 'Product Manager', avatarColor: AVATAR_COLORS[0], yesterday: 'Roadmap review', today: 'Q3 Planning planning', blockers: 'None', necessityScore: 8, timestamp: Date.now(), date: today, isDayOff: false, comments: [] },
    { id: '2', user: 'Sarah', role: 'Frontend Lead', avatarColor: AVATAR_COLORS[1], yesterday: 'Auth flow spec', today: 'Implementing new login UI', blockers: 'Waiting on API docs', necessityScore: 5, timestamp: Date.now(), date: today, isDayOff: false, comments: [] },
    { id: '3', user: 'Mike', role: 'Backend Eng', avatarColor: AVATAR_COLORS[2], yesterday: 'DB migrations', today: 'Optimizing query performance', blockers: 'None', necessityScore: 3, timestamp: Date.now(), date: today, isDayOff: false, comments: [] },
    { id: '4', user: 'Jessica', role: 'UX Designer', avatarColor: AVATAR_COLORS[3], yesterday: 'User interviews', today: 'High-fidelity mockups', blockers: 'None', necessityScore: 2, timestamp: Date.now(), date: today, isDayOff: false, comments: [] },
    { id: '5', user: 'David', role: 'DevOps', avatarColor: AVATAR_COLORS[4], yesterday: 'CI pipeline fix', today: 'Terraform refactor', blockers: 'AWS limit reached', necessityScore: 9, timestamp: Date.now(), date: today, isDayOff: false, comments: [] },
    { id: '6', user: 'Emily', role: 'QA Engineer', avatarColor: AVATAR_COLORS[5], yesterday: 'Regression testing', today: 'Writing E2E tests', blockers: 'Staging env unstable', necessityScore: 7, timestamp: Date.now(), date: today, isDayOff: false, comments: [] },
    { id: '7', user: 'Chris', role: 'Mobile Dev', avatarColor: AVATAR_COLORS[6], yesterday: 'App store submission', today: 'Crash analytics', blockers: 'None', necessityScore: 4, timestamp: Date.now(), date: today, isDayOff: false, comments: [] },
    { id: '8', user: 'Sam', role: 'Data Scientist', avatarColor: AVATAR_COLORS[7], yesterday: 'Model training', today: 'Data cleaning pipeline', blockers: 'None', necessityScore: 6, timestamp: Date.now(), date: today, isDayOff: true, comments: [] },
  ];
};

export const generateHistory = (): DayRecord[] => {
  const history: DayRecord[] = [];
  const today = new Date();
  
  // Generate 365 days of history for the analytics view
  for (let i = 1; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    
    // Random status generation with a slight bias towards meetings on Mondays (1) and Fridays (5)
    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    const dayOfWeek = d.getDay();
    let meetingProb = 0.6;
    
    if (dayOfWeek === 1) meetingProb = 0.8; // Monday meetings likely
    if (dayOfWeek === 5) meetingProb = 0.4; // Friday meetings unlikely
    
    const isMeeting = Math.random() < meetingProb;
    
    if (!isWeekend) {
      history.push({
        date: dateStr,
        status: isMeeting ? MeetingStatus.CONFIRMED : MeetingStatus.CANCELLED,
        avgScore: isMeeting ? 7.5 + Math.random() * 2 : 3 + Math.random() * 3,
        summary: isMeeting ? "Critical sync required." : "Async work sufficient.",
        updates: []
      });
    }
  }
  return history;
};