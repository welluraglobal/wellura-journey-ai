
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
    if (window.history.length > 2) {
      navigate(-1); // Go back in history if possible
    } else {
      // Navigate directly to the fallback path
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleBack}
      className={`flex items-center gap-2 mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;
