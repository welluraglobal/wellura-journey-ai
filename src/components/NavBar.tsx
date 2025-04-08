
import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProfileCard from "@/components/profile/ProfileCard";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const NavBar = () => {
  const { firstName, setIsLoggedIn, setHasProfile, userProfile } = useContext(UserContext);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Call the signOut function from AuthContext
      await signOut();
      // Update local state after successful signout
      setIsLoggedIn(false);
      setHasProfile(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "There was a problem signing out. Please try again."
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    setIsMenuOpen(false);
    navigate(path);
  };

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  const handleEditProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileCard(false);
    setTimeout(() => {
      navigate("/profile-setup");
    }, 10);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileCardRef.current && 
        !profileCardRef.current.contains(event.target as Node) &&
        profileButtonRef.current && 
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowProfileCard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <TooltipProvider>
      <nav className="py-4 px-6 border-b flex items-center bg-gradient-wellura text-white relative">
        <div className="flex items-center flex-grow">
          {location.pathname !== "/" && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack} 
              className="mr-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <button 
            onClick={() => navigate("/dashboard")} 
            className="text-xl font-bold text-white mr-2 bg-transparent border-0 cursor-pointer"
          >
            Wellura App
          </button>
          
          <DesktopNavigation 
            firstName={firstName}
            isActive={isActive}
            handleNavigation={handleNavigation}
            toggleProfileCard={toggleProfileCard}
            handleLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </div>

        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <MobileNavigation 
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              isActive={isActive}
              handleNavigation={handleNavigation}
              toggleProfileCard={toggleProfileCard}
              handleLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          </Sheet>
        </div>

        {showProfileCard && (
          <div ref={profileCardRef} className="absolute top-16 right-6 z-50">
            <ProfileCard
              userProfile={userProfile}
              onEditProfile={handleEditProfile}
            />
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
};

export default NavBar;
