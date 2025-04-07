
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Access Google Places API key from environment variables
const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { location, type } = await req.json();

    // Validate input parameters
    if (!location) {
      return new Response(
        JSON.stringify({ error: "Location is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate API key
    if (!GOOGLE_PLACES_API_KEY) {
      console.error("Google Places API key is not configured");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          message: "The Google Places API key is missing. Please configure it in Supabase secrets."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Searching for ${type} in ${location}`);

    // Step 1: Convert the location (city name) to coordinates using Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log("Fetching geocode data...");
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    // Log geocoding response for debugging
    console.log("Geocode API response status:", geocodeRes.status);
    console.log("Geocode API response status text:", geocodeData.status);
    console.log("Geocode API full response:", JSON.stringify(geocodeData).slice(0, 500) + "...");
    
    if (geocodeRes.status !== 200) {
      console.error("Geocoding API HTTP error:", geocodeRes.status, geocodeRes.statusText);
      return new Response(
        JSON.stringify({ 
          error: "Geocoding API error", 
          message: geocodeData.error_message || "Failed to convert location to coordinates" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for API authorization issues
    if (geocodeData.status === "REQUEST_DENIED") {
      const errorMessage = geocodeData.error_message || "API request was denied";
      console.error("Google API authorization error:", errorMessage);
      
      let userMessage = "The Google Places API request was denied. ";
      
      if (errorMessage.includes("not authorized to use this API")) {
        userMessage += "Your API key doesn't have the necessary APIs enabled. Please enable the Geocoding API, Places API, and Maps JavaScript API in your Google Cloud Console.";
      } else if (errorMessage.includes("API key")) {
        userMessage += "There may be an issue with your API key. Please check that it's valid and doesn't have any restrictions preventing its use.";
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
      console.error("Geocoding API returned non-OK status:", geocodeData.status, geocodeData.error_message);
      
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
            message: geocodeData.error_message || "Error processing location" 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Location not found", 
          message: "We couldn't find this location. Please try a more specific city name or check spelling."
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    console.log(`Coordinates for ${location}: ${lat}, ${lng}`);

    // Step 2: Search for places using the Nearby Search API
    const radius = 10000; // 10km radius
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(type)}&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log("Fetching places data...");
    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    // Log places API response for debugging
    console.log("Places API response status:", placesRes.status);
    console.log("Places API response status text:", placesData.status);
    console.log("Places API response:", JSON.stringify(placesData).slice(0, 500) + "...");
    
    if (placesRes.status !== 200) {
      console.error("Places API HTTP error:", placesRes.status, placesRes.statusText);
      return new Response(
        JSON.stringify({ 
          error: "Places API error", 
          message: placesData.error_message || "Failed to fetch places" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for API authorization issues with Places API
    if (placesData.status === "REQUEST_DENIED") {
      const errorMessage = placesData.error_message || "API request was denied";
      console.error("Google Places API authorization error:", errorMessage);
      
      let userMessage = "The Google Places API request was denied. ";
      
      if (errorMessage.includes("not authorized to use this API")) {
        userMessage += "Your API key doesn't have the Places API enabled. Please enable it in your Google Cloud Console.";
      } else if (errorMessage.includes("API key")) {
        userMessage += "There may be an issue with your API key. Please check that it's valid and doesn't have any restrictions preventing its use.";
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
      console.error("Places API returned error status:", placesData.status, placesData.error_message);
      return new Response(
        JSON.stringify({ 
          error: placesData.status, 
          message: placesData.error_message || "Error finding places near this location" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle zero results case
    if (placesData.status === "ZERO_RESULTS" || !placesData.results || placesData.results.length === 0) {
      console.log("No places found");
      return new Response(
        JSON.stringify({ 
          results: [],
          status: "ZERO_RESULTS",
          message: `No ${type} found near ${location}. Try a different location or search term.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the results to add distance and enhance data
    if (placesData.results && Array.isArray(placesData.results)) {
      console.log(`Found ${placesData.results.length} places`);
      
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
    } else {
      console.log("Invalid results format");
    }

    console.log("Successfully found and processed places data");
    return new Response(
      JSON.stringify(placesData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message || "An unexpected error occurred. Please try again later." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
