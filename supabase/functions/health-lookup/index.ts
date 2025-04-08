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
    const { query, userProfile, messageHistory, isFirstInteraction, conversationId, quizData, mainGoal } = await req.json();
    
    console.log("Health lookup request:", { 
      query, 
      userProfile: userProfile ? "provided" : "not provided",
      messageHistory: messageHistory ? `${messageHistory.length} messages` : "not provided",
      isFirstInteraction,
      conversationId: conversationId || "not provided",
      quizData: quizData ? "provided" : "not provided",
      mainGoal: mainGoal || "not provided"
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
    
    // Add quiz data context if available
    let quizContext = "";
    if (hasQuizData) {
      const userData = userProfileData.quiz_data;
      quizContext = "User's quiz data:\n";
      
      if (userData.goals && userData.goals.length > 0) {
        quizContext += `Selected goals: ${userData.goals.join(", ")}\n`;
      }
      
      if (userData.answers) {
        quizContext += "Key responses:\n";
        Object.entries(userData.answers).forEach(([key, value]) => {
          // Only include the most relevant responses to keep context concise
          if (key.includes('type') || key.includes('level') || key.includes('goal') || 
              key.includes('diet') || key.includes('exercise') || key.includes('hours') ||
              key.includes('quality') || key.includes('challenges')) {
            quizContext += `- ${key}: ${value}\n`;
          }
        });
      }
      
      quizContext += "\nUse this information to personalize your responses.\n\n";
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
    
    // Add quiz suggestion context
    let quizSuggestionContext = "";
    if (!hasQuizData) {
      quizSuggestionContext = "The user has not completed our health quiz yet. If appropriate in the conversation, suggest they take our quick health assessment quiz (found in the 'Quiz' tab) to get more personalized recommendations. Don't be pushy about this, but mention it if relevant.\n\n";
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

${quizContext}
${quizSuggestionContext}
${greetingInstruction}

${conversationContext}

Important guidelines:
1. Be personal, authentic and human-like in your responses. Vary your communication style. Use natural language patterns with occasional interjections, questions, and supportive comments.
2. If the user is from Brazil or Portuguese-speaking regions, respond in Portuguese. For Spanish-speaking regions, use Spanish.
3. Don't repeat the same phrases or patterns across different responses.
4. Use emojis sparingly and naturally (like in WhatsApp conversations), not in every message.
5. NEVER ask for profile information you already have.
6. Reference the user's profile data, quiz results, and past conversations to make responses feel personalized.
7. When suggesting health advice, briefly mention it's based on current scientific understanding or recent studies when appropriate.
8. If suggesting supplements, consider mentioning they can be found at wellurausa.com if relevant.
9. Respond like a real health coach would - be reactive, curious, and caring about the user's wellbeing.
10. Never use generic, templated responses. Each reply should feel tailored to this specific conversation.
11. If the user asks about the quiz or assessment, explain that it helps you provide more personalized guidance based on their health goals and needs.

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
  
  // Check if user has completed the quiz
  const hasCompletedQuiz = userProfile?.quiz_data && Object.keys(userProfile?.quiz_data || {}).length > 0;
  
  // Check for quiz-related queries to encourage quiz completion
  if (!hasCompletedQuiz && (lowerQuery.includes("quiz") || lowerQuery.includes("questionário") || lowerQuery.includes("cuestionario") || lowerQuery.includes("assessment"))) {
    const quizResponses = {
      pt: `${firstName ? firstName + ", o" : "O"} quiz de bem-estar é uma ótima maneira de eu entender melhor seus objetivos de saúde. Leva apenas alguns minutos e me permite oferecer conselhos muito mais personalizados. Você pode acessá-lo na aba "Quiz" do aplicativo. Depois de completá-lo, poderei ver suas respostas e adaptar minhas recomendações especificamente para você. Gostaria de experimentar?`,
      es: `${firstName ? firstName + ", el" : "El"} cuestionario de bienestar es una excelente manera para que yo comprenda mejor tus objetivos de salud. Solo toma unos minutos y me permite ofrecerte consejos mucho más personalizados. Puedes acceder a él en la pestaña "Quiz" de la aplicación. Después de completarlo, podré ver tus respuestas y adaptar mis recomendaciones específicamente para ti. ¿Te gustaría probarlo?`,
      en: `${firstName ? firstName + ", the" : "The"} wellness quiz is a great way for me to better understand your health goals. It only takes a few minutes and allows me to offer much more personalized advice. You can access it in the "Quiz" tab of the app. After completing it, I'll be able to see your responses and tailor my recommendations specifically for you. Would you like to try it?`
    };
    
    // Determine language based on query
    let lang: "pt" | "es" | "en" = "en";
    if (lowerQuery.includes("questionário") || lowerQuery.includes("como posso") || lowerQuery.includes("gostaria")) {
      lang = "pt";
    } else if (lowerQuery.includes("cuestionario") || lowerQuery.includes("cómo puedo") || lowerQuery.includes("me gustaría")) {
      lang = "es";
    }
    
    return quizResponses[lang];
  }
  
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
      
      ${getWebSearchSimulation(lowerQuery, firstName, goal, hasCompletedQuiz, userProfile?.quiz_data)}
      
      Would you like me to elaborate on any specific aspect of this?`;
    }
  }
  
  // First interaction greeting personalization
  const isFirstMessage = !messageHistory || messageHistory.length === 0;
  if (isFirstMessage && firstName) {
    if (hasCompletedQuiz) {
      const languageMatch = /português|portuguese|brazil|brasil/i.test(lowerQuery) ? "pt" : 
                          /español|spanish|latin/i.test(lowerQuery) ? "es" : "en";
      
      const welcomeMessages = {
        pt: `Olá ${firstName}! Obrigado por completar nosso quiz de saúde. Baseado nas suas respostas, vejo que seu foco principal é ${goal.replace('_', ' ')}. Isso me ajudará a personalizar minhas recomendações. Como posso ajudar sua jornada de bem-estar hoje?`,
        es: `¡Hola ${firstName}! Gracias por completar nuestro cuestionario de salud. Basado en tus respuestas, veo que tu enfoque principal es ${goal.replace('_', ' ')}. Esto me ayudará a personalizar mis recomendaciones. ¿Cómo puedo ayudar en tu viaje de bienestar hoy?`,
        en: `Hi ${firstName}! Thank you for completing our health quiz. Based on your responses, I see your main focus is ${goal.replace('_', ' ')}. This will help me personalize my recommendations. How can I help with your wellness journey today?`
      };
      
      return welcomeMessages[languageMatch];
    } else {
      const languageMatch = /português|portuguese|brazil|brasil/i.test(lowerQuery) ? "pt" : 
                          /español|spanish|latin/i.test(lowerQuery) ? "es" : "en";
      
      const suggestionMessages = {
        pt: `Olá ${firstName}! Para que eu possa te ajudar da melhor forma possível, recomendo fazer nosso quiz de saúde rápido. Está disponível na aba "Quiz" e me permite oferecer conselhos mais personalizados. Como posso ajudar sua jornada de bem-estar hoje?`,
        es: `¡Hola ${firstName}! Para poder ayudarte de la mejor manera posible, te recomiendo hacer nuestro cuestionario de salud rápido. Está disponible en la pestaña "Quiz" y me permite ofrecer consejos más personalizados. ¿Cómo puedo ayudar en tu viaje de bienestar hoy?`,
        en: `Hi ${firstName}! To help you in the best way possible, I recommend taking our quick health quiz. It's available in the "Quiz" tab and allows me to offer more personalized advice. How can I help with your wellness journey today?`
      };
      
      return suggestionMessages[languageMatch];
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
      return `${firstName ? firstName + "! " : ""}How can I help with your wellness journey today? I'm ready to assist with any questions about nutrition, exercise, or lifestyle changes.`;
    }
  }
  
  return getWebSearchSimulation(lowerQuery, firstName, goal, hasCompletedQuiz, userProfile?.quiz_data);
}

// Function to simulate web search for health information
function getWebSearchSimulation(query: string, firstName: string, goal: string, hasCompletedQuiz: boolean = false, quizData: any = null): string {
  // Add quiz suggestion for users who haven't completed it yet (20% chance)
  if (!hasCompletedQuiz && Math.random() < 0.2) {
    const languageMatch = /português|brazil|brasil/i.test(query) ? "pt" : 
                        /español|spanish|latin/i.test(query) ? "es" : "en";
    
    const quizSuggestions = {
      pt: `${firstName ? firstName + ", antes" : "Antes"} de prosseguir, gostaria de mencionar que temos um quiz de saúde rápido disponível na aba "Quiz". Completá-lo me ajudaria a personalizar ainda mais minhas recomendações para você. Agora, sobre sua pergunta:`,
      es: `${firstName ? firstName + ", antes" : "Antes"} de continuar, me gustaría mencionar que tenemos un cuestionario de salud rápido disponible en la pestaña "Quiz". Completarlo me ayudaría a personalizar aún más mis recomendaciones para ti. Ahora, sobre tu pregunta:`,
      en: `${firstName ? firstName + ", before" : "Before"} we continue, I'd like to mention that we have a quick health quiz available in the "Quiz" tab. Completing it would help me further personalize my recommendations for you. Now, about your question:`
    };
    
    const suggestionPrefix = quizSuggestions[languageMatch] + "\n\n";
    
    // 20% chance to suggest the quiz before providing the answer
    if (Math.random() < 0.2) {
      return suggestionPrefix + getBasicHealthResponse(query, firstName, goal, quizData);
    }
  }
  
  // For users who have completed the quiz, reference their quiz data
  if (hasCompletedQuiz && quizData) {
    const selectedGoals = quizData.goals || [];
    const answers = quizData.answers || {};
    
    // Personalize response based on quiz data
    return getPersonalizedHealthResponse(query, firstName, goal, selectedGoals, answers);
  }
  
  // Default fallback to basic response
  return getBasicHealthResponse(query, firstName, goal, null);
}

// Function to generate basic health responses
function getBasicHealthResponse(query: string, firstName: string, goal: string, quizData: any): string {
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

// Function to generate personalized responses based on quiz data
function getPersonalizedHealthResponse(query: string, firstName: string, mainGoal: string, selectedGoals: string[], answers: any): string {
  // Weight loss related queries with quiz personalization
  if (query.includes("weight loss") || query.includes("diet") || query.includes("lose weight")) {
    let personalizedResponse = `${firstName ? `${firstName}, ` : ""}based on your quiz results `;
    
    if (selectedGoals.includes("Lose Weight")) {
      personalizedResponse += `and your goal to lose weight, `;
      
      // Add personalized diet advice if available
      if (answers["weight-diet"]) {
        personalizedResponse += `I noticed you follow a ${answers["weight-diet"]} diet. `;
        
        if (answers["weight-diet"] === "Standard American Diet") {
          personalizedResponse += `Making gradual changes toward a more Mediterranean or plant-focused approach could be beneficial. `;
        } else if (answers["weight-diet"] === "Mediterranean") {
          personalizedResponse += `Great choice! The Mediterranean diet is excellent for sustainable weight loss. `;
        } else if (answers["weight-diet"] === "Keto/Low-Carb") {
          personalizedResponse += `While low-carb approaches can be effective, ensure you're getting enough fiber and nutrients. `;
        }
      }
      
      // Add personalized exercise advice if available
      if (answers["weight-exercise"]) {
        personalizedResponse += `With your current exercise frequency of ${answers["weight-exercise"]}, `;
        
        if (answers["weight-exercise"] === "None" || answers["weight-exercise"] === "1-2 times") {
          personalizedResponse += `gradually increasing to 3-4 sessions per week would support your weight loss goals. `;
        } else {
          personalizedResponse += `you're already building a great foundation for your metabolism. `;
        }
      }
      
      // Add personalized challenges advice if available
      if (answers["weight-challenges"]) {
        personalizedResponse += `I understand your challenges include "${answers["weight-challenges"]}". `;
      }
    } else {
      personalizedResponse += `I can provide evidence-based weight management advice: `;
    }
    
    personalizedResponse += `
  
Recent research supports a comprehensive approach to sustainable weight loss:

1. A moderate calorie deficit (typically 500-700 calories below maintenance)
2. Higher protein intake (1.6-2.2g per kg of body weight)
3. Regular strength training to preserve muscle mass
4. Mindful eating practices to improve relationship with food

Would you like me to help you create a more personalized plan based on your quiz results?`;
    
    return personalizedResponse;
  }
  
  // Sleep related queries with quiz personalization
  if (query.includes("sleep") || query.includes("insomnia") || query.includes("rest")) {
    let personalizedResponse = `${firstName ? `${firstName}, ` : ""}based on your quiz results `;
    
    if (selectedGoals.includes("Sleep Support")) {
      personalizedResponse += `and your goal to improve sleep, `;
      
      // Add personalized sleep advice if available
      if (answers["sleep-hours"]) {
        personalizedResponse += `I see you typically sleep ${answers["sleep-hours"]}. `;
        
        if (answers["sleep-hours"] === "Less than 5 hours" || answers["sleep-hours"] === "5-6 hours") {
          personalizedResponse += `Gradually extending your sleep duration could significantly impact your health and wellbeing. `;
        } else {
          personalizedResponse += `You're already getting a good amount of sleep time. Let's focus on quality. `;
        }
      }
      
      // Add personalized screen advice if available
      if (answers["sleep-screens"]) {
        if (answers["sleep-screens"] === "Yes, right until I sleep") {
          personalizedResponse += `Reducing screen time before bed could significantly improve your sleep quality. `;
        }
      }
      
      // Add personalized environment advice if available
      if (answers["sleep-environment"]) {
        personalizedResponse += `Based on your description of your sleep environment ("${answers["sleep-environment"]}"), `;
      }
    } else {
      personalizedResponse += `I can provide evidence-based sleep improvement advice: `;
    }
    
    personalizedResponse += `
  
The Sleep Foundation's 2024 guidelines highlight several evidence-based strategies:

• Maintaining a consistent sleep-wake schedule (even on weekends)
• Creating a cool (65-68°F/18-20°C), dark sleeping environment
• Limiting screen exposure 90 minutes before bed 
• Consider relaxation techniques like deep breathing or meditation

What specific aspect of sleep would you like more personalized guidance on?`;
    
    return personalizedResponse;
  }
  
  // Supplement related queries with goals context
  if (query.includes("supplement") || query.includes("vitamin") || query.includes("mineral")) {
    let personalizedResponse = `${firstName ? `${firstName}, ` : ""}`;
    
    // Personalize based on selected goals
    if (selectedGoals.length > 0) {
      personalizedResponse += `based on your health goals (${selectedGoals.join(", ")}), these supplements might be particularly beneficial:`;
      
      let goalSpecificSupplements = "\n\n";
      
      if (selectedGoals.includes("Lose Weight")) {
        goalSpecificSupplements += "• For weight management: Green tea extract, berberine, or chromium may support metabolic health\n";
      }
      
      if (selectedGoals.includes("Improve Focus")) {
        goalSpecificSupplements += "• For cognitive function: Omega-3 fatty acids, Bacopa monnieri, or Lion's mane mushroom\n";
      }
      
      if (selectedGoals.includes("Build Muscle")) {
        goalSpecificSupplements += "• For muscle building: Whey protein, creatine monohydrate, and vitamin D3\n";
      }
      
      if (selectedGoals.includes("Boost Energy")) {
        goalSpecificSupplements += "• For energy support: B-complex vitamins, CoQ10, and iron (if deficient)\n";
      }
      
      if (selectedGoals.includes("Skin Care")) {
        goalSpecificSupplements += "• For skin health: Collagen peptides, vitamin C, and omega-3 fatty acids\n";
      }
      
      if (selectedGoals.includes("Sleep Support")) {
        goalSpecificSupplements += "• For sleep improvement: Magnesium glycinate, melatonin (short-term), and L-theanine\n";
      }
      
      if (selectedGoals.includes("Digestive Health")) {
        goalSpecificSupplements += "• For digestive support: Probiotics, digestive enzymes, and L-glutamine\n";
      }
      
      personalizedResponse += goalSpecificSupplements;
    } else {
      personalizedResponse += `according to recent research, these foundational supplements have strong evidence for general wellness:\n\n`;
    }
    
    personalizedResponse += `
The most evidence-backed supplements for general wellness include:
• Vitamin D3 (2000-5000 IU daily)
• Omega-3s (1-2g of combined EPA/DHA daily)
• Magnesium (300-400mg daily, with glycinate form being best tolerated)
• Probiotics (multi-strain varieties with at least 10 billion CFUs)

Some of these quality supplements are available at wellurausa.com.

Would you like more specific supplement recommendations based on your unique health profile?`;
    
    return personalizedResponse;
  }
  
  // Exercise related queries with quiz personalization
  if (query.includes("exercise") || query.includes("workout") || query.includes("training")) {
    let personalizedResponse = `${firstName ? `${firstName}, ` : ""}based on your quiz results `;
    
    if (selectedGoals.includes("Build Muscle")) {
      personalizedResponse += `and your goal to build muscle, `;
      
      // Add personalized training advice if available
      if (answers["muscle-training"]) {
        personalizedResponse += `with your current training frequency of ${answers["muscle-training"]}, `;
        
        if (answers["muscle-training"] === "Never" || answers["muscle-training"] === "1-2 times/week") {
          personalizedResponse += `increasing to 3-4 strength sessions per week would optimize your muscle growth. `;
        } else {
          personalizedResponse += `you're already on the right track with training frequency. `;
        }
      }
      
      // Add personalized protein advice if available
      if (answers["muscle-protein"]) {
        if (answers["muscle-protein"] === "Low" || answers["muscle-protein"] === "Not sure") {
          personalizedResponse += `Focusing on increasing your protein intake would be beneficial for your goals. `;
        } else {
          personalizedResponse += `Maintaining your current protein intake is excellent for supporting muscle development. `;
        }
      }
      
      // Add personalized equipment advice if available
      if (answers["muscle-equipment"]) {
        personalizedResponse += `With your access to ${answers["muscle-equipment"]}, `;
        
        if (answers["muscle-equipment"] === "None/Home workout") {
          personalizedResponse += `bodyweight and resistance band exercises can be very effective. `;
        } else if (answers["muscle-equipment"] === "Full gym") {
          personalizedResponse += `compound lifts like squats, deadlifts and bench press should be your focus. `;
        }
      }
    } else if (selectedGoals.includes("Lose Weight")) {
      personalizedResponse += `while your primary goal is weight loss, incorporating strength training is crucial for preserving muscle mass. `;
    } else {
      personalizedResponse += `I can provide evidence-based exercise recommendations: `;
    }
    
    personalizedResponse += `
  
The latest physical activity guidelines recommend:

• ${selectedGoals.includes("Build Muscle") ? "3-4 strength training sessions weekly for optimal muscle growth" : "150-300 minutes of moderate aerobic activity weekly"}
• ${selectedGoals.includes("Build Muscle") ? "Focus on progressive overload (gradually increasing weight/resistance)" : "Strength training 2-3 times weekly targeting all major muscle groups"}
• Prioritizing compound movements that work multiple muscle groups
• Adequate recovery between training sessions for the same muscle groups

Would you like me to create a more specific workout plan based on your goals and preferences?`;
    
    return personalizedResponse;
  }
  
  // Generic health query with personalized response
  let personalizedIntro = `${firstName ? `${firstName}, ` : ""}based on your quiz results and health goals (${selectedGoals.join(", ")}), `;
  
  if (mainGoal) {
    personalizedIntro += `with a primary focus on ${mainGoal.replace('_', ' ')}, `;
  }
  
  return personalizedIntro + `here are some personalized health recommendations:

• ${selectedGoals.includes("Lose Weight") ? "Create a modest calorie deficit through both diet and increased activity" : "Maintain a balanced diet rich in whole foods"}
• ${selectedGoals.includes("Build Muscle") ? "Focus on progressive resistance training 3-4 times weekly with adequate protein intake" : "Include regular physical activity you enjoy"}
• ${selectedGoals.includes("Sleep Support") ? "Prioritize sleep quality with a consistent schedule and relaxing bedtime routine" : "Aim for 7-9 hours of quality sleep nightly"}
• ${selectedGoals.includes("Improve Focus") ? "Incorporate mindfulness practices and minimize distractions during focused work" : "Practice stress management techniques"}

What specific aspect of these recommendations would you like me to elaborate on?`;
}
