
import React from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WelluraPlaylistButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const WelluraPlaylistButton: React.FC<WelluraPlaylistButtonProps> = ({
  className = "",
  variant = "outline",
  size = "sm"
}) => {
  const { toast } = useToast();
  const welluraPlaylistUrl = "https://music.apple.com/us/playlist/wellura-energy/pl.u-EdAVklWuqDlPWJ3";

  const openWelluraPlaylist = () => {
    window.open(welluraPlaylistUrl, "_blank");
    toast({
      title: "Opening Wellura Playlist",
      description: "Enjoy your workout with Wellura Energy playlist!",
    });
  };

  return (
    <Button 
      onClick={openWelluraPlaylist} 
      variant={variant} 
      size={size} 
      className={`flex items-center gap-2 ${className}`}
    >
      <Music className="h-4 w-4" />
      LISTEN TO WELLURA PLAYLIST
    </Button>
  );
};

export default WelluraPlaylistButton;
