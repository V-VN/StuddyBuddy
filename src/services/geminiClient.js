import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateText(prompt) {
  if (!genAI) {
    return "Gemini API key not configured. Please add VITE_GEMINI_API_KEY in .env.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error(err);
    return "Error while calling Gemini API.";
  }
}
