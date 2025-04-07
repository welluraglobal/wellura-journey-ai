
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MapPin, Star, ExternalLink, Phone, AlertCircle, Loader2 } from "lucide-react";
import { searchNearbyPlaces } from "@/utils/placesApi";
import { PlaceResult } from "@/utils/types";
import BackButton from "@/components/BackButton";

const NearbyGyms = () => {
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gyms, setGyms] = useState<PlaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

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
      }
    } catch (error) {
      console.error("Error searching for gyms:", error);
      setError(error instanceof Error ? error.message : "There was an error searching for gyms. Please try again later.");
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "There was an error searching for gyms. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
                  placeholder="Enter your city (e.g., San Francisco)"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gyms.map((gym) => (
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
          )}
          
          {gyms.length === 0 && hasSearched && !isLoading && !error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No gyms found for this location. Try a different city.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NearbyGyms;
