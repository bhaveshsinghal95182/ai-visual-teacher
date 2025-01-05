import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSessionHistory } from "./gemini";

const somevarkey = process.env.GEMINI_API_KEY ?? "AIzaSyCb0lNWMqQaSSPy6SXNp60oSwSYicprETY";
const genAI = new GoogleGenerativeAI(somevarkey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

export async function analyzePrompt(prompt: string): Promise<string> {
    const sessionHistory = getSessionHistory();
    const history = sessionHistory.map((msg) => ({
        content: msg.content,
        role: msg.role,
    }));
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
}
