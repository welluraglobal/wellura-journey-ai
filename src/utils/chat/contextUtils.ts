
import { Message } from "./types";

// Helper function for generating context-aware responses
export const generateContextAwareResponse = (
  message: string,
  firstName: string,
  language: "pt" | "es" | "en",
  mainGoal?: string,
  messageHistory?: Message[]
): string | null => {
  // This function would contain more sophisticated logic to analyze conversation context
  const lowerMessage = message.toLowerCase();
  
  // Check if this is related to previous messages
  if (messageHistory && messageHistory.length > 1) {
    const lastTwoMessages = messageHistory.slice(-2);
    
    // Check for simple affirmative responses like "yes" to previous questions
    if (lowerMessage === "yes" || lowerMessage === "sim" || lowerMessage === "sí") {
      const previousAssistantMessage = messageHistory.filter(msg => msg.role === "assistant").pop();
      
      if (previousAssistantMessage) {
        const prevContent = previousAssistantMessage.content.toLowerCase();
        
        // If previous message was about a workout or nutrition plan
        if (prevContent.includes("plan") || prevContent.includes("plano") || 
            prevContent.includes("workout") || prevContent.includes("treino") || 
            prevContent.includes("diet") || prevContent.includes("dieta")) {
            
          const responses = {
            pt: `Excelente, ${firstName}! Vou criar um plano personalizado baseado no seu perfil. Você prefere começar com exercícios mais leves ou está pronto para um desafio mais intenso?`,
            es: `¡Excelente, ${firstName}! Crearé un plan personalizado basado en tu perfil. ¿Prefieres empezar con ejercicios más ligeros o estás listo para un desafío más intenso?`,
            en: `Excellent, ${firstName}! I'll create a personalized plan based on your profile. Do you prefer to start with lighter exercises or are you ready for a more intense challenge?`
          };
          
          return responses[language];
        }
      }
    }
  }
  
  // No special context identified
  return null;
};

// Helper function to generate simple and natural emojis based on context
export const getContextualEmoji = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (/happy|feliz|alegr|smile|sorri|content/i.test(lowerMessage)) return "😊";
  if (/workout|exercise|train|treino|exercise/i.test(lowerMessage)) return "💪";
  if (/food|eating|nutrition|comida|aliment/i.test(lowerMessage)) return "🥗";
  if (/sleep|dormir|rest|descan/i.test(lowerMessage)) return "😴";
  if (/water|água|hidrat/i.test(lowerMessage)) return "💧";
  if (/stress|anxiety|ansiedade|ansiedad/i.test(lowerMessage)) return "🧘‍♀️";
  
  // No emoji for neutral contexts - this makes it more human-like
  return "";
};
