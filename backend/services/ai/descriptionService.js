import {
  generateGeminiContent
} from "./geminiService.js";

import {
  generateGroqContent
} from "./groqService.js";

const generateDescriptionService = async ({
  name,
  category,
  subCategory
}) => {

  if (!name) {

    return {
      success: false,
      message: "Product name is required"
    };
  }

  const prompt = `
Write a premium product description (max 40 words).
Do not wrap the response in quotes.

Product:
${name}, ${category}, ${subCategory}
`;

  // GEMINI
  try {

    const description =
      await generateGeminiContent(prompt);

    console.log(
      "Task Completed Successfully with Gemini"
    );

    return {
      success: true,
      description
    };

  } catch (geminiError) {

    console.log(
      "⚠️ Gemini failed, switching to Groq..."
    );
  }

  // GROQ FALLBACK
  try {

    const description =
      await generateGroqContent({
        userPrompt: prompt,
        temperature: 0.7,
        maxTokens: 100
      });

    console.log(
      "Task Completed Successfully with Groq"
    );

    return {
      success: true,
      description
    };

  } catch (groqError) {

    console.error(
      "❌ Groq also failed:",
      groqError.message
    );

    return {
      success: false,
      message: "Failed to generate description"
    };
  }
};

export default generateDescriptionService;