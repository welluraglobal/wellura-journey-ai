
// Define shared types for the application

// Google Places API result type
export interface PlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  };
  distance?: number;
  url?: string;
  website?: string;
  phone?: string;
  formatted_phone_number?: string;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
}
