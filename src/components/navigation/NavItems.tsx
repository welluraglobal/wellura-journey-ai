
import { Home, BarChart, MessageCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "My Plan", path: "/plan-generator", icon: BarChart },
  { name: "AI Consultant", path: "/chat", icon: MessageCircle },
];
