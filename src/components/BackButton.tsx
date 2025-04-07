
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

const BackButton = ({ fallbackPath = "/", className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    try {
      // Try to go back to the previous page
      navigate(-1);
    } catch (error) {
      // If there's an error (e.g., no history), navigate to the fallback path
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleBack}
      className={`back-button ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;
