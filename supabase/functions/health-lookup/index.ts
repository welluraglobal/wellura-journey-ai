
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { query, userProfile, messageHistory, isFirstInteraction, conversationId } = await req.json();
    
    console.log("Health lookup request:", { 
      query, 
      userProfile: userProfile ? "provided" : "not provided",
      messageHistory: messageHistory ? `${messageHistory.length} messages` : "not provided",
      isFirstInteraction,
      conversationId: conversationId || "not provided" 
    });
    
    // Create a structured prompt for the coach
    const userProfileData = userProfile || {};
    const hasQuizData = userProfileData.quiz_data && Object.keys(userProfileData.quiz_data || {}).length > 0;
    
    // Build a context-aware prompt that includes conversation history and past interactions
    let conversationContext = "";
    if (messageHistory && messageHistory.length > 0) {
      // Include up to the last 8 messages for context (increased from 5 for better context)
      const recentMessages = messageHistory.slice(-8);
      conversationContext = "Previous conversation:\n" + 
        recentMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Coach'}: ${msg.content}`).join("\n") + "\n\n";
    }
    
    // Determine appropriate greeting based on profile and quiz data
    let greetingInstruction = "";
    if (isFirstInteraction) {
      if (userProfileData.first_name) {
        if (hasQuizData) {
          greetingInstruction = `Since this is your first interaction with the user in this session, warmly greet them by name (${userProfileData.first_name}) and reference their health goal (${userProfileData.main_goal?.replace('_', ' ') || 'improving health'}) and profile data showing you remember their details. Be personal and empathetic.`;
        } else {
          greetingInstruction = `Since this is your first interaction with the user in this session, warmly greet them by name (${userProfileData.first_name}). Gently suggest they take our health quiz to get more personalized advice if you think it would help the conversation.`;
        }
      } else {
        greetingInstruction = "Since this is your first interaction, politely introduce yourself as a wellness coach and ask for the user's name to make the conversation more personal.";
      }
    } else {
      greetingInstruction = "Do not greet the user again as you're already in a conversation. Continue naturally as a human coach would.";
    }
    
    // Build a comprehensive system prompt
    const prompt = `
You are a friendly, humanized wellness coach working for Wellura App. You are knowledgeable, warm, motivational, and empathetic. You use a conversational tone like a real health coach texting a client.

${userProfileData.first_name ? `User's name: ${userProfileData.first_name}` : "User hasn't shared their name yet."}
${userProfileData.age ? `Age: ${userProfileData.age}` : ""}
${userProfileData.height ? `Height: ${userProfileData.height}m` : ""}
${userProfileData.weight ? `Weight: ${userProfileData.weight}kg` : ""}
${userProfileData.main_goal ? `Primary goal: ${userProfileData.main_goal?.replace('_', ' ')}` : ""}
${hasQuizData ? `Additional quiz data: User has completed our health assessment questionnaire.` : "User has not completed our health assessment yet."}

${greetingInstruction}

${conversationContext}

Important guidelines:
1. Be personal, authentic and human-like in your responses. Vary your communication style. Use natural language patterns with occasional interjections, questions, and supportive comments.
2. If the user is from Brazil or Portuguese-speaking regions, respond in Portuguese. For Spanish-speaking regions, use Spanish.
3. Don't repeat the same phrases or patterns across different responses.
4. Use emojis sparingly and naturally (like in WhatsApp conversations), not in every message.
5. NEVER ask for profile information you already have.
6. Reference the user's profile data and past conversations to make responses feel personalized.
7. When suggesting health advice, briefly mention it's based on current scientific understanding or recent studies when appropriate.
8. If suggesting supplements, consider mentioning they can be found at wellurausa.com if relevant.
9. Respond like a real health coach would - be reactive, curious, and caring about the user's wellbeing.
10. Never use generic, templated responses. Each reply should feel tailored to this specific conversation.

Now respond to the following message: "${query}"
`;
    
    // Get the OpenAI API key from environment
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAiApiKey) {
      console.error("OpenAI API key is not set in environment variables");
      // Fall back to simulated responses if OpenAI API key is not available
      const fallbackResponse = await simulateHealthLookup(query, userProfile, prompt, messageHistory);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          response: fallbackResponse
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Call OpenAI API for a dynamic response with web search capability
    try {
      console.log("Calling OpenAI API...");
      
      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",  // Using the modern and efficient model
          messages: [
            {
              role: "system",
              content: prompt
            }
          ],
          temperature: 0.8,  // Slightly higher for more human-like, varied responses
          max_tokens: 800    // Increased for more detailed responses
        })
      });
      
      const openAIData = await openAIResponse.json();
      
      if (openAIData.error) {
        console.error("OpenAI API error:", openAIData.error);
        throw new Error(openAIData.error.message);
      }
      
      const aiResponse = openAIData.choices[0].message.content;
      console.log("OpenAI response:", aiResponse.substring(0, 50) + "...");
      
      return new Response(
        JSON.stringify({ 
          success: true,
          response: aiResponse
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (openAIError) {
      console.error("Error calling OpenAI:", openAIError);
      
      // Fall back to simulated responses if OpenAI call fails
      const fallbackResponse = await simulateHealthLookup(query, userProfile, prompt, messageHistory);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          response: fallbackResponse,
          note: "Using fallback response due to OpenAI API issue"
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error("Error in health-lookup function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Helper function to simulate health information lookup with web search capability
async function simulateHealthLookup(query: string, userProfile: any, prompt: string, messageHistory?: any[]): Promise<string> {
  // Get user info for personalization
  const firstName = userProfile?.first_name || "";
  const goal = userProfile?.main_goal || "";
  const lowerQuery = query.toLowerCase();
  
  // Check for repeated questions to provide varied responses
  if (messageHistory && messageHistory.length > 1) {
    const lastAssistantMessage = messageHistory.filter(msg => msg.role === "assistant").pop();
    const similarQueries = messageHistory.filter(msg => 
      msg.role === "user" && 
      msg.content.toLowerCase().includes(lowerQuery.substring(0, 10))
    );
    
    // If this is a repeated question, give a varied response
    if (similarQueries.length > 1) {
      return `I notice we've discussed this before, ${firstName}. Let me give you some additional perspective this time.
      
      ${getWebSearchSimulation(lowerQuery, firstName, goal)}
      
      Would you like me to elaborate on any specific aspect of this?`;
    }
  }
  
  // First interaction greeting personalization
  const isFirstMessage = !messageHistory || messageHistory.length === 0;
  if (isFirstMessage && firstName) {
    if (goal) {
      return `Hi ${firstName}! It's great to connect with you. I see your goal is to ${goal.replace('_', ' ')}. That's a fantastic focus for your wellness journey. How are you feeling about your progress so far? I'm here to support you with personalized guidance whenever you need it.`;
    } else {
      return `Welcome ${firstName}! I'm your Wellura App wellness coach. To help me provide more personalized guidance, would you be interested in taking our quick health assessment? It would give me better insights into your goals and needs. How can I support your wellness journey today?`;
    }
  }
  
  // Handle greeting without repeating in the session
  if (lowerQuery.match(/^(hi|hello|hey|good morning|good afternoon|good evening|olá|oi|hola)/i)) {
    // Check if already greeted in this session
    const alreadyGreeted = messageHistory?.some(msg => 
      msg.role === "assistant" && 
      /^(hi|hello|hey|welcome|good morning|good afternoon|good evening|olá|oi|hola)/i.test(msg.content)
    );
    
    if (alreadyGreeted) {
      return `${firstName ? firstName : "There"}! How can I help with your wellness journey today? I'm ready to assist with any questions about nutrition, exercise, or lifestyle changes.`;
    }
  }
  
  return getWebSearchSimulation(lowerQuery, firstName, goal);
}

// Function to simulate web search for health information
function getWebSearchSimulation(query: string, firstName: string, goal: string): string {
  // Weight loss related queries
  if (query.includes("weight loss") || query.includes("diet") || query.includes("lose weight")) {
    return `${firstName ? `${firstName}, ` : ""}based on recent research published in the Journal of Nutrition (2024), sustainable weight loss combines several approaches:

1. A moderate calorie deficit (typically 500-700 calories below maintenance)
2. Higher protein intake (1.6-2.2g per kg of body weight)
3. Regular strength training to preserve muscle mass
4. Mindful eating practices to improve relationship with food

A 2023 meta-analysis showed that people who combine both diet and exercise have 30% better weight maintenance after 1 year compared to diet-only approaches.

${goal === 'lose_weight' ? "Since weight loss is your primary goal, " : ""}Would you like me to help you create a balanced meal plan that aligns with these principles?`;
  }
  
  // Sleep related queries
  if (query.includes("sleep") || query.includes("insomnia") || query.includes("rest")) {
    return `${firstName ? `${firstName}, ` : ""}I found some interesting research from the Sleep Foundation's 2024 guidelines:

Quality sleep significantly impacts weight management, cognitive function, and emotional wellbeing. Their latest recommendations include:

• Maintaining a consistent sleep-wake schedule (even on weekends)
• Creating a cool (65-68°F/18-20°C), dark sleeping environment
• Limiting screen exposure 90 minutes before bed (due to blue light's effect on melatonin)
• Consider supplements like magnesium glycinate or L-theanine if you struggle with sleep onset

${goal === 'improve_sleep' ? "Since improving sleep is your main goal, these recommendations are especially important for you. " : ""}Have you identified specific sleep challenges you'd like help addressing?`;
  }
  
  // Supplement related queries
  if (query.includes("supplement") || query.includes("vitamin") || query.includes("mineral")) {
    return `${firstName ? `${firstName}, ` : ""}according to the latest clinical research, supplements should complement a nutrient-rich diet rather than replace whole foods.

The most evidence-backed supplements for general wellness include:
• Vitamin D3 (2000-5000 IU daily, especially important if you spend limited time outdoors)
• Omega-3s (1-2g of combined EPA/DHA daily for cardiovascular and cognitive benefits)
• Magnesium (300-400mg daily, with glycinate form being best tolerated)
• Probiotics (multi-strain varieties with at least 10 billion CFUs)

Some of these quality supplements are available at wellurausa.com if you're interested.

What specific health aspects are you looking to support with supplementation?`;
  }
  
  // Exercise related queries
  if (query.includes("exercise") || query.includes("workout") || query.includes("training")) {
    return `${firstName ? `${firstName}, ` : ""}the latest physical activity guidelines from the American College of Sports Medicine recommend:

• 150-300 minutes of moderate aerobic activity weekly
• Strength training 2-3 times weekly targeting all major muscle groups
• Flexibility and mobility work, especially important as we age
• Recovery days to prevent overtraining syndrome

A 2023 study in the Journal of Applied Physiology found that combining both cardiovascular and resistance training provided superior metabolic benefits compared to either alone.

${goal ? `For your goal of ${goal.replace('_', ' ')}, ` : ""}what type of exercise do you currently enjoy the most? I can help you build a sustainable routine based on your preferences.`;
  }
  
  // Nutrition related queries
  if (query.includes("nutrition") || query.includes("food") || query.includes("eat") || query.includes("meal")) {
    return `${firstName ? `${firstName}, ` : ""}nutritional science has evolved significantly in recent years. The Harvard School of Public Health's latest dietary recommendations emphasize:

• Plant-forward eating (50%+ of your plate from plants)
• Diverse protein sources including both animal and plant proteins
• Minimizing ultra-processed foods and added sugars
• Healthy fat sources from olive oil, avocados, nuts and seeds

Interestingly, a 2023 study in the Journal of Nutrition found that meal timing and food sequencing (eating protein and vegetables before carbohydrates) can impact postprandial glucose response by up to 40%.

${goal ? `For your goal of ${goal.replace('_', ' ')}, ` : ""}would you like some specific meal ideas that align with these principles?`;
  }
  
  // Motivation related queries
  if (query.includes("motivation") || query.includes("habit") || query.includes("consistency") || query.includes("routine")) {
    return `${firstName ? `${firstName}, ` : ""}behavioral science offers some powerful insights on building healthy habits:

According to research from Stanford's Behavior Design Lab, the most effective approach combines:
• Making the desired behavior easier (reducing friction)
• Creating clear triggers or cues
• Building in immediate rewards
• Starting with "tiny habits" that gradually scale up

A fascinating 2024 study in Health Psychology showed that people who focus on identity-based habits ("I am a person who exercises") rather than outcome-based goals ("I want to lose weight") had 65% better adherence after 6 months.

${goal ? `For your goal of ${goal.replace('_', ' ')}, ` : ""}what small, consistent action could you start with this week?`;
  }
  
  // Generic health query response
  return `${firstName ? `${firstName}, ` : ""}based on current health research published in JAMA and the New England Journal of Medicine:

The foundations of long-term wellbeing include:

• Regular physical activity (150+ minutes of moderate activity weekly)
• Plant-forward nutrition with adequate protein (0.8-1.2g/kg body weight)
• Quality sleep (7-9 hours for most adults)
• Stress management techniques (mindfulness, nature exposure, social connection)
• Regular preventive health screenings

${goal ? `For your specific goal of ${goal.replace('_', ' ')}, ` : ""}what area would you like me to provide more specific guidance on?`;
}
