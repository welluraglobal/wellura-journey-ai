
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FormField from "./FormField";
import GenderSelection from "./GenderSelection";
import GoalSelection from "./GoalSelection";

export type ProfileFormData = {
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
};

type ProfileFormCardProps = {
  profileData: ProfileFormData;
  updateField: (field: keyof ProfileFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isEditMode: boolean;
};

const ProfileFormCard = ({
  profileData,
  updateField,
  handleSubmit,
  isLoading,
  isEditMode,
}: ProfileFormCardProps) => {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEditMode ? "Edit Your Profile" : "Complete Your Profile"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update your profile information"
            : "Tell us about yourself so we can personalize your wellness journey"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <FormField
            id="fullName"
            label="Full Name"
            value={profileData.fullName}
            onChange={(value) => updateField("fullName", value)}
            placeholder="John Doe"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="age"
              label="Age"
              type="number"
              value={profileData.age}
              onChange={(value) => updateField("age", value)}
              placeholder="30"
              min="1"
            />

            <GenderSelection
              value={profileData.gender}
              onChange={(value) => updateField("gender", value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="height"
              label="Height (in meters)"
              type="number"
              value={profileData.height}
              onChange={(value) => updateField("height", value)}
              placeholder="1.75"
              step="0.01"
              min="0.5"
              max="2.5"
            />

            <FormField
              id="weight"
              label="Weight (in kg)"
              type="number"
              value={profileData.weight}
              onChange={(value) => updateField("weight", value)}
              placeholder="70"
              step="0.1"
              min="30"
              max="250"
            />
          </div>

          <GoalSelection
            value={profileData.goal}
            onChange={(value) => updateField("goal", value)}
          />
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditMode
              ? "Update Profile"
              : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileFormCard;
