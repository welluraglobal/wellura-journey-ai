
import { useState, useRef, useEffect, useContext } from "react";
import { UserContext } from "@/App";
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Initialize conversation and check for previous interaction
  useEffect(() => {
    // Generate a stable conversation ID based on user ID or session
    const newConversationId = `wellura-conv-${Date.now()}`;
    setConversationId(newConversationId);
    
    // Check if user had previous chat interactions
    const hadPreviousInteraction = localStorage.getItem("wellura-had-chat");
    setIsFirstInteraction(!hadPreviousInteraction);
    
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
      
      // Call the Supabase Edge Function to get health information
      // Pass message history for context
      const { data, error } = await supabase.functions.invoke('health-lookup', {
        body: { 
          query, 
          userProfile: localUserProfile,
          messageHistory: messages
        }
      });
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMsgId));
      
      if (error) {
        console.error("Error calling health-lookup function:", error);
        return null;
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
      pt: "Deixe-me pesquisar isso para você...",
      es: "Déjame buscar eso para ti...",
      en: "Give me a second to look that up for you..."
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
      
      // Mark that user has had a chat interaction
      if (isFirstInteraction) {
        localStorage.setItem("wellura-had-chat", "true");
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
                    <div>{message.content}</div>
                  </div>
                ))}
                {isLoading && !isThinking && (
                  <div className="chat-bubble assistant animate-pulse-slow">
                    <div className="mb-1 text-xs opacity-70">AI Consultant</div>
                    <div>Thinking...</div>
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
