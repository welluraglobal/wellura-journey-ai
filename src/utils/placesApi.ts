
import { PlaceResult } from "./types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Search for places near a specified location using the Google Places API.
 * 
 * @param location - The location (city, address) to search near
 * @param type - The type of place to search for (gym, nutritionist, etc.)
 * @returns A promise that resolves to an array of place results
 */
export const searchNearbyPlaces = async (location: string, type: string): Promise<PlaceResult[]> => {
  try {
    console.log(`Searching for ${type} near ${location}...`);
    
    // Use Supabase Edge Function to proxy the Places API request
    const { data, error } = await supabase.functions.invoke("google-places-search", {
      body: { 
        location,
        type
      }
    });
    
    if (error) {
      console.error("Error from Places API:", error);
      
      // Check if it's a configuration error
      if (error.message?.includes("API key not configured")) {
        throw new Error("Google Places API key not configured. Please contact the site administrator.");
      }
      
      // Check if it's an authorization error
      if (error.message?.includes("authorization error") || error.message?.includes("API request was denied")) {
        throw new Error(error.message || "The Google Places API key doesn't have the necessary permissions. Please enable the required APIs in Google Cloud Console.");
      }
      
      // Propagate the error message
      throw new Error(error.message || "Failed to search for places");
    }
    
    if (!data) {
      console.warn("No data returned from Places API");
      return [];
    }
    
    // Check for error messages in the response data
    if (data.error) {
      console.error("Error in Places API response:", data.error, data.message || data.error_message);
      
      // Handle API authorization errors
      if (data.error === "API authorization error") {
        throw new Error(data.message || "The Google Places API key doesn't have the necessary permissions. Please enable the required APIs in Google Cloud Console.");
      }
      
      // Handle location not found errors
      if (data.error === "Location not found") {
        throw new Error(data.message || "We couldn't find this location. Please try a more specific city name or check spelling.");
      }
      
      throw new Error(data.message || data.error_message || data.error || "Error from Places API");
    }
    
    // If zero results but status is OK, return empty array without error
    if (data.status === "ZERO_RESULTS" || (data.results && data.results.length === 0)) {
      console.log("Zero results returned from Places API");
      return [];
    }
    
    if (!Array.isArray(data.results)) {
      console.warn("Invalid results format from Places API:", data);
      return [];
    }
    
    console.log(`Successfully found ${data.results.length} places`);
    
    // Process and return the results
    return data.results.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      vicinity: place.vicinity || place.formatted_address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      geometry: place.geometry,
      distance: place.distance,
      url: place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
      website: place.website,
      phone: place.formatted_phone_number || place.phone_number,
      photos: place.photos,
      opening_hours: place.opening_hours
    }));
  } catch (error) {
    console.error("Error searching for places:", error);
    throw error;
  }
};
