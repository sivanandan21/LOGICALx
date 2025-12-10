import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Difficulty, Puzzle, PuzzleType } from "../types";

// Initialize Gemini
// NOTE: In a real app, ensure process.env.API_KEY is defined. 
// For this demo, we assume the environment is set up correctly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PUZZLE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: "The puzzle question text." },
    codeSnippet: { type: Type.STRING, description: "Optional code snippet if relevant (e.g. for CodeSnippet type)." },
    options: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Array of 4 possible answers." 
    },
    correctAnswerIndex: { type: Type.INTEGER, description: "The index (0-3) of the correct answer." },
    explanation: { type: Type.STRING, description: "A detailed explanation of why the answer is correct." },
  },
  required: ["question", "options", "correctAnswerIndex", "explanation"],
};

export const generatePuzzle = async (difficulty: Difficulty, type?: PuzzleType): Promise<Puzzle> => {
  const modelId = "gemini-2.5-flash"; // Fast and capable for logic
  
  const selectedType = type || getRandomPuzzleType();
  
  const prompt = `
    Generate a unique ${difficulty} level logic puzzle for a programmer.
    The type of puzzle is: ${selectedType}.
    
    Context:
    - Beginner: Basic logic, simple loops, basic pattern recognition.
    - Intermediate: Data structures, recursion logic, complex patterns, boolean algebra.
    - Expert: Algorithm optimization logic, race conditions, complex system design riddles, obscure language quirks.
    
    Output strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PUZZLE_SCHEMA,
        systemInstruction: "You are a senior computer science professor creating curriculum for developers. Focus on clarity, accuracy, and educational value.",
        temperature: 0.8, // Slight creativity for puzzles
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    return {
      id: crypto.randomUUID(),
      difficulty,
      type: selectedType,
      xpReward: getXpReward(difficulty),
      ...data,
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback puzzle in case of API failure (graceful degradation)
    return {
      id: "fallback-1",
      difficulty: Difficulty.Beginner,
      type: PuzzleType.Logic,
      question: "The API seems tired. What is 2 + 2 in JavaScript string concatenation '2' + '2'?",
      options: ["4", "22", "NaN", "Error"],
      correctAnswerIndex: 1,
      explanation: "In JS, the + operator concatenates strings.",
      xpReward: 10,
    };
  }
};

const getRandomPuzzleType = (): PuzzleType => {
  const types = Object.values(PuzzleType);
  return types[Math.floor(Math.random() * types.length)];
};

const getXpReward = (diff: Difficulty): number => {
  switch (diff) {
    case Difficulty.Beginner: return 25;
    case Difficulty.Intermediate: return 50;
    case Difficulty.Expert: return 100;
  }
};