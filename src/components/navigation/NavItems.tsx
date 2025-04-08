
import { Home, BarChart, MessageCircle } from "lucide-react";

export type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "My Plan", path: "/plan-generator", icon: BarChart },
  { name: "AI Consultant", path: "/chat", icon: MessageCircle },
];
