import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, DifficultyLevel } from '../types';

export const generateQuizFromText = async (
  ai: GoogleGenAI,
  text: string,
  difficulty: DifficultyLevel,
  modelName: string
): Promise<QuizQuestion[]> => {
  if (text.length > 30000) { // Gemini API context window limit consideration for gemini-flash
    text = text.substring(0, 30000); // Truncate text if too long
    console.warn("Input text was truncated to 30000 characters to fit model context window.");
  }
  
  const prompt = `
Based on the following text, generate a multiple-choice quiz with 5 questions.
The difficulty level should be ${difficulty}.
Each question should have exactly 4 options.
Provide the output in JSON format, as an array of objects. Each object MUST follow this exact structure:
{
  "question": "The question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0, 
  "explanation": "A brief explanation of why this answer is correct. If the text doesn't provide enough information for an explanation, state that the explanation is based on general knowledge related to the topic."
}
Ensure the "correctAnswerIndex" is a number between 0 and 3, corresponding to the index in the "options" array.
Ensure the "options" array always contains exactly 4 string elements.
Ensure the "explanation" is concise.

Text:
---
${text}
---
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Temperature can be adjusted. Lower for more factual, higher for more creative/varied.
        // For quizzes, slightly lower might be better.
        temperature: 0.5 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.every(isValidQuizQuestion)) {
      return parsedData as QuizQuestion[];
    } else {
      console.error("Parsed data is not a valid array of quiz questions:", parsedData);
      throw new Error("The AI returned data in an unexpected format. Please try again.");
    }
  } catch (error) {
    console.error("Error generating quiz from Gemini:", error);
    if (error instanceof Error && error.message.includes("JSON.parse")) {
        throw new Error("The AI's response was not valid JSON. The content might be too complex or the AI service might be having issues.");
    }
    throw error; // Re-throw other errors
  }
};

// Type guard for QuizQuestion
const isValidQuizQuestion = (item: any): item is QuizQuestion => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.question === 'string' &&
    Array.isArray(item.options) &&
    item.options.length === 4 && // Ensure exactly 4 options
    item.options.every((opt: any) => typeof opt === 'string') &&
    typeof item.correctAnswerIndex === 'number' &&
    item.correctAnswerIndex >= 0 && item.correctAnswerIndex < item.options.length &&
    (typeof item.explanation === 'string' || typeof item.explanation === 'undefined')
  );
};
