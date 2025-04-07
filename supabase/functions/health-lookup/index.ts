
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.0.0";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { query, userProfile } = await req.json();

    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Create a system message that instructs the model to provide health information
    const systemMessage = `You are a health information specialist providing the latest evidence-based information about health topics.
    Respond with accurate, up-to-date health information from reliable sources like medical journals, WHO, CDC, or Mayo Clinic.
    Be concise but thorough. If the query is about supplements, nutrition, exercise, sleep, or other health topics, provide
    evidence-based information. If the information requested would require medical advice, clarify that you're providing general
    information and the user should consult a healthcare professional.`;

    // Add user profile context if available
    let userContext = "";
    if (userProfile) {
      userContext = `Consider that this user has the following profile:
      - Age: ${userProfile.age || 'unknown'}
      - Gender: ${userProfile.gender || 'unknown'}
      - Height: ${userProfile.height || 'unknown'}
      - Weight: ${userProfile.weight || 'unknown'}
      - Main health goal: ${userProfile.main_goal || 'unknown'}
      
      Tailor your response to be relevant to their profile when appropriate.`;
    }

    // Combine the system message with user context
    const fullSystemMessage = systemMessage + (userContext ? "\n\n" + userContext : "");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: fullSystemMessage },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    // Log the successful response
    console.log("Health lookup successful for query:", query);

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in health-lookup function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message, 
      fallback: true, 
      message: "I couldn't access live data right now, but I can still help with what I know." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
