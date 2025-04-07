
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

/**
 * Create a standard error response
 * @param status HTTP status code
 * @param error Error code/type
 * @param message User-friendly error message
 * @param technicalDetails Optional technical details for debugging
 */
function createErrorResponse(status: number, error: string, message: string, technicalDetails?: string) {
  console.error(`❌ Error response: ${status} - ${error} - ${message}`);
  
  const responseBody = {
    error,
    message,
    ...(technicalDetails && { technical_details: technicalDetails })
  };
  
  return new Response(
    JSON.stringify(responseBody),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

/**
 * Validate the Google Places API key
 * @returns Error response or null if valid
 */
function validateApiKey() {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error("❌ Google Places API key is not configured");
    return createErrorResponse(
      500,
      "API key not configured", 
      "The Google Places API key is missing in Supabase secrets."
    );
  }
  return null;
}

/**
 * Parse and validate the request body
 * @param req The request object
 * @returns Parsed body or error response
 */
async function parseRequestBody(req: Request) {
  try {
    const body = await req.json();
    console.log("✅ Request body parsed:", JSON.stringify(body).slice(0, 200) + "...");
    
    // Validate required parameters
    const { location, type } = body;
    if (!location) {
      console.error("❌ Missing location parameter");
      return { 
        error: createErrorResponse(
          400,
          "Missing parameter", 
          "Location is required."
        )
      };
    }
    
    return { body };
  } catch (parseError) {
    console.error("❌ Error parsing request body:", parseError);
    return { 
      error: createErrorResponse(
        400,
        "Invalid request body", 
        "The request body could not be parsed as JSON."
      ) 
    };
  }
}

/**
 * Geocode a location string to coordinates
 * @param location Location string (address, city, etc)
 * @returns Coordinates or error response
 */
async function geocodeLocation(location: string) {
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_PLACES_API_KEY}`;
  
  console.log("✅ Fetching geocode data...");
  let geocodeRes;
  
  try {
    geocodeRes = await fetch(geocodeUrl);
    console.log("✅ Geocode API responded with status:", geocodeRes.status);
  } catch (fetchError) {
    console.error("❌ Error fetching from Geocoding API:", fetchError);
    return { 
      error: createErrorResponse(
        502,
        "Geocoding API error", 
        "Failed to contact the Google Geocoding API. Please try again later."
      ) 
    };
  }

  // Parse geocode response
  let geocodeData;
  try {
    geocodeData = await geocodeRes.json();
    console.log("✅ Geocode API status:", geocodeData.status);
    console.log("✅ Geocode API results count:", geocodeData.results?.length || 0);
  } catch (jsonError) {
    console.error("❌ Error parsing Geocoding API response:", jsonError);
    return { 
      error: createErrorResponse(
        502,
        "Invalid Geocoding API response", 
        "Failed to parse the Geocoding API response."
      ) 
    };
  }
  
  // Handle HTTP errors from geocode API
  if (geocodeRes.status !== 200) {
    console.error("❌ Geocoding API HTTP error:", geocodeRes.status, geocodeData.error_message || "");
    return { 
      error: createErrorResponse(
        502,
        "Geocoding API error", 
        geocodeData.error_message || "Failed to convert location to coordinates."
      ) 
    };
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
    
    return { 
      error: createErrorResponse(
        403,
        "API authorization error", 
        userMessage,
        errorMessage
      ) 
    };
  }

  // Check Google API-specific status
  if (geocodeData.status !== "OK") {
    console.error("❌ Geocoding API returned non-OK status:", geocodeData.status);
    
    // Handle common geocoding errors
    if (geocodeData.status === "ZERO_RESULTS") {
      return { 
        error: createErrorResponse(
          404,
          "Location not found", 
          "We couldn't find this location. Please try a more specific city name or check spelling."
        ) 
      };
    } else {
      return { 
        error: createErrorResponse(
          500,
          geocodeData.status, 
          geocodeData.error_message || "Error processing location."
        ) 
      };
    }
  }

  // Check for empty geocode results
  if (!geocodeData.results || geocodeData.results.length === 0) {
    console.log("❌ No geocode results found");
    return { 
      error: createErrorResponse(
        404,
        "Location not found", 
        "We couldn't find this location. Please try a more specific city name or check spelling."
      ) 
    };
  }

  // Extract coordinates from geocode response
  const { lat, lng } = geocodeData.results[0].geometry.location;
  console.log(`✅ Coordinates for ${location}: ${lat}, ${lng}`);
  
  return { coordinates: { lat, lng } };
}

/**
 * Search for places near coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @param type Place type or keyword
 * @returns Places data or error response
 */
async function searchNearbyPlaces(lat: number, lng: number, type: string) {
  const radius = 10000; // 10km radius
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(type || "")}&key=${GOOGLE_PLACES_API_KEY}`;
  
  console.log("✅ Fetching places data...");
  let placesRes;
  
  try {
    placesRes = await fetch(placesUrl);
    console.log("✅ Places API responded with status:", placesRes.status);
  } catch (fetchError) {
    console.error("❌ Error fetching from Places API:", fetchError);
    return { 
      error: createErrorResponse(
        502,
        "Places API error", 
        "Failed to contact the Google Places API. Please try again later."
      ) 
    };
  }

  // Parse places response
  let placesData;
  try {
    placesData = await placesRes.json();
    console.log("✅ Places API status:", placesData.status);
    console.log("✅ Places API results count:", placesData.results?.length || 0);
  } catch (jsonError) {
    console.error("❌ Error parsing Places API response:", jsonError);
    return { 
      error: createErrorResponse(
        502,
        "Invalid Places API response", 
        "Failed to parse the Places API response."
      ) 
    };
  }
  
  // Handle HTTP errors from places API
  if (placesRes.status !== 200) {
    console.error("❌ Places API HTTP error:", placesRes.status, placesData.error_message || "");
    return { 
      error: createErrorResponse(
        502,
        "Places API error", 
        placesData.error_message || "Failed to fetch places."
      ) 
    };
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
    
    return { 
      error: createErrorResponse(
        403,
        "API authorization error", 
        userMessage,
        errorMessage
      ) 
    };
  }

  // Check Google API-specific status
  if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
    console.error("❌ Places API returned error status:", placesData.status, placesData.error_message || "");
    return { 
      error: createErrorResponse(
        500,
        placesData.status, 
        placesData.error_message || "Error finding places near this location."
      ) 
    };
  }

  return { placesData };
}

/**
 * Process places data to add distance calculations and sort by proximity
 * @param placesData Raw Places API response
 * @param originLat Origin latitude
 * @param originLng Origin longitude
 * @returns Processed places data
 */
function processPlacesData(placesData: any, originLat: number, originLng: number) {
  // Handle zero results case
  if (placesData.status === "ZERO_RESULTS" || !placesData.results || placesData.results.length === 0) {
    console.log("✅ No places found - returning empty results array");
    return {
      results: [],
      status: "ZERO_RESULTS",
      message: `No places found near this location. Try a different location or search term.`
    };
  }

  // Process the results to add distance and enhance data
  if (placesData.results && Array.isArray(placesData.results)) {
    console.log(`✅ Found ${placesData.results.length} places - processing results`);
    
    placesData.results = placesData.results.map((place: any) => {
      // Calculate approximate distance (very basic)
      if (place.geometry && place.geometry.location) {
        const placeLat = place.geometry.location.lat;
        const placeLng = place.geometry.location.lng;
        
        // Haversine formula (approximate)
        const R = 6371; // Earth's radius in km
        const dLat = (placeLat - originLat) * Math.PI / 180;
        const dLng = (placeLng - originLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(originLat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) * 
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
  }

  return placesData;
}

// Main request handler
serve(async (req) => {
  // Log each request
  console.log("✅ Request received:", req.method, new URL(req.url).pathname);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKeyError = validateApiKey();
    if (apiKeyError) return apiKeyError;

    // Parse request body
    const { body, error: bodyError } = await parseRequestBody(req);
    if (bodyError) return bodyError;

    const { location, type } = body;
    console.log(`✅ Searching for ${type || "places"} in ${location}`);

    // STEP 1: Convert the location (city name) to coordinates
    const { coordinates, error: geocodeError } = await geocodeLocation(location);
    if (geocodeError) return geocodeError;

    // STEP 2: Search for places using the Nearby Search API
    const { placesData, error: placesError } = await searchNearbyPlaces(
      coordinates.lat, 
      coordinates.lng, 
      type || ""
    );
    if (placesError) return placesError;

    // Process and enhance places data
    const processedData = processPlacesData(placesData, coordinates.lat, coordinates.lng);

    console.log("✅ Successfully found and processed places data - returning results");
    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Catch-all error handler to ensure we always return a response
    console.error("❌ Unhandled error in edge function:", error);
    
    return createErrorResponse(
      500,
      "Internal server error", 
      error.message || "An unexpected error occurred. Please try again later."
    );
  }
});
