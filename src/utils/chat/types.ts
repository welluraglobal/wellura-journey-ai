
// Define shared types for the chat functionality
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
