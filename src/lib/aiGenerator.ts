import { GoogleGenAI, Type } from "@google/genai";

export type GeneratedWord = {
    word: string;
    phonetic: string;
    type: string;
    meaning: string;
    example: string;
};

export type GeneratedSet = {
    title: string;
    description: string;
    category: string;
    level: string;
    icon: string;
    words: GeneratedWord[];
};

export async function generateVocabularySet(
    topic: string,
    level: 'Beginner' | 'Intermediate' | 'Advanced',
    wordCount: number
): Promise<GeneratedSet> {
    // Get API key from environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is not set in environment variables");
        throw new Error("API key is not configured. Please check your .env.local file.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a vocabulary set for learning English on the topic: "${topic}"
Difficulty level: ${level}
Number of words: ${wordCount}

Create a comprehensive vocabulary set with:
1. A descriptive title for the set
2. A brief description of what learners will gain
3. Select the MOST APPROPRIATE category based on the topic:
   - Use "Travel" for: travel, tourism, vacation, airport, hotel, transportation topics
   - Use "Business" for: business, work, office, career, finance, marketing topics
   - Use "Academic" for: school, university, education, science, research topics
   - Use "Technology" for: computers, internet, software, programming, digital topics
   - Use "General" ONLY if the topic doesn't fit any of the above categories
4. An appropriate Material Symbols icon name that matches the topic (e.g., "flight" for travel, "business_center" for business, "school" for academic, "computer" for technology, "restaurant" for food, "sports_soccer" for sports)
5. ${wordCount} relevant words with:
   - The word itself
   - Phonetic pronunciation in IPA format (e.g., /ˈwɜːrd/)
   - Part of speech (noun, verb, adjective, adverb, etc.)
   - Clear, concise definition
   - Natural example sentence using the word

Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "description": "string", 
  "category": "string (MUST be one of: General, Academic, Business, Travel, Technology - choose the most fitting one)",
  "level": "${level}",
  "icon": "string (Material Symbols icon name)",
  "words": [
    {
      "word": "string",
      "phonetic": "string",
      "type": "string",
      "meaning": "string",
      "example": "string"
    }
  ]
}`;

    try {
        console.log("Generating vocabulary set for topic:", topic);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        category: { type: Type.STRING },
                        level: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        words: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    phonetic: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    meaning: { type: Type.STRING },
                                    example: { type: Type.STRING }
                                },
                                required: ["word", "phonetic", "type", "meaning", "example"]
                            }
                        }
                    },
                    required: ["title", "description", "category", "level", "icon", "words"]
                }
            }
        });

        console.log("AI Response received:", response);

        if (!response.text) {
            console.error("No text in AI response:", response);
            throw new Error("No response from AI");
        }

        const generatedSet = JSON.parse(response.text) as GeneratedSet;
        console.log("Parsed generated set:", generatedSet);

        // Validate the response
        if (!generatedSet.words || generatedSet.words.length === 0) {
            throw new Error("No words generated");
        }

        return generatedSet;
    } catch (error: any) {
        console.error("Detailed error generating vocabulary set:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        // Provide more specific error messages
        if (error.message?.includes("API key")) {
            throw new Error("Invalid API key. Please check your Gemini API key configuration.");
        } else if (error.message?.includes("quota")) {
            throw new Error("API quota exceeded. Please try again later.");
        } else if (error.message?.includes("network")) {
            throw new Error("Network error. Please check your internet connection.");
        }

        throw new Error(`Failed to generate vocabulary set: ${error.message || "Unknown error"}`);
    }
}
