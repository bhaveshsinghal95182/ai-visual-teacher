import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBxWhvNTqMVfm2Xb4Hb9Kx5m9TqK56pSBY");

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
  try {
    if (!isValidBase64Image(imageData)) {
      throw new Error("Invalid image data");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let prompt;
    if (promptType === "explain_like_five") {
      prompt =
        "Explain this academic problem as if you were explaining it to a 5-year-old.";
    } else if (promptType === "step_by_step") {
      prompt =
        "Provide a clear, step-by-step solution for this academic problem. If there are multiple steps, please list them in order. Dont use any unnecessary symbols in maths related problems.";
    } else {
      prompt =
        "You are a helpful teaching assistant. Please analyze this image and provide a solution.";
    }
    prompt =
      prompt +
      "always return 'No question to solve' if there is any other image other than a question";

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
    return response.text();
  } catch (error) {
    console.error("Error analyzing image:", error);
    if (error instanceof Error) {
      return `Sorry, I encountered an error: ${error.message}. Please try again.`;
    }
    return "Sorry, I encountered an error while solving the question. Please try again.";
  }
};
