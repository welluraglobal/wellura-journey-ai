
import { useState, useRef, useEffect, useContext } from "react";
import { UserContext } from "@/App";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const Chat = () => {
  const { firstName } = useContext(UserContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Initialize conversation on component mount
  useEffect(() => {
    // Generate a conversation ID for this session
    const newConversationId = `wellura-conv-${Date.now()}`;
    setConversationId(newConversationId);
    
    // Check if this is the first interaction (using localStorage for demo)
    const hadPreviousInteraction = localStorage.getItem("wellura-had-chat");
    setIsFirstInteraction(!hadPreviousInteraction);
    
    // When Supabase is integrated, we would fetch previous messages here
  }, []);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Add user message to the chat
    const userMessageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: newMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    
    try {
      // This is where the actual AI integration would happen with Supabase
      // For now, we'll simulate a response after a delay
      
      // Detect message language for demo (more sophisticated detection would be used with real AI)
      const isPortuguese = /[áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ]/.test(newMessage) || 
                          /obrigad|bom dia|boa tarde|boa noite|como vai|tudo bem/.test(newMessage.toLowerCase());
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let responseContent = "";
      
      // Generate appropriate response based on whether it's the first interaction
      if (isFirstInteraction) {
        if (isPortuguese) {
          responseContent = `Olá, ${firstName || "amigo"}! 😊 Bem-vindo ao Wellura Brasil. Sou seu consultor de bem-estar e estou aqui para te ajudar a alcançar seus objetivos de saúde. Como posso te ajudar hoje?`;
        } else {
          responseContent = `Hello, ${firstName || "friend"}! 😊 Welcome to Wellura Brasil. I'm your wellness consultant and I'm here to help you achieve your health goals. How can I assist you today?`;
        }
        
        // Mark that the user has had their first interaction
        localStorage.setItem("wellura-had-chat", "true");
        setIsFirstInteraction(false);
      } else {
        // Regular response based on detected language
        if (isPortuguese) {
          responseContent = "Estou aqui para ajudar com seus objetivos de saúde e bem-estar. Posso fornecer orientações sobre nutrição, exercícios, ou responder perguntas sobre seu plano personalizado. Como posso ajudar hoje? 💪";
        } else {
          responseContent = "I'm here to help with your health and wellness goals. I can provide guidance on nutrition, exercise, or answer questions about your personalized plan. How can I assist you today? 💪";
        }
      }
      
      // Add AI response to chat
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
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
          {/* Chat Messages Area */}
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
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => setNewMessage("How can I improve my sleep quality?")}
                  >
                    How can I improve my sleep?
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => setNewMessage("What foods should I eat to support my fitness goals?")}
                  >
                    Nutrition for my fitness goals
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => setNewMessage("How often should I exercise each week?")}
                  >
                    Weekly exercise frequency
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => setNewMessage("How can I stay motivated to follow my plan?")}
                  >
                    Tips for staying motivated
                  </Button>
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
          
          {/* Message Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
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
              Your AI consultant adapts to your language preference automatically.
              {isLoading ? " Generating response..." : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
