
import { supabase } from "@/integrations/supabase/client";

// Define the Message interface
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Function to fetch user profile data from Supabase
export const fetchUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, main_goal, age, gender, height, weight')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data;
};

// Function to detect language from text
export const detectLanguage = (text: string): "pt" | "es" | "en" => {
  // Portuguese indicators
  const ptIndicators = [
    /obrigad[oa]/, /bom dia/, /boa tarde/, /boa noite/, /como vai/, /tudo bem/,
    /olá/, /oi/, /quero/, /preciso/, /ajuda/, /saúde/, /peso/, /exercício/
  ];
  
  // Spanish indicators
  const esIndicators = [
    /gracias/, /buenos días/, /buenas tardes/, /buenas noches/, /cómo estás/,
    /hola/, /quiero/, /necesito/, /ayuda/, /salud/, /peso/, /ejercicio/
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for accented characters common in Portuguese
  if (/[áàãâéêíóôõúüç]/i.test(lowerText) || ptIndicators.some(regex => regex.test(lowerText))) {
    return "pt";
  }
  
  // Check for Spanish patterns
  if (/[áéíóúüñ]/i.test(lowerText) || esIndicators.some(regex => regex.test(lowerText))) {
    return "es";
  }
  
  // Default to English
  return "en";
};

// Function to generate culturally appropriate response
export const generateResponse = async (
  message: string, 
  firstName: string,
  language: "pt" | "es" | "en",
  mainGoal?: string,
  messageHistory?: Message[],
  isFirstInteraction: boolean = false
): Promise<string> => {
  try {
    console.log("Generating response for:", { message, firstName, language, mainGoal, isFirstInteraction });
    
    // Check if we have message history to avoid repetitive responses
    if (messageHistory && messageHistory.length > 2) {
      const lastUserMessage = messageHistory.filter(msg => msg.role === "user").pop();
      const lastAssistantMessage = messageHistory.filter(msg => msg.role === "assistant").pop();
      
      // If the user said "Yes" and the last assistant message was about a plan
      if (message.toLowerCase() === "yes" || message.toLowerCase() === "sim" || message.toLowerCase() === "sí") {
        if (lastAssistantMessage?.content.includes("plan") || 
            lastAssistantMessage?.content.includes("plano") ||
            lastAssistantMessage?.content.includes("específico")) {
          
          // Provide a more detailed plan instead of repeating the question
          const weightLossPlan = {
            pt: `Ótimo ${firstName}! Aqui está um plano básico para perda de peso:\n\n1. Cardio: 30 minutos de caminhada rápida ou corrida leve, 4-5x por semana\n2. Força: 2-3 sessões semanais com foco em exercícios compostos\n3. Nutrição: Aumente proteínas magras e vegetais, reduza carboidratos refinados\n4. Hidratação: 2-3 litros de água por dia\n\nVamos acompanhar seu progresso semanalmente. Como isso soa?`,
            es: `¡Excelente ${firstName}! Aquí tienes un plan básico para perder peso:\n\n1. Cardio: 30 minutos de caminata rápida o trote ligero, 4-5 veces por semana\n2. Fuerza: 2-3 sesiones semanales con enfoque en ejercicios compuestos\n3. Nutrición: Aumenta proteínas magras y vegetales, reduce carbohidratos refinados\n4. Hidratación: 2-3 litros de agua al día\n\nHaremos seguimiento de tu progreso semanalmente. ¿Cómo suena esto?`,
            en: `Great ${firstName}! Here's a basic weight loss plan:\n\n1. Cardio: 30 minutes of brisk walking or light jogging, 4-5x per week\n2. Strength: 2-3 weekly sessions focusing on compound exercises\n3. Nutrition: Increase lean proteins and vegetables, reduce refined carbs\n4. Hydration: 2-3 liters of water daily\n\nWe'll track your progress weekly. How does this sound?`
          };
          
          return weightLossPlan[language];
        }
      }
    }
    
    // Dictionary of responses based on language
    const responses = {
      greeting: {
        pt: `Olá, ${firstName || ""}! 😊 Como posso ajudar sua jornada de bem-estar hoje?`,
        es: `¡Hola, ${firstName || ""}! 😊 ¿Cómo puedo ayudarte en tu viaje de bienestar hoy?`,
        en: `Hi, ${firstName || ""}! 😊 How can I help with your wellness journey today?`
      },
      weightLoss: {
        pt: `Entendi, ${firstName}! Baseado no seu objetivo de perder peso, posso sugerir uma combinação de exercícios cardio e uma alimentação balanceada. Quer que eu monte um plano específico?`,
        es: `¡Entendido, ${firstName}! Según tu objetivo de perder peso, puedo sugerirte una combinación de ejercicios cardiovasculares y una alimentación balanceada. ¿Quieres que prepare un plan específico?`,
        en: `Got it, ${firstName}! Based on your weight loss goal, I can suggest a combination of cardio exercises and balanced nutrition. Would you like me to create a specific plan?`
      },
      gainMuscle: {
        pt: `Entendi, ${firstName}! Para ganhar massa muscular, precisamos focar em treinos de força e nutrição adequada. Quer discutir um plano de treino ou falar sobre alimentação primeiro?`,
        es: `¡Entendido, ${firstName}! Para ganar masa muscular, necesitamos enfocarnos en entrenamientos de fuerza y nutrición adecuada. ¿Quieres discutir un plan de entrenamiento o hablar sobre alimentación primero?`,
        en: `Got it, ${firstName}! For muscle gain, we need to focus on strength training and proper nutrition. Would you like to discuss a workout plan or talk about nutrition first?`
      },
      sleep: {
        pt: `Melhorar o sono é fundamental, ${firstName}! Vamos trabalhar em uma rotina noturna e hábitos que podem ajudar você a descansar melhor?`,
        es: `¡Mejorar el sueño es fundamental, ${firstName}! ¿Trabajemos en una rutina nocturna y hábitos que puedan ayudarte a descansar mejor?`,
        en: `Improving sleep is crucial, ${firstName}! Shall we work on a nighttime routine and habits that can help you rest better?`
      },
      generalHealth: {
        pt: `Saúde geral é um ótimo foco, ${firstName}! Isso envolve equilíbrio entre exercício, alimentação, sono e bem-estar mental. Tem alguma área específica que gostaria de priorizar?`,
        es: `¡La salud general es un excelente enfoque, ${firstName}! Esto implica equilibrio entre ejercicio, alimentación, sueño y bienestar mental. ¿Hay algún área específica que te gustaría priorizar?`,
        en: `General health is a great focus, ${firstName}! This involves balance between exercise, nutrition, sleep, and mental wellbeing. Is there a specific area you'd like to prioritize?`
      },
      fallback: {
        pt: `Estou aqui para ajudar com qualquer aspecto da sua saúde e bem-estar, ${firstName}. O que você gostaria de saber hoje?`,
        es: `Estoy aquí para ayudarte con cualquier aspecto de tu salud y bienestar, ${firstName}. ¿Qué te gustaría saber hoy?`,
        en: `I'm here to help with any aspect of your health and wellness, ${firstName}. What would you like to know today?`
      },
      internetFallback: {
        pt: `Não consegui acessar dados atualizados no momento, mas aqui está o que sei com base nas diretrizes de saúde atuais.`,
        es: `No pude acceder a datos en vivo en este momento, pero esto es lo que sé según las pautas de salud actuales.`,
        en: `I couldn't access live data right now, but here's what I know based on current health guidelines.`
      }
    };

    // If it's first interaction, prioritize greeting
    if (isFirstInteraction) {
      return responses.greeting[language];
    }

    // Check if we're in a conversation and analyze context
    if (messageHistory && messageHistory.length > 0) {
      // We have context from previous messages - use it to generate more natural responses
      const contextAwareResponse = generateContextAwareResponse(
        message, 
        firstName, 
        language, 
        mainGoal, 
        messageHistory
      );
      
      if (contextAwareResponse) {
        return contextAwareResponse;
      }
    }

    // Look for keywords in the message to determine intent
    const lowerMessage = message.toLowerCase();
    
    // Check if message has specific queries
    if (/perd[ae]r peso|adelgazar|lose weight|weight loss|diet/i.test(lowerMessage)) {
      return responses.weightLoss[language];
    } else if (/muscle|múscul|força|fuerza|strength|gain/i.test(lowerMessage)) {
      return responses.gainMuscle[language];
    } else if (/dorm[ie]r|sleep|sono|sueño|descan[sz]/i.test(lowerMessage)) {
      return responses.sleep[language];
    } else if (/saúde|salud|health|geral|general|overall/i.test(lowerMessage)) {
      return responses.generalHealth[language];
    }
    
    // If we have main goal information, use it for context-aware response
    if (mainGoal) {
      switch(mainGoal) {
        case 'lose_weight':
          return responses.weightLoss[language];
        case 'gain_muscle':
          return responses.gainMuscle[language];
        case 'improve_sleep':
          return responses.sleep[language];
        case 'improve_overall':
          return responses.generalHealth[language];
        default:
          return responses.fallback[language];
      }
    }
    
    // Default fallback response
    return responses.fallback[language];
  } catch (error) {
    console.error("Error in generateResponse:", error);
    
    // Return a safe fallback in case of any errors
    const fallbacks = {
      pt: `Desculpe, tive um problema ao processar sua mensagem. Como posso ajudar com sua saúde e bem-estar hoje?`,
      es: `Lo siento, tuve un problema al procesar tu mensaje. ¿Cómo puedo ayudarte con tu salud y bienestar hoy?`,
      en: `Sorry, I had an issue processing your message. How can I help with your health and wellness today?`
    };
    
    return fallbacks[language];
  }
};

// Helper function for generating context-aware responses
const generateContextAwareResponse = (
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
