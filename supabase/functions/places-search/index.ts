
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    // Log geocoding response for debugging
    console.log("Geocode API response status:", geocodeRes.status);
    
    if (geocodeRes.status !== 200) {
      console.error("Geocoding API error:", geocodeData);
      return new Response(
        JSON.stringify({ 
          error: "Geocoding API error", 
          message: geocodeData.error_message || "Failed to convert location to coordinates" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return new Response(
        JSON.stringify({ error: "Location not found", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    console.log(`Coordinates for ${location}: ${lat}, ${lng}`);

    // Step 2: Search for places using the Nearby Search API
    const radius = 10000; // 10km radius
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(type)}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    // Log places API response for debugging
    console.log("Places API response status:", placesRes.status);
    
    if (placesRes.status !== 200) {
      console.error("Places API error:", placesData);
      return new Response(
        JSON.stringify({ 
          error: "Places API error", 
          message: placesData.error_message || "Failed to fetch places" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the results to add distance and enhance data
    if (placesData.results && Array.isArray(placesData.results)) {
      console.log(`Found ${placesData.results.length} places`);
      
      placesData.results = placesData.results.map((place: any) => {
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
      placesData.results.sort((a: any, b: any) => {
        return (a.distance || Infinity) - (b.distance || Infinity);
      });
    } else {
      console.log("No places found or invalid response");
    }

    return new Response(
      JSON.stringify(placesData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
