
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FindProfessionals = () => {
  const [city, setCity] = useState("");
  const [professionalType, setProfessionalType] = useState("nutritionist");
  const [isLoading, setIsLoading] = useState(false);
  const [professionals, setProfessionals] = useState<PlaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const professionalTypes = [
    { value: "nutritionist", label: "Nutritionist" },
    { value: "personal trainer", label: "Personal Trainer" },
    { value: "physical therapist", label: "Physical Therapist" },
    { value: "chiropractor", label: "Chiropractor" },
    { value: "massage therapist", label: "Massage Therapist" },
    { value: "dermatologist", label: "Dermatologist" },
    { value: "psychologist", label: "Psychologist" },
    { value: "dietitian", label: "Dietitian" },
    { value: "endocrinologist", label: "Endocrinologist" }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) {
      toast({
        title: "Please enter a city",
        description: "A city name is required to search for health professionals.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const results = await searchNearbyPlaces(city, professionalType);
      setProfessionals(results);
      
      if (results.length === 0) {
        toast({
          title: "No professionals found",
          description: `We couldn't find any ${professionalType}s near ${city}. Try a different location or professional type.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching for professionals:", error);
      setError(error instanceof Error ? error.message : "There was an error searching for health professionals. Please try again later.");
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "There was an error searching for health professionals. Please try again later.",
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
            <h1 className="text-3xl font-bold mb-2">Find Health Professionals</h1>
            <p className="text-muted-foreground">
              Discover qualified health professionals in your area based on your specific needs.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter your city (e.g., Los Angeles)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-64">
                <Select 
                  value={professionalType} 
                  onValueChange={setProfessionalType}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select professional type" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : "Find Professionals"}
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
          
          {professionals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professionals.map((professional) => (
                <Card key={professional.place_id} className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex justify-between items-start">
                      <span>{professional.name}</span>
                      {professional.rating && (
                        <span className="flex items-center text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" />
                          {professional.rating.toFixed(1)}
                          {professional.user_ratings_total && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({professional.user_ratings_total})
                            </span>
                          )}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {professional.vicinity && (
                      <div className="flex items-start mb-3">
                        <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
                        <p className="text-muted-foreground">{professional.vicinity}</p>
                      </div>
                    )}
                    {professional.distance && (
                      <p className="text-sm text-muted-foreground mb-3">
                        Approximately {(professional.distance / 1000).toFixed(1)} km away
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0 flex-wrap gap-2">
                    {professional.url && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={professional.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View on Map
                        </a>
                      </Button>
                    )}
                    {professional.phone && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={`tel:${professional.phone}`}>
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
          
          {professionals.length === 0 && hasSearched && !isLoading && !error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No professionals found for this location. Try a different city or professional type.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FindProfessionals;
