
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Initialize with clear log
console.log("✅ FUNCTION INITIALIZED: google-places-search edge function starting");

// Access Google Places API key from environment variables
const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

// Log API key status (without exposing the actual key)
console.log("✅ Google Places API key configured:", GOOGLE_PLACES_API_KEY ? "Yes (length: " + GOOGLE_PLACES_API_KEY.length + ")" : "No");

// Define CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Log each request
  console.log("✅ Request received:", req.method, new URL(req.url).pathname);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key before processing request
    if (!GOOGLE_PLACES_API_KEY) {
      console.error("❌ Google Places API key is not configured");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          message: "The Google Places API key is missing in Supabase secrets."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("✅ Request body parsed:", JSON.stringify(requestBody).slice(0, 200) + "...");
    } catch (parseError) {
      console.error("❌ Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request body", 
          message: "The request body could not be parsed as JSON."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required parameters
    const { location, type } = requestBody;
    if (!location) {
      console.error("❌ Missing location parameter");
      return new Response(
        JSON.stringify({ 
          error: "Missing parameter", 
          message: "Location is required." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Searching for ${type || "places"} in ${location}`);

    // STEP 1: Convert the location (city name) to coordinates using Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log("✅ Fetching geocode data...");
    let geocodeRes;
    try {
      geocodeRes = await fetch(geocodeUrl);
      console.log("✅ Geocode API responded with status:", geocodeRes.status);
    } catch (fetchError) {
      console.error("❌ Error fetching from Geocoding API:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Geocoding API error", 
          message: "Failed to contact the Google Geocoding API. Please try again later." 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse geocode response
    let geocodeData;
    try {
      geocodeData = await geocodeRes.json();
      console.log("✅ Geocode API status:", geocodeData.status);
      console.log("✅ Geocode API results count:", geocodeData.results?.length || 0);
    } catch (jsonError) {
      console.error("❌ Error parsing Geocoding API response:", jsonError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid Geocoding API response", 
          message: "Failed to parse the Geocoding API response." 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle HTTP errors from geocode API
    if (geocodeRes.status !== 200) {
      console.error("❌ Geocoding API HTTP error:", geocodeRes.status, geocodeData.error_message || "");
      return new Response(
        JSON.stringify({ 
          error: "Geocoding API error", 
          message: geocodeData.error_message || "Failed to convert location to coordinates." 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for API authorization issues
    if (geocodeData.status === "REQUEST_DENIED") {
      const errorMessage = geocodeData.error_message || "API request was denied";
      console.error("❌ Google API authorization error:", errorMessage);
      
      let userMessage = "The Google Places API request was denied. ";
      
      if (errorMessage.includes("not authorized")) {
        userMessage += "Your API key may not have the Geocoding API enabled. Please enable it in your Google Cloud Console.";
      } else if (errorMessage.includes("API key")) {
        userMessage += "There may be an issue with your API key. Please check that it's valid and doesn't have any restrictions.";
      } else {
        userMessage += errorMessage;
      }
      
      return new Response(
        JSON.stringify({ 
          error: "API authorization error", 
          message: userMessage,
          technical_details: errorMessage
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check Google API-specific status
    if (geocodeData.status !== "OK") {
      console.error("❌ Geocoding API returned non-OK status:", geocodeData.status);
      
      // Handle common geocoding errors
      if (geocodeData.status === "ZERO_RESULTS") {
        return new Response(
          JSON.stringify({ 
            error: "Location not found", 
            message: "We couldn't find this location. Please try a more specific city name or check spelling."
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            error: geocodeData.status, 
            message: geocodeData.error_message || "Error processing location." 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check for empty geocode results
    if (!geocodeData.results || geocodeData.results.length === 0) {
      console.log("❌ No geocode results found");
      return new Response(
        JSON.stringify({ 
          error: "Location not found", 
          message: "We couldn't find this location. Please try a more specific city name or check spelling."
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract coordinates from geocode response
    const { lat, lng } = geocodeData.results[0].geometry.location;
    console.log(`✅ Coordinates for ${location}: ${lat}, ${lng}`);

    // STEP 2: Search for places using the Nearby Search API
    const radius = 10000; // 10km radius
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(type || "")}&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log("✅ Fetching places data...");
    let placesRes;
    try {
      placesRes = await fetch(placesUrl);
      console.log("✅ Places API responded with status:", placesRes.status);
    } catch (fetchError) {
      console.error("❌ Error fetching from Places API:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Places API error", 
          message: "Failed to contact the Google Places API. Please try again later." 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse places response
    let placesData;
    try {
      placesData = await placesRes.json();
      console.log("✅ Places API status:", placesData.status);
      console.log("✅ Places API results count:", placesData.results?.length || 0);
    } catch (jsonError) {
      console.error("❌ Error parsing Places API response:", jsonError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid Places API response", 
          message: "Failed to parse the Places API response." 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle HTTP errors from places API
    if (placesRes.status !== 200) {
      console.error("❌ Places API HTTP error:", placesRes.status, placesData.error_message || "");
      return new Response(
        JSON.stringify({ 
          error: "Places API error", 
          message: placesData.error_message || "Failed to fetch places." 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for API authorization issues with Places API
    if (placesData.status === "REQUEST_DENIED") {
      const errorMessage = placesData.error_message || "API request was denied";
      console.error("❌ Google Places API authorization error:", errorMessage);
      
      let userMessage = "The Google Places API request was denied. ";
      
      if (errorMessage.includes("not authorized")) {
        userMessage += "Your API key may not have the Places API enabled. Please enable it in your Google Cloud Console.";
      } else if (errorMessage.includes("API key")) {
        userMessage += "There may be an issue with your API key. Please check that it's valid and doesn't have any restrictions.";
      } else {
        userMessage += errorMessage;
      }
      
      return new Response(
        JSON.stringify({ 
          error: "API authorization error", 
          message: userMessage,
          technical_details: errorMessage
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check Google API-specific status
    if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
      console.error("❌ Places API returned error status:", placesData.status, placesData.error_message || "");
      return new Response(
        JSON.stringify({ 
          error: placesData.status, 
          message: placesData.error_message || "Error finding places near this location." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle zero results case
    if (placesData.status === "ZERO_RESULTS" || !placesData.results || placesData.results.length === 0) {
      console.log("✅ No places found - returning empty results array");
      return new Response(
        JSON.stringify({ 
          results: [],
          status: "ZERO_RESULTS",
          message: `No ${type || "places"} found near ${location}. Try a different location or search term.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the results to add distance and enhance data
    if (placesData.results && Array.isArray(placesData.results)) {
      console.log(`✅ Found ${placesData.results.length} places - processing results`);
      
      placesData.results = placesData.results.map((place) => {
        // Calculate approximate distance (very basic)
        if (place.geometry && place.geometry.location) {
          const placeLat = place.geometry.location.lat;
          const placeLng = place.geometry.location.lng;
          
          // Haversine formula (approximate)
          const R = 6371; // Earth's radius in km
          const dLat = (placeLat - lat) * Math.PI / 180;
          const dLng = (placeLng - lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c * 1000; // Distance in meters
          
          place.distance = distance;
        }
        
        return place;
      });
      
      // Sort by distance
      placesData.results.sort((a, b) => {
        return (a.distance || Infinity) - (b.distance || Infinity);
      });
    }

    console.log("✅ Successfully found and processed places data - returning results");
    return new Response(
      JSON.stringify(placesData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Catch-all error handler to ensure we always return a response
    console.error("❌ Unhandled error in edge function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message || "An unexpected error occurred. Please try again later." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
