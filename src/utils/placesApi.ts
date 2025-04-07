
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
    // Use Supabase Edge Function to proxy the Places API request
    const { data, error } = await supabase.functions.invoke("places-search", {
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
      
      throw new Error(error.message || "Failed to search for places");
    }
    
    if (!data) {
      console.warn("No data returned from Places API");
      return [];
    }
    
    if (data.error) {
      console.error("Error in Places API response:", data.error, data.message);
      throw new Error(data.message || data.error || "Error from Places API");
    }
    
    if (!Array.isArray(data.results)) {
      console.warn("Invalid results format from Places API:", data);
      return [];
    }
    
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
