
import React from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/sheet";
import { NavItem, navItems } from "./NavItems";

interface MobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  isActive: (path: string) => boolean;
  handleNavigation: (path: string) => void;
  toggleProfileCard: () => void;
  handleLogout: () => void;
  isLoggingOut?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  isActive,
  handleNavigation,
  toggleProfileCard,
  handleLogout,
  isLoggingOut = false,
}) => {
  return (
    <SheetContent>
      <div className="flex flex-col space-y-4 mt-6">
        {navItems.map((item: NavItem) => (
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
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </SheetContent>
  );
};

export default MobileNavigation;
