
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GoalSelectionProps = {
  value: string;
  onChange: (value: string) => void;
};

const GoalSelection = ({ value, onChange }: GoalSelectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="goal">Main Health Goal</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select your main goal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lose_weight">Lose Weight</SelectItem>
          <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
          <SelectItem value="improve_fitness">Improve Fitness</SelectItem>
          <SelectItem value="increase_energy">Increase Energy</SelectItem>
          <SelectItem value="improve_sleep">Improve Sleep</SelectItem>
          <SelectItem value="reduce_stress">Reduce Stress</SelectItem>
          <SelectItem value="improve_overall">Improve Overall Health</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GoalSelection;
