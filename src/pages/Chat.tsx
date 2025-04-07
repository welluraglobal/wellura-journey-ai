
import { useState, useRef, useEffect, useContext } from "react";
import { UserContext } from "@/App";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { detectLanguage, fetchUserProfile, generateResponse, getContextualEmoji } from "@/utils/aiChatUtils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const Chat = () => {
  const { firstName, isLoggedIn } = useContext(UserContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [userLanguage, setUserLanguage] = useState<"pt" | "es" | "en">("en");
  const [userProfile, setUserProfile] = useState<any>(null);
  
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
    
    // Fetch user profile data if logged in
    const fetchProfile = async () => {
      if (isLoggedIn) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profile = await fetchUserProfile(user.id);
          setUserProfile(profile);
          
          // Try to detect user's preferred language from browser
          const browserLang = navigator.language.toLowerCase();
          if (browserLang.startsWith('pt')) {
            setUserLanguage('pt');
          } else if (browserLang.startsWith('es')) {
            setUserLanguage('es');
          } else {
            setUserLanguage('en');
          }
        }
      }
    };
    
    fetchProfile();
  }, [isLoggedIn]);
  
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
      
      // Simulate network delay (can be removed in production)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate personalized response based on context
      const responseContent = await generateResponse(
        newMessage, 
        firstName || userProfile?.first_name || "",
        detectedLanguage,
        userProfile?.main_goal,
        messages,
        isFirstInteraction
      );
      
      // Create assistant message with contextualized emoji
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: responseContent,
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

  // Suggest questions based on user's language
  const getSuggestedQuestions = () => {
    const questions = {
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
    
    return questions[userLanguage];
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
                    className={`chat-bubble ${message.role === "user" ? "user" : "assistant"}`}
                  >
                    <div className="mb-1 text-xs opacity-70">
                      {message.role === "user" ? "You" : "AI Consultant"}
                    </div>
                    <div>{message.content}</div>
                  </div>
                ))}
                {isLoading && (
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
