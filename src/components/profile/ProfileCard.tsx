
import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  main_goal?: string;
  age?: string | number;
  gender?: string;
}

interface ProfileCardProps {
  userProfile: ProfileData | null;
  onEditProfile: (e: React.MouseEvent) => void;
}

const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ userProfile, onEditProfile }, ref) => {
    return (
      <Card ref={ref} className="w-80 shadow-lg border-2">
        <CardHeader className="bg-gradient-wellura text-white">
          <CardTitle className="text-xl">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Welcome, {userProfile?.first_name || "User"}!
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Your Profile Information:</p>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="col-span-2 font-medium">
                {userProfile?.first_name || "-"} {userProfile?.last_name || ""}
              </span>
              
              <span className="text-muted-foreground">Email:</span>
              <span className="col-span-2 font-medium">
                {userProfile?.email || "-"}
              </span>
              
              <span className="text-muted-foreground">Goal:</span>
              <span className="col-span-2 font-medium">
                {userProfile?.main_goal || "-"}
              </span>
              
              {userProfile?.age && (
                <>
                  <span className="text-muted-foreground">Age:</span>
                  <span className="col-span-2 font-medium">{userProfile.age}</span>
                </>
              )}
              
              {userProfile?.gender && (
                <>
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="col-span-2 font-medium">{userProfile.gender}</span>
                </>
              )}
            </div>
            
            <Separator />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={onEditProfile}
            >
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProfileCard.displayName = "ProfileCard";

export default ProfileCard;
