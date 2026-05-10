import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });
};

const generateGeminiContent = async (prompt) => {

  const model = getGeminiModel();

  const result = await model.generateContent(prompt);

  return result.response
  .text()
  .replace(/```json|```/g, "")
  .trim();
};

export {
  generateGeminiContent
};