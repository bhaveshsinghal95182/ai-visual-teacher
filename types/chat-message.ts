export type ChatMessage = {
  role: "user" | "assistant"; // Specifies if the message is from the user or the assistant
  content: string; // The text content of the message
  timestamp: number; // The time the message was sent, as a Unix timestamp
};
