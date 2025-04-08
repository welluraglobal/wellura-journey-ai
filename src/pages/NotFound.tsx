
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Search params:",
      location.search
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-wellura-500 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
        <p className="text-md text-muted-foreground mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Button asChild size="lg">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth?mode=login">Go to Login</Link>
          </Button>
        </div>
        <div className="mt-8 text-sm text-muted-foreground">
          <p>Current path: {location.pathname}</p>
          <p>Search params: {location.search || "(none)"}</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
