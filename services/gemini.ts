import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();
const somevar =
  process.env.GEMINI_API_KEY ?? "";
if (!somevar) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(somevar);

// Types for session management
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  imageData?: string;
};

type SessionData = {
  messages: ChatMessage[];
  lastActive: number;
};

// Session management functions
const getSessionData = (): SessionData => {
  if (typeof window === "undefined")
    return { messages: [], lastActive: Date.now() 
  };

  const stored = localStorage.getItem("gemini-session");
  if (!stored) {
    return { messages: [], lastActive: Date.now() };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { messages: [], lastActive: Date.now() };
  }
};

export const updateSessionData = (newMessage: ChatMessage) => {
  if (typeof window === "undefined") return;

  const currentSession = getSessionData();
  const updatedSession: SessionData = {
    messages: [...currentSession.messages, newMessage],
    lastActive: Date.now(),
  };

  // Keep only last 10 messages to avoid context length issues
  if (updatedSession.messages.length > 10) {
    updatedSession.messages = updatedSession.messages.slice(-10);
  }

  localStorage.setItem("gemini-session", JSON.stringify(updatedSession));
};

export const isValidBase64Image = (imageData: string): boolean => {
  try {
    if (!imageData.startsWith("data:image/")) {
      return false;
    }

    const base64 = imageData.split(",")[1];
    if (!base64) {
      return false;
    }

    const sizeInBytes = (base64.length * 3) / 4;
    return sizeInBytes < 4 * 1024 * 1024;
  } catch {
    return false;
  }
};

export const analyzeImage = async (
  imageData: string,
  promptType: string
): Promise<string> => {
  // Changed return type to string
  try {
    if (!isValidBase64Image(imageData)) {
      throw new Error("Invalid image data");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const sessionData = getSessionData();

    // Build context from previous interactions
    let contextualPrompt = "";
    if (sessionData.messages.length > 0) {
      contextualPrompt = "Based on our previous conversation:\n";
      sessionData.messages.slice(-3).forEach((msg) => {
        if (!msg.imageData) {
          // Only include text exchanges in context
          contextualPrompt += `${msg.role}: ${msg.content}\n`;
        }
      });
      contextualPrompt += "\nNow, for the new image:\n";
    }

    let prompt;
    if (promptType === "explain_like_five") {
      prompt =
        contextualPrompt +
        "Explain this academic problem as if you were explaining it to a 5-year-old.";
    } else if (promptType === "step_by_step") {
      prompt =
        contextualPrompt +
        "Provide a clear, step-by-step solution for this academic problem. If there are multiple steps, please list them in order. Dont use any unnecessary symbols in maths related problems.";
    } else {
      prompt =
        contextualPrompt +
        "You are a helpful teaching assistant. Please analyze this image and provide a solution.";
    }

    prompt =
      prompt +
      "If the question is present return in the format: Question:\n Answer:\n (only use markdown and dont use any html tags) otherwise always return 'No question to solve' if there is any other image other than a question";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData.split(",")[1],
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const responseText = response.text();

    // Update session with new interaction
    updateSessionData({
      role: "user",
      content: "Uploaded an image for analysis",
      imageData: imageData,
      timestamp: Date.now(),
    });

    updateSessionData({
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
    });

    return responseText; // Return just the string response
  } catch (error) {
    console.error("Error analyzing image:", error);
    return error instanceof Error
      ? `Sorry, I encountered an error: ${error.message}. Please try again.`
      : "Sorry, I encountered an error while solving the question. Please try again.";
  }
};

export const analyzePrompt = async (prompt: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const sessionData = getSessionData();

    // Build context from previous interactions
    let contextualPrompt = "";
    if (sessionData.messages.length > 0) {
      contextualPrompt = "Based on our previous conversation:\n";
      sessionData.messages.slice(-3).forEach((msg) => {
        if (!msg.imageData) {
          // Only include text exchanges in context
          contextualPrompt += `${msg.role}: ${msg.content}\n`;
        }
      });
      contextualPrompt += "\nNow, for the new query:\n";
    }

    const promptText = contextualPrompt + prompt + "(only use markdown and dont use any html tags)";

    const result = await model.generateContent([promptText]);

    const response = await result.response;
    const responseText = response.text();

    // Update session with new interaction
    updateSessionData({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    });

    updateSessionData({
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
    });

    return responseText;
  } catch (error) {
    console.error("Error analyzing prompt:", error);
    return error instanceof Error
      ? `Sorry, I encountered an error: ${error.message}. Please try again.`
      : "Sorry, I encountered an error while solving the question. Please try again.";
  }
};

// Export function to clear session if needed
export const clearSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gemini-session");
  }
};

// Export function to get current session history
export const getSessionHistory = (): ChatMessage[] => {
  return getSessionData().messages;
};
