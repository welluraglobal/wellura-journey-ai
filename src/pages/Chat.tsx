
import { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, detectLanguage, fetchUserProfile, generateResponse, getContextualEmoji } from "@/utils/aiChatUtils";
import "../styles/chat.css";

const Chat = () => {
  const { firstName, userId, userProfile } = useContext(UserContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [userLanguage, setUserLanguage] = useState<"pt" | "es" | "en">("en");
  const [localUserProfile, setLocalUserProfile] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [hasShownWelcomeMessage, setHasShownWelcomeMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Initialize conversation and check for previous interaction
  useEffect(() => {
    // Create a stable conversation ID based on user ID or session
    const newConversationId = userId ? `wellura-conv-${userId}` : `wellura-conv-${Date.now()}`;
    setConversationId(newConversationId);
    
    // Check for previous messages in localStorage based on conversationId
    const savedMessages = localStorage.getItem(`wellura-chat-${newConversationId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        setIsFirstInteraction(false); // Not first interaction if we have saved messages
        setHasShownWelcomeMessage(true); // Assume welcome message was shown already
      } catch (e) {
        console.error("Error parsing saved messages:", e);
      }
    } else {
      // No saved messages found, this is a first interaction
      setIsFirstInteraction(true);
    }
    
    // Use the profile data from context if available, otherwise fetch it
    if (userProfile) {
      console.log("Using user profile from context:", userProfile);
      setLocalUserProfile(userProfile);
      
      // Try to detect user's preferred language from browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('pt')) {
        setUserLanguage('pt');
      } else if (browserLang.startsWith('es')) {
        setUserLanguage('es');
      } else {
        setUserLanguage('en');
      }
    } else if (userId) {
      // Fallback to fetching profile data if not in context
      const fetchProfile = async () => {
        const profile = await fetchUserProfile(userId);
        console.log("Fetched user profile:", profile);
        setLocalUserProfile(profile);
        
        // Try to detect user's preferred language from browser
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('pt')) {
          setUserLanguage('pt');
        } else if (browserLang.startsWith('es')) {
          setUserLanguage('es');
        } else {
          setUserLanguage('en');
        }
      };
      
      fetchProfile();
    }
  }, [userId, userProfile]);

  // Send welcome message when chat first loads and no messages exist
  useEffect(() => {
    if (
      !hasShownWelcomeMessage && 
      messages.length === 0 && 
      (userLanguage === "pt" || userLanguage === "es" || userLanguage === "en")
    ) {
      // Customize welcome message based on whether user has completed the quiz
      const hasCompletedQuiz = localUserProfile?.quiz_data && 
                              localUserProfile?.quiz_data?.goals && 
                              localUserProfile?.quiz_data?.goals.length > 0;
      
      let welcomeMessage: string;
      
      if (hasCompletedQuiz) {
        const welcomeMessages = {
          pt: `Olá ${firstName || ""}! 😊 Sou seu consultor de bem-estar da Wellura. Vejo que você já completou nosso quiz de saúde - obrigado! Isso me ajudará a oferecer conselhos mais personalizados para seus objetivos. Como posso ajudar na sua jornada de saúde hoje?`,
          es: `¡Hola ${firstName || ""}! 😊 Soy tu consultor de bienestar de Wellura. Veo que ya has completado nuestro cuestionario de salud - ¡gracias! Esto me ayudará a ofrecer consejos más personalizados para tus objetivos. ¿Cómo puedo ayudarte en tu viaje de salud hoy?`,
          en: `Hi ${firstName || ""}! 😊 I'm your Wellura wellness consultant. I see you've already completed our health quiz - thank you! This will help me provide more personalized advice for your goals. How can I help with your health journey today?`
        };
        welcomeMessage = welcomeMessages[userLanguage];
      } else {
        const welcomeMessages = {
          pt: `Olá ${firstName || ""}! 😊 Sou seu consultor de bem-estar da Wellura. Para que eu possa oferecer recomendações mais personalizadas, sugiro que você faça nosso quiz de saúde rápido. Você pode encontrá-lo na aba "Quiz". Como posso ajudar na sua jornada de saúde hoje?`,
          es: `¡Hola ${firstName || ""}! 😊 Soy tu consultor de bienestar de Wellura. Para que pueda ofrecerte recomendaciones más personalizadas, te sugiero que hagas nuestro cuestionario de salud rápido. Puedes encontrarlo en la pestaña "Quiz". ¿Cómo puedo ayudarte en tu viaje de salud hoy?`,
          en: `Hi ${firstName || ""}! 😊 I'm your Wellura wellness consultant. To help me provide more personalized recommendations, I suggest taking our quick health quiz. You can find it in the "Quiz" tab. How can I help with your health journey today?`
        };
        welcomeMessage = welcomeMessages[userLanguage];
      }

      // Add welcome message
      const welcomeMessageObj: Message = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessageObj]);
      setHasShownWelcomeMessage(true);
      setIsFirstInteraction(false);
    }
  }, [hasShownWelcomeMessage, messages.length, userLanguage, firstName, localUserProfile]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      localStorage.setItem(`wellura-chat-${conversationId}`, JSON.stringify(messages));
    }
  }, [messages, conversationId]);

  // Function to lookup health information from the internet
  const lookupHealthInformation = async (query: string) => {
    try {
      setIsThinking(true);
      
      // Add thinking message
      const thinkingMessage = getThinkingMessage(userLanguage);
      const thinkingMsgId = `thinking-${Date.now()}`;
      
      setMessages(prev => [...prev, {
        id: thinkingMsgId,
        role: "assistant",
        content: thinkingMessage,
        timestamp: new Date()
      }]);
      
      // Extract quiz data from user profile to enhance personalization
      const quizData = localUserProfile?.quiz_data || {};
      const mainGoal = localUserProfile?.main_goal || null;
      
      // Call the Supabase Edge Function to get health information
      // Pass message history for context and conversation persistence
      const { data, error } = await supabase.functions.invoke('health-lookup', {
        body: { 
          query, 
          userProfile: localUserProfile,
          messageHistory: messages,
          isFirstInteraction,
          conversationId,
          quizData,
          mainGoal
        }
      });
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMsgId));
      
      if (error) {
        console.error("Error calling health-lookup function:", error);
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || "Unknown error occurred");
      }
      
      return data.response;
    } catch (error) {
      console.error("Error in lookupHealthInformation:", error);
      return null;
    } finally {
      setIsThinking(false);
    }
  };
  
  const getThinkingMessage = (language: "pt" | "es" | "en"): string => {
    const messages = {
      pt: "Pesquisando informações para você...",
      es: "Buscando información para ti...",
      en: "Looking up information for you..."
    };
    
    return messages[language];
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Generate a unique ID for this message
    const userMessageId = `msg-${Date.now()}`;
    
    // Create user message object
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: newMessage,
      timestamp: new Date(),
    };
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    
    try {
      // Detect language from the message
      const detectedLanguage = detectLanguage(newMessage);
      setUserLanguage(detectedLanguage);
      
      // We'll use the API for all responses to ensure consistency
      const internetResponse = await lookupHealthInformation(newMessage);
      
      if (!internetResponse) {
        throw new Error("Failed to get response from health lookup");
      }
      
      // Create assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: internetResponse,
        timestamp: new Date(),
      };
      
      // Add assistant message to chat
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Mark that this is no longer the first interaction of the session
      if (isFirstInteraction) {
        setIsFirstInteraction(false);
      }
      
    } catch (error) {
      console.error("Error in AI chat:", error);
      toast.error("Failed to get a response. Please try again.");
      
      // Add a fallback message in case of error
      const fallbackMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: userLanguage === "pt" ? 
          "Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente." :
          userLanguage === "es" ?
          "Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo." :
          "Sorry, I had an issue processing your message. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Suggest questions based on user's language and profile goals
  const getSuggestedQuestions = () => {
    // Check if user has quiz data
    const hasQuizData = localUserProfile?.quiz_data && 
                       localUserProfile?.quiz_data?.goals && 
                       localUserProfile?.quiz_data?.goals.length > 0;
    
    // If user hasn't completed the quiz, suggest taking it
    if (!hasQuizData) {
      const quizQuestions = {
        en: [
          "How do I take the wellness quiz?", 
          "What benefits do I get from completing the quiz?", 
          "Can you give me personalized advice?",
          "Tell me more about the wellness assessment"
        ],
        pt: [
          "Como faço o quiz de bem-estar?", 
          "Quais benefícios eu ganho ao completar o quiz?", 
          "Você pode me dar conselhos personalizados?",
          "Conte-me mais sobre a avaliação de bem-estar"
        ],
        es: [
          "¿Cómo hago el cuestionario de bienestar?", 
          "¿Qué beneficios obtengo al completar el cuestionario?", 
          "¿Puedes darme consejos personalizados?",
          "Cuéntame más sobre la evaluación de bienestar"
        ]
      };
      
      return quizQuestions[userLanguage];
    }
    
    // Base questions
    const baseQuestions = {
      en: [
        "How can I improve my sleep quality?",
        "What foods support my fitness goals?",
        "How often should I exercise each week?",
        "Tips for staying motivated with my plan?"
      ],
      pt: [
        "Como posso melhorar a qualidade do meu sono?",
        "Que alimentos apoiam meus objetivos de fitness?",
        "Com que frequência devo me exercitar por semana?",
        "Dicas para manter a motivação com meu plano?"
      ],
      es: [
        "¿Cómo puedo mejorar la calidad de mi sueño?",
        "¿Qué alimentos apoyan mis objetivos de fitness?",
        "¿Con qué frecuencia debo hacer ejercicio cada semana?",
        "¿Consejos para mantenerme motivado con mi plan?"
      ]
    };
    
    // If we have user's main goal, add a goal-specific question
    if (localUserProfile?.main_goal) {
      const goalQuestions = {
        en: {
          lose_weight: "What's the best exercise for weight loss?",
          gain_muscle: "How can I maximize my muscle gain?",
          improve_fitness: "How can I increase my stamina?",
          increase_energy: "What foods give me more energy?",
          improve_sleep: "How can I fall asleep faster?",
          reduce_stress: "What are the best stress-reduction techniques?",
          improve_overall: "How can I create a balanced wellness routine?"
        },
        pt: {
          lose_weight: "Qual é o melhor exercício para perda de peso?",
          gain_muscle: "Como posso maximizar meu ganho muscular?",
          improve_fitness: "Como posso aumentar minha resistência?",
          increase_energy: "Quais alimentos me dão mais energia?",
          improve_sleep: "Como posso adormecer mais rápido?",
          reduce_stress: "Quais são as melhores técnicas de redução de estresse?",
          improve_overall: "Como posso criar uma rotina de bem-estar equilibrada?"
        },
        es: {
          lose_weight: "¿Cuál es el mejor ejercicio para perder peso?",
          gain_muscle: "¿Cómo puedo maximizar mi ganancia muscular?",
          improve_fitness: "¿Cómo puedo aumentar mi resistencia?",
          increase_energy: "¿Qué alimentos me dan más energía?",
          improve_sleep: "¿Cómo puedo dormirme más rápido?",
          reduce_stress: "¿Cuáles son las mejores técnicas para reducir el estrés?",
          improve_overall: "¿Cómo puedo crear una rutina de bienestar equilibrada?"
        }
      };
      
      // Add the goal-specific question if it exists
      const goal = localUserProfile.main_goal;
      if (goalQuestions[userLanguage][goal]) {
        baseQuestions[userLanguage].unshift(goalQuestions[userLanguage][goal]);
      }
    }
    
    // If user has completed the quiz, add questions based on their goals
    if (hasQuizData && localUserProfile?.quiz_data?.goals) {
      const quizGoals = localUserProfile.quiz_data.goals;
      
      quizGoals.forEach((goal: string) => {
        // Add goal-specific question based on their quiz selections
        const quizQuestionsByGoal = {
          en: {
            "Lose Weight": "Based on my quiz, what's a good diet plan for me?",
            "Improve Focus": "What supplements help with focus and concentration?",
            "Build Muscle": "What's the optimal protein intake for my muscle building goal?",
            "Boost Energy": "What are natural ways to boost my energy levels?",
            "Skin Care": "What daily habits will improve my skin health?",
            "Sleep Support": "How can I optimize my bedroom for better sleep?",
            "Digestive Health": "What foods should I avoid for better digestion?"
          },
          pt: {
            "Lose Weight": "Com base no meu quiz, qual é um bom plano alimentar para mim?",
            "Improve Focus": "Quais suplementos ajudam com foco e concentração?",
            "Build Muscle": "Qual é a ingestão ideal de proteína para meu objetivo de ganho muscular?",
            "Boost Energy": "Quais são as formas naturais de aumentar meus níveis de energia?",
            "Skin Care": "Quais hábitos diários melhorarão a saúde da minha pele?",
            "Sleep Support": "Como posso otimizar meu quarto para um sono melhor?",
            "Digestive Health": "Quais alimentos devo evitar para uma melhor digestão?"
          },
          es: {
            "Lose Weight": "Según mi cuestionario, ¿cuál es un buen plan de alimentación para mí?",
            "Improve Focus": "¿Qué suplementos ayudan con el enfoque y la concentración?",
            "Build Muscle": "¿Cuál es la ingesta óptima de proteínas para mi objetivo de desarrollo muscular?",
            "Boost Energy": "¿Cuáles son las formas naturales de aumentar mis niveles de energía?",
            "Skin Care": "¿Qué hábitos diarios mejorarán la salud de mi piel?",
            "Sleep Support": "¿Cómo puedo optimizar mi dormitorio para un mejor sueño?",
            "Digestive Health": "¿Qué alimentos debo evitar para una mejor digestión?"
          }
        };
        
        if (quizQuestionsByGoal[userLanguage][goal]) {
          // Add to the beginning to prioritize
          baseQuestions[userLanguage].unshift(quizQuestionsByGoal[userLanguage][goal]);
        }
      });
      
      // Limit to 4 questions
      baseQuestions[userLanguage] = baseQuestions[userLanguage].slice(0, 4);
    }
    
    return baseQuestions[userLanguage];
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">AI Wellness Consultant</h1>
          <p className="text-muted-foreground">
            Ask questions, get advice, and receive personalized wellness guidance
          </p>
        </div>
        
        <div className="flex-1 border rounded-lg flex flex-col overflow-hidden bg-card">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-wellura-100 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-wellura-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Your AI Wellness Consultant</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Ask questions about nutrition, fitness, your personalized plans, or any wellness topic that interests you.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                  {getSuggestedQuestions().map((question, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setNewMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-bubble ${message.role === "user" ? "user" : "assistant"} ${message.id.startsWith('thinking-') ? 'thinking animate-pulse-slow' : ''}`}
                  >
                    <div className="mb-1 text-xs opacity-70">
                      {message.role === "user" ? "You" : "AI Consultant"}
                    </div>
                    <div className="text-foreground">{message.content}</div>
                  </div>
                ))}
                {isLoading && !isThinking && (
                  <div className="chat-bubble assistant animate-pulse-slow">
                    <div className="mb-1 text-xs opacity-70">AI Consultant</div>
                    <div className="text-foreground">Thinking...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  userLanguage === "pt" ? "Digite sua mensagem..." : 
                  userLanguage === "es" ? "Escribe tu mensaje..." :
                  "Type your message..."
                }
                className="flex-1 min-h-[80px] max-h-[160px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="self-end"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {userLanguage === "pt" ? 
                "Seu consultor adapta-se automaticamente ao seu idioma preferido." :
                userLanguage === "es" ? 
                "Su consultor se adapta automáticamente a su idioma preferido." :
                "Your AI consultant adapts to your language preference automatically."}
              {isLoading ? 
                (userLanguage === "pt" ? " Gerando resposta..." : 
                userLanguage === "es" ? " Generando respuesta..." : 
                " Generating response...") : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
