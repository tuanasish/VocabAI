import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GeneratedSet, QuizQuestion } from "../types";

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    category: { type: SchemaType.STRING },
                    level: { type: SchemaType.STRING },
                    icon: { type: SchemaType.STRING },
                    words: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                word: { type: SchemaType.STRING },
                                phonetic: { type: SchemaType.STRING },
                                type: { type: SchemaType.STRING },
                                meaning: { type: SchemaType.STRING },
                                example: { type: SchemaType.STRING }
                            },
                            required: ["word", "phonetic", "type", "meaning", "example"]
                        }
                    }
                },
                required: ["title", "description", "category", "level", "icon", "words"]
            }
        }
    });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("AI Response received:", text);

        if (!text) {
            throw new Error("No response from AI");
        }

        const generatedSet = JSON.parse(text) as GeneratedSet;
        console.log("Parsed generated set:", generatedSet);

        // Validate the response
        if (!generatedSet.words || generatedSet.words.length === 0) {
            throw new Error("No words generated");
        }

        return generatedSet;
    } catch (error: any) {
        console.error("Detailed error generating vocabulary set:", error);
        console.error("Error message:", error.message);

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

export async function generateQuiz(
    words: { word: string; meaning: string }[],
    count: number = 5,
    type: 'multiple-choice' | 'fill-in-blank' = 'multiple-choice'
): Promise<QuizQuestion[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("API key is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        question: { type: SchemaType.STRING },
                        options: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING }
                        },
                        correctAnswer: { type: SchemaType.STRING }
                    },
                    required: ["question", "options", "correctAnswer"]
                }
            }
        }
    });

    const wordsList = words.map(w => `${w.word}: ${w.meaning}`).join("\n");

    let prompt = "";
    if (type === 'multiple-choice') {
        prompt = `Create a multiple-choice quiz with ${count} questions based on the following words. 
        For each question, provide a definition or context and ask for the correct word, OR provide a word and ask for the correct definition.
        Ensure there are 4 options for each question, and only one is correct.
        
        Words:
        ${wordsList}`;
    } else {
        prompt = `Create a fill-in-the-blank quiz with ${count} questions based on the following words.
        For each question, provide a sentence with the target word missing (represented by _____).
        Provide 4 options for the missing word.
        
        Words:
        ${wordsList}`;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text) as QuizQuestion[];
    } catch (error: any) {
        console.error("Error generating quiz:", error);
        throw new Error(error.message || "Failed to generate quiz");
    }
}

export async function generateRoleplayScenario(
    topic: string,
    words: { word: string; meaning: string }[]
): Promise<import("../types").RoleplayScenario> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("API key is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    persona: { type: SchemaType.STRING },
                    scenario: { type: SchemaType.STRING },
                    initialMessage: { type: SchemaType.STRING }
                },
                required: ["persona", "scenario", "initialMessage"]
            }
        }
    });

    const wordsList = words.map(w => w.word).join(", ");

    const prompt = `Create a roleplay scenario for learning English vocabulary about "${topic}".
    Target words: ${wordsList}.
    
    1. Define a persona for the AI to play (e.g., "Hotel Receptionist", "Job Interviewer").
    2. Describe the scenario (e.g., "Checking into a hotel", "Discussing a project").
    3. Write an engaging initial message from the AI to start the conversation, using one of the target words if natural.
    
    Return JSON.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text) as import("../types").RoleplayScenario;
    } catch (error: any) {
        console.error("Error generating roleplay scenario:", error);
        throw new Error(error.message || "Failed to generate roleplay scenario");
    }
}

export async function generateStory(
    words: { word: string; meaning: string }[]
): Promise<{ title: string; content: string }> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("API key is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    content: { type: SchemaType.STRING }
                },
                required: ["title", "content"]
            }
        }
    });

    const wordsList = words.map(w => `${w.word} (${w.meaning})`).join(", ");

    const prompt = `Write a short, engaging story (approx. 200-300 words) that naturally incorporates the following vocabulary words: ${wordsList}.
    
    1. The story should be coherent and interesting.
    2. Highlight the target words in the story by wrapping them in **double asterisks** (e.g., **word**).
    3. Provide a catchy title for the story.
    
    Return JSON with "title" and "content".`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text) as { title: string; content: string };
    } catch (error: any) {
        console.error("Error generating story:", error);
        throw new Error(error.message || "Failed to generate story");
    }
}
