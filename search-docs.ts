import { GoogleGenAI } from "@google/genai";

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: "What is the correct API endpoint and headers for the paid Casa dos Dados API (https://casadosdados.com.br/)? Please search the web for their official API documentation and provide the base URL, endpoint for searching companies by CNAE/City, and the required authentication headers.",
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  console.log(response.text);
}

run();
