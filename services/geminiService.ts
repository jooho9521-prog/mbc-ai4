
import { GoogleGenAI, Type } from "@google/genai";
import { Song, RecommendationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SONG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    songs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          genre: { type: Type.STRING },
          isKorean: { type: Type.BOOLEAN },
          recommendationReason: { type: Type.STRING, description: "Why this song fits the commute theme in 1 sentence." }
        },
        required: ["title", "artist", "genre", "isKorean", "recommendationReason"]
      }
    },
    dailyThemeTitle: { type: Type.STRING, description: "A catchy title for this specific set of 7 songs." }
  },
  required: ["songs", "dailyThemeTitle"]
};

export async function fetchMusicRecommendations(userTheme: string): Promise<RecommendationResponse> {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Recommend 7 music tracks for a subway or bus commute based on this theme/genre: "${userTheme}". 
    CRITICAL REQUIREMENTS:
    1. Exactly 7 tracks.
    2. Ratio: 5 tracks MUST be Korean (K-Pop, K-Indie, K-HipHop etc.) and 2 tracks MUST be International (Pop, Rock, R&B etc.) to maintain a 70:30 ratio.
    3. The songs should be suitable for public transport listening (commute-friendly vibes).
    4. Provide the result in the specified JSON schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: SONG_SCHEMA
    }
  });

  const response = await model;
  const resultText = response.text || "{}";
  return JSON.parse(resultText) as RecommendationResponse;
}
