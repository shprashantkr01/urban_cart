import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const generateGroqContent = async ({
  systemPrompt = "",
  userPrompt = "",
  temperature = 0,
  maxTokens = 150
}) => {

  const completion =
    await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      temperature,

      max_tokens: maxTokens,

      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

  return completion
    .choices[0]
    .message.content
    .trim();
};

export {
  generateGroqContent
};