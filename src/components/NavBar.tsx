
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

const NavBar = () => {
  const { firstName, setIsLoggedIn, setHasProfile } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    { name: "Profile", path: "/profile-setup", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle navigation for both links and buttons
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="py-4 px-6 border-b flex items-center justify-between bg-gradient-wellura text-white">
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
        
        <Link to="/dashboard" className="text-xl font-bold text-white mr-2">
          Wellura App
        </Link>
        
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
            <DropdownMenuItem asChild>
              <button onClick={() => navigate('/profile-setup')} className="w-full text-left">Profile</button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button onClick={() => navigate('/settings')} className="w-full text-left">Settings</button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
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
    </nav>
  );
};

export default NavBar;
