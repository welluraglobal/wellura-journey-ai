
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavItem, navItems } from "./NavItems";

interface DesktopNavigationProps {
  firstName: string | null;
  isActive: (path: string) => boolean;
  handleNavigation: (path: string) => void;
  toggleProfileCard: () => void;
  handleLogout: () => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  firstName,
  isActive,
  handleNavigation,
  toggleProfileCard,
  handleLogout,
}) => {
  return (
    <>
      <div className="hidden md:flex items-center ml-10 space-x-6">
        {navItems.map((item: NavItem) => (
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

      <div className="flex items-center">
        <Button
          variant="outline"
          className="mr-3 hidden md:flex text-white border-white/30 bg-white/10 hover:bg-white/20"
          onClick={toggleProfileCard}
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>

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
            <DropdownMenuItem onClick={() => handleNavigation('/dashboard')}>
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
      </div>
    </>
  );
};

export default DesktopNavigation;
