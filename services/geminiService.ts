
import { GoogleGenAI, Type } from "@google/genai";
import { Song, RecommendationResponse } from "../types";

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
          recommendationReason: { type: Type.STRING }
        },
        required: ["title", "artist", "genre", "isKorean", "recommendationReason"]
      }
    },
    dailyThemeTitle: { type: Type.STRING }
  },
  required: ["songs", "dailyThemeTitle"]
};

export async function fetchMusicRecommendations(userTheme: string): Promise<RecommendationResponse> {
  // Ensure the API key is retrieved directly from process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Use the recommended initialization pattern
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `당신은 전문 음악 큐레이터입니다. 다음 테마에 어울리는 출퇴근길 음악 7곡을 추천해주세요: "${userTheme}".
          
          제한 사항 (매우 중요):
          1. 정확히 7곡의 목록을 만드세요.
          2. 한국 노래 5곡 (isKorean: true), 해외 노래 2곡 (isKorean: false)의 비율을 반드시 지키세요.
          3. "recommendationReason"은 한국어로, 대중교통 이용객에게 힘이 되는 따뜻한 문장으로 작성하세요.
          4. 반드시 지정된 JSON 스키마 형식으로만 응답하세요.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: SONG_SCHEMA
      }
    });

    // Extract text using the .text property (not a method)
    const resultText = response.text;
    if (!resultText) {
      throw new Error("EMPTY_RESPONSE");
    }
    
    return JSON.parse(resultText) as RecommendationResponse;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    throw error;
  }
}
