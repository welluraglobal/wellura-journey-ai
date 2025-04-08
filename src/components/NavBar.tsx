
import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  User,
  MessageCircle,
  BarChart,
  Settings,
  Menu,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const NavBar = () => {
  const { firstName, setIsLoggedIn, setHasProfile, userProfile } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const handleLogout = () => {
    // This will be replaced with actual Supabase auth logout once integrated
    localStorage.removeItem("wellura-authenticated");
    localStorage.removeItem("wellura-has-profile");
    localStorage.removeItem("wellura-first-name");
    setIsLoggedIn(false);
    setHasProfile(false);
    navigate("/");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "My Plan", path: "/plan-generator", icon: BarChart },
    { name: "AI Consultant", path: "/chat", icon: MessageCircle },
    // Removed Profile from the main nav items as requested
    // Removed Settings from main nav to avoid 404 errors
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle navigation for both links and buttons
  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    setIsMenuOpen(false);
    navigate(path);
  };

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  return (
    <TooltipProvider>
      <nav className="py-4 px-6 border-b flex items-center justify-between bg-gradient-wellura text-white relative">
        <div className="flex items-center">
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center ml-10 space-x-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center space-x-1 ${
                  isActive(item.path)
                    ? "text-white font-medium"
                    : "text-white/80 hover:text-white transition-colors"
                } bg-transparent border-0 cursor-pointer`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          {/* Profile Button */}
          <Button 
            variant="outline" 
            className="mr-3 hidden md:flex text-white border-white/30 bg-white/10 hover:bg-white/20"
            onClick={toggleProfileCard}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden md:flex text-white border-white/30 bg-white/10 hover:bg-white/20">
                <User className="h-4 w-4 mr-2" />
                {firstName || "User"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center space-x-2 py-2 w-full text-left ${
                      isActive(item.path)
                        ? "text-wellura-500 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </button>
                ))}
                <button
                  onClick={toggleProfileCard}
                  className="flex items-center space-x-2 py-2 w-full text-left text-muted-foreground"
                >
                  <User size={20} />
                  <span>Profile</span>
                </button>
                <div className="pt-4 mt-4 border-t">
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Profile Card */}
        {showProfileCard && (
          <div className="absolute top-16 right-6 z-50">
            <Card className="w-80 shadow-lg border-2">
              <CardHeader className="bg-gradient-wellura text-white">
                <CardTitle className="text-xl">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Welcome, {firstName || "User"}!
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Your Profile Information:</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="col-span-2 font-medium">{userProfile?.first_name || "-"} {userProfile?.last_name || ""}</span>
                    
                    <span className="text-muted-foreground">Email:</span>
                    <span className="col-span-2 font-medium">{userProfile?.email || "-"}</span>
                    
                    <span className="text-muted-foreground">Goal:</span>
                    <span className="col-span-2 font-medium">{userProfile?.main_goal || "-"}</span>
                    
                    {userProfile?.age && (
                      <>
                        <span className="text-muted-foreground">Age:</span>
                        <span className="col-span-2 font-medium">{userProfile?.age}</span>
                      </>
                    )}
                    
                    {userProfile?.gender && (
                      <>
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="col-span-2 font-medium">{userProfile?.gender}</span>
                      </>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => {
                      setShowProfileCard(false);
                      navigate("/profile-setup");
                    }}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
};

export default NavBar;
