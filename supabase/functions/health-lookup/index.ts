
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
    const { query, userProfile, messageHistory } = await req.json();
    
    console.log("Health lookup request:", { 
      query, 
      userProfile: userProfile ? "provided" : "not provided",
      messageHistory: messageHistory ? `${messageHistory.length} messages` : "not provided" 
    });
    
    // Create a structured prompt for the coach
    const userProfileData = userProfile || {};
    
    // Build a context-aware prompt that includes conversation history
    let conversationContext = "";
    if (messageHistory && messageHistory.length > 0) {
      // Include up to the last 5 messages for context
      const recentMessages = messageHistory.slice(-5);
      conversationContext = "Previous conversation:\n" + 
        recentMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Coach'}: ${msg.content}`).join("\n") + "\n\n";
    }
    
    const prompt = `
You are a friendly, humanized wellness coach working for Wellura App. Speak with empathy and motivation. Use the user's profile data:

Name: ${userProfileData.first_name || ""}
Age: ${userProfileData.age || ""}
Height: ${userProfileData.height || ""}m
Weight: ${userProfileData.weight || ""}kg
Goal: ${userProfileData.main_goal || ""}

${conversationContext}
Important guidelines:
1. Respond naturally like a real coach, adapting tone and vocabulary. 
2. If the user is from Brazil, speak in Portuguese. For Spanish-speaking regions, use Spanish.
3. Avoid robotic or formulaic answers. Vary your responses based on the conversation.
4. Only greet them once per session.
5. Never repeat the same response.
6. Be concise but warm and helpful.
7. Don't ask for profile information that you already have.

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
    
    // Call OpenAI API for a dynamic response
    try {
      console.log("Calling OpenAI API...");
      
      const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: prompt
            }
          ],
          temperature: 0.8, // Slightly increased to ensure variety in responses
          max_tokens: 500
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

// Helper function to simulate health information lookup
async function simulateHealthLookup(query: string, userProfile: any, prompt: string, messageHistory?: any[]): Promise<string> {
  // Check for repetitive response patterns
  if (messageHistory && messageHistory.length > 0) {
    const lastAssistantMessage = messageHistory.filter(msg => msg.role === "assistant").pop();
    
    // If the last message was about weight loss, vary the response
    if (lastAssistantMessage && lastAssistantMessage.content.toLowerCase().includes("weight loss")) {
      return `Looking at your profile data and our conversation so far, I'd recommend focusing on building sustainable habits rather than quick fixes. Small, consistent changes tend to yield better long-term results than drastic measures.
      
      What specific aspect of your wellness journey would you like more guidance on today?`;
    }
  }

  // Convert query to lowercase for easier matching
  const lowerQuery = query.toLowerCase();
  
  // Determine user's name and goal for personalization
  const name = userProfile?.first_name || "";
  const goal = userProfile?.main_goal || "";
  
  // Check for weight loss related queries
  if (lowerQuery.includes("weight loss") || lowerQuery.includes("diet") || lowerQuery.includes("lose weight")) {
    return `Based on current health guidelines for weight loss, it's recommended to create a moderate calorie deficit through a combination of diet and exercise. For most people, this means reducing daily intake by 500-700 calories and incorporating both cardio and strength training.
    
    ${name ? `${name}, since your goal is ${goal === 'lose_weight' ? 'also weight loss' : goal}, ` : ''}I'd recommend starting with 3-4 cardio sessions weekly (30-45 minutes each) and 2 strength training sessions to preserve muscle mass during weight loss. Research shows this combination is most effective for sustainable results.`;
  }
  
  // Check for sleep-related queries
  if (lowerQuery.includes("sleep") || lowerQuery.includes("insomnia") || lowerQuery.includes("rest")) {
    return `Recent sleep research from the National Sleep Foundation recommends adults get 7-9 hours of quality sleep per night. To improve sleep quality, try:
    
    1. Maintaining a consistent sleep schedule
    2. Creating a relaxing bedtime routine
    3. Limiting screen time 1 hour before bed (blue light can disrupt melatonin)
    4. Avoiding caffeine after 2pm
    5. Keeping your bedroom cool (around 65-68°F/18-20°C)
    
    ${name ? `${name}, ` : ''}These evidence-based practices have been shown to improve both sleep onset and quality.`;
  }
  
  // Check for supplement-related queries
  if (lowerQuery.includes("supplement") || lowerQuery.includes("vitamin") || lowerQuery.includes("mineral")) {
    return `According to recent clinical research, supplements should complement rather than replace a balanced diet. The most evidence-backed supplements include:
    
    1. Vitamin D: Especially important for those with limited sun exposure
    2. Omega-3 fatty acids: Beneficial for heart and brain health
    3. Probiotics: Can support gut health and immune function
    4. Magnesium: May help with sleep quality and muscle recovery
    
    ${name ? `${name}, ` : ''}Always consult with a healthcare professional before starting any supplement regimen, as individual needs vary based on diet, lifestyle, and health conditions.`;
  }
  
  // Check for exercise-related queries
  if (lowerQuery.includes("exercise") || lowerQuery.includes("workout") || lowerQuery.includes("training")) {
    return `Current exercise guidelines from the World Health Organization recommend:
    
    • 150-300 minutes of moderate-intensity aerobic activity weekly
    • Muscle-strengthening activities 2+ days per week
    • Reducing sedentary time throughout the day
    
    ${name ? `${name}, based on your ${goal ? 'goal to ' + goal.replace('_', ' ') : 'profile'}, ` : ''}including both cardio and resistance training provides complementary benefits. Research shows that consistency is more important than intensity when beginning a fitness routine.`;
  }
  
  // Generic response for other health topics
  return `Based on current health research, maintaining overall wellness involves several key components:
  
  1. Regular physical activity (150+ minutes/week)
  2. A balanced diet rich in whole foods
  3. Adequate sleep (7-9 hours nightly)
  4. Stress management techniques
  5. Regular health check-ups
  
  ${name ? `${name}, ` : ''}These core principles form the foundation of evidence-based health recommendations. Would you like more specific information about any of these areas?`;
}
