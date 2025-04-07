
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MapPin, Star, ExternalLink, Phone, AlertCircle, Loader2, Info, Filter, SlidersHorizontal } from "lucide-react";
import { searchNearbyPlaces } from "@/utils/placesApi";
import { PlaceResult } from "@/utils/types";
import BackButton from "@/components/BackButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const NearbyGyms = () => {
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gyms, setGyms] = useState<PlaceResult[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<PlaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50); // in km
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      rating: [0],
      distance: [50]
    }
  });

  // Apply filters whenever gyms, minRating, or maxDistance changes
  useEffect(() => {
    if (gyms.length > 0) {
      const filtered = gyms.filter(gym => {
        const matchesRating = !gym.rating || gym.rating >= minRating;
        const matchesDistance = !gym.distance || (gym.distance / 1000) <= maxDistance;
        return matchesRating && matchesDistance;
      });
      
      setFilteredGyms(filtered);
    } else {
      setFilteredGyms([]);
    }
  }, [gyms, minRating, maxDistance]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) {
      toast({
        title: "Please enter a city",
        description: "A city name is required to search for nearby gyms.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const results = await searchNearbyPlaces(city, "gym");
      setGyms(results);
      
      if (results.length === 0) {
        toast({
          title: "No gyms found",
          description: `We couldn't find any gyms near ${city}. Try a different location.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Search successful",
          description: `Found ${results.length} gyms near ${city}.`,
        });
      }
    } catch (error) {
      console.error("Error searching for gyms:", error);
      
      // Determine if it's a location not found error
      const errorMsg = error instanceof Error ? error.message : "There was an error searching for gyms. Please try again later.";
      setError(errorMsg);
      
      // Show appropriate toast based on error type
      if (errorMsg.includes("Location not found") || errorMsg.includes("couldn't find this location")) {
        toast({
          title: "Location not found",
          description: "We couldn't find this city. Please check the spelling or try a more specific location.",
          variant: "destructive"
        });
      } else if (errorMsg.includes("API key not configured")) {
        toast({
          title: "Configuration error",
          description: "The Google Places API key is not configured. Please contact the site administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Search failed",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (value: number[]) => {
    setMinRating(value[0]);
  };

  const handleDistanceChange = (value: number[]) => {
    setMaxDistance(value[0]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Nearby Gyms</h1>
            <p className="text-muted-foreground">
              Discover the highest-rated gyms in your area to support your fitness journey.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter your city (e.g., Seattle, New York)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : "Find Gyms"}
              </Button>
            </div>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {gyms.length > 0 && (
            <>
              <div className="mb-6">
                <Collapsible 
                  open={isFiltersOpen} 
                  onOpenChange={setIsFiltersOpen}
                  className="w-full border rounded-md p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <h3 className="text-sm font-medium">Filter Results</h3>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="ml-2">{isFiltersOpen ? "Hide Filters" : "Show Filters"}</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Minimum Rating</label>
                          <span className="text-sm text-muted-foreground">{minRating.toFixed(1)}/5</span>
                        </div>
                        <Slider 
                          value={[minRating]} 
                          min={0} 
                          max={5} 
                          step={0.5} 
                          onValueChange={handleRatingChange}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Maximum Distance</label>
                          <span className="text-sm text-muted-foreground">{maxDistance} km</span>
                        </div>
                        <Slider 
                          value={[maxDistance]} 
                          min={1} 
                          max={50} 
                          step={1} 
                          onValueChange={handleDistanceChange}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm pt-2">
                        <span>Showing {filteredGyms.length} of {gyms.length} gyms</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setMinRating(0);
                            setMaxDistance(50);
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGyms.map((gym) => (
                  <Card key={gym.place_id} className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl flex justify-between items-start">
                        <span>{gym.name}</span>
                        {gym.rating && (
                          <span className="flex items-center text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" />
                            {gym.rating.toFixed(1)}
                            {gym.user_ratings_total && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({gym.user_ratings_total})
                              </span>
                            )}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {gym.vicinity && (
                        <div className="flex items-start mb-3">
                          <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
                          <p className="text-muted-foreground">{gym.vicinity}</p>
                        </div>
                      )}
                      {gym.distance && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Approximately {(gym.distance / 1000).toFixed(1)} km away
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0 flex-wrap gap-2">
                      {gym.url && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a href={gym.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View on Map
                          </a>
                        </Button>
                      )}
                      {gym.phone && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a href={`tel:${gym.phone}`}>
                            <Phone className="w-4 h-4 mr-1" />
                            Contact
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {filteredGyms.length === 0 && (
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>No results match your filters</AlertTitle>
                  <AlertDescription>
                    Try adjusting your filter settings to see more results.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          
          {gyms.length === 0 && hasSearched && !isLoading && !error && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>No gyms found</AlertTitle>
              <AlertDescription>
                We couldn't find any gyms near {city}. Try a different city name or check your spelling.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
};

export default NearbyGyms;
