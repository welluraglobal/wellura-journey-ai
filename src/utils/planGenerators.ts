// This file contains utility functions for generating personalized plans

// Calculate body composition based on quiz answers
export const calculateBodyComposition = (quizData: any) => {
  if (!quizData || !quizData.answers) {
    return null;
  }
  
  const {
    age = "30",
    gender = "male",
    height = "170", 
    currentWeight = "70",
    targetWeight = "65",
    waistCircumference = "85"
  } = quizData.answers;
  
  const ageNum = parseInt(age);
  const heightCm = parseFloat(height);
  const heightM = heightCm / 100;
  const currentWeightKg = parseFloat(currentWeight);
  const targetWeightKg = parseFloat(targetWeight);
  const waistCm = parseFloat(waistCircumference);
  
  // Calculate BMI
  const bmi = currentWeightKg / (heightM * heightM);
  
  // Determine BMI category
  let bmiCategory = "";
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = "Normal";
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = "Overweight";
  } else {
    bmiCategory = "Obese";
  }
  
  // Estimate body fat percentage using the Navy method
  let bodyFatPercentage = 0;
  if (gender === "male") {
    bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waistCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    // For females, we would need hip measurement, but we're estimating
    bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waistCm) + 0.22100 * Math.log10(heightCm)) - 450;
  }
  
  // Ensure the body fat percentage is within reasonable limits
  bodyFatPercentage = Math.max(4, Math.min(bodyFatPercentage, 40));
  
  // Calculate lean mass and fat mass
  const fatMassKg = (bodyFatPercentage / 100) * currentWeightKg;
  const leanMassKg = currentWeightKg - fatMassKg;
  
  // Calculate target body composition
  // Assume we keep the same lean mass but adjust fat mass
  const targetBodyFatPercentage = gender === "male" ? 
    (targetWeightKg < currentWeightKg ? 15 : 20) : 
    (targetWeightKg < currentWeightKg ? 22 : 28);
    
  const targetFatMassKg = (targetBodyFatPercentage / 100) * targetWeightKg;
  const targetLeanMassKg = targetWeightKg - targetFatMassKg;
  
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr = 0;
  if (gender === "male") {
    bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * ageNum + 5;
  } else {
    bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * ageNum - 161;
  }
  
  // Adjust based on activity level (based on fitness level answer)
  const activityLevels: Record<string, number> = {
    "beginner": 1.2, // Sedentary
    "intermediate": 1.375, // Light activity
    "advanced": 1.55, // Moderate activity
    "athletic": 1.725 // Very active
  };
  
  const activityLevel = quizData.answers.fitnessLevel || "intermediate";
  const activityMultiplier = activityLevels[activityLevel] || 1.375;
  
  const tdee = Math.round(bmr * activityMultiplier); // Total Daily Energy Expenditure
  
  // Calculate calorie needs based on goal
  let goalCalorieAdjustment = 0;
  if (targetWeightKg < currentWeightKg) {
    // Weight loss goal: deficit of 500 calories
    goalCalorieAdjustment = -500;
  } else if (targetWeightKg > currentWeightKg) {
    // Weight gain goal: surplus of 300-500 calories
    goalCalorieAdjustment = 300;
  }
  
  const recommendedCalories = Math.max(1200, Math.round(tdee + goalCalorieAdjustment));
  
  // Calculate recommended water intake based on weight
  // General recommendation is 30-35ml per kg of body weight
  const waterIntake = Math.round((30 * currentWeightKg) / 1000 * 10) / 10; // in liters, rounded to 1 decimal
  
  // Calculate macro distribution based on goals and preferences
  const fitnessGoals = quizData.fitnessGoals || [];
  let proteinPercentage = 30;
  let carbPercentage = 40;
  let fatPercentage = 30;
  
  // Adjust macros based on goals
  if (fitnessGoals.includes("build-muscle")) {
    proteinPercentage = 35;
    carbPercentage = 45;
    fatPercentage = 20;
  } else if (fitnessGoals.includes("lose-weight")) {
    proteinPercentage = 40;
    carbPercentage = 30;
    fatPercentage = 30;
  } else if (fitnessGoals.includes("increase-endurance")) {
    proteinPercentage = 25;
    carbPercentage = 55;
    fatPercentage = 20;
  }
  
  // Further adjust based on dietary preference
  const dietaryPreference = quizData.answers.dietaryPreference || "omnivore";
  if (dietaryPreference === "keto") {
    proteinPercentage = 30;
    carbPercentage = 5;
    fatPercentage = 65;
  } else if (dietaryPreference === "vegan" || dietaryPreference === "vegetarian") {
    // Slightly lower protein for plant-based diets
    proteinPercentage = Math.max(25, proteinPercentage - 5);
    carbPercentage = Math.min(60, carbPercentage + 5);
  }
  
  // Calculate macro grams and calories
  const proteinCalories = Math.round((recommendedCalories * proteinPercentage) / 100);
  const carbCalories = Math.round((recommendedCalories * carbPercentage) / 100);
  const fatCalories = Math.round((recommendedCalories * fatPercentage) / 100);
  
  const proteinGrams = Math.round(proteinCalories / 4); // 4 calories per gram of protein
  const carbGrams = Math.round(carbCalories / 4); // 4 calories per gram of carbs
  const fatGrams = Math.round(fatCalories / 9); // 9 calories per gram of fat
  
  return {
    currentStats: {
      bmi,
      bmiCategory,
      bodyFatPercentage,
      fatMassKg: fatMassKg.toFixed(1),
      leanMassKg: leanMassKg.toFixed(1),
    },
    targetStats: {
      targetBodyFatPercentage,
      targetFatMassKg: targetFatMassKg.toFixed(1),
      targetLeanMassKg: targetLeanMassKg.toFixed(1),
      calorieNeeds: {
        bmr: Math.round(bmr),
        tdee: tdee,
        recommended: recommendedCalories
      },
      waterIntake
    },
    macroRecommendations: {
      protein: {
        percentage: proteinPercentage,
        grams: proteinGrams,
        calories: proteinCalories
      },
      carbs: {
        percentage: carbPercentage,
        grams: carbGrams,
        calories: carbCalories
      },
      fat: {
        percentage: fatPercentage,
        grams: fatGrams,
        calories: fatCalories
      }
    }
  };
};

// Generate meal plan based on quiz answers
export const generateMealPlan = (quizData: any, userProfile: any, bodyComposition?: any) => {
  if (!quizData || !quizData.answers) {
    return null;
  }
  
  // Use the passed bodyComposition or calculate it
  const bodyComp = bodyComposition || calculateBodyComposition(quizData);
  if (!bodyComp) return null;
  
  // Extract key parameters
  const {
    dietaryPreference = "omnivore",
    mealFrequency = "3",
    foodAllergies = []
  } = quizData.answers;
  
  const recommendedCalories = bodyComp.targetStats.calorieNeeds.recommended;
  const { protein, carbs, fat } = bodyComp.macroRecommendations;
  
  // Determine meal count
  let mealCount = 3;
  if (mealFrequency === "1-2") mealCount = 2;
  else if (mealFrequency === "3") mealCount = 3;
  else if (mealFrequency === "4-5") mealCount = 4;
  else if (mealFrequency === "6+") mealCount = 5;
  
  // Calculate calories per meal
  const caloriesPerMeal = Math.round(recommendedCalories / mealCount);
  
  // Generate meal plan
  const mealPlan = {
    mainGoal: quizData.fitnessGoals?.[0] || "overall-fitness",
    dietType: dietaryPreference,
    caloriesPerDay: recommendedCalories,
    macros: {
      protein: protein.grams,
      carbs: carbs.grams,
      fat: fat.grams
    },
    allergies: foodAllergies,
    mealCount,
    meals: [] as any[],
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  // Generate sample meals based on diet type
  const mealOptions = getMealOptionsByDiet(dietaryPreference, foodAllergies);
  
  // Distribute meals
  if (mealCount >= 2) {
    mealPlan.meals.push({
      name: "Breakfast",
      calories: Math.round(recommendedCalories * 0.25),
      options: mealOptions.breakfast.slice(0, 3)
    });
  }
  
  if (mealCount >= 3) {
    mealPlan.meals.push({
      name: "Lunch",
      calories: Math.round(recommendedCalories * 0.35),
      options: mealOptions.lunch.slice(0, 3)
    });
  }
  
  if (mealCount >= 2) {
    mealPlan.meals.push({
      name: "Dinner",
      calories: Math.round(recommendedCalories * 0.3),
      options: mealOptions.dinner.slice(0, 3)
    });
  }
  
  if (mealCount >= 4) {
    mealPlan.meals.push({
      name: "Snack",
      calories: Math.round(recommendedCalories * 0.1),
      options: mealOptions.snacks.slice(0, 3)
    });
  }
  
  if (mealCount >= 5) {
    mealPlan.meals.push({
      name: "Second Snack",
      calories: Math.round(recommendedCalories * 0.1),
      options: mealOptions.snacks.slice(3, 6)
    });
  }
  
  return mealPlan;
};

// Helper function to get meal options based on diet type
const getMealOptionsByDiet = (dietType: string, allergies: string[]) => {
  // Base meal options
  const baseOptions = {
    breakfast: [
      { name: "Oatmeal with fruit and nuts", protein: 15, carbs: 45, fat: 12 },
      { name: "Greek yogurt with berries and honey", protein: 20, carbs: 30, fat: 5 },
      { name: "Whole grain toast with avocado and eggs", protein: 18, carbs: 25, fat: 15 }
    ],
    lunch: [
      { name: "Grilled chicken salad with mixed greens", protein: 30, carbs: 15, fat: 10 },
      { name: "Quinoa bowl with vegetables and tofu", protein: 20, carbs: 40, fat: 15 },
      { name: "Turkey and vegetable wrap", protein: 25, carbs: 30, fat: 12 }
    ],
    dinner: [
      { name: "Salmon with roasted vegetables", protein: 30, carbs: 20, fat: 15 },
      { name: "Lean beef stir-fry with brown rice", protein: 28, carbs: 40, fat: 12 },
      { name: "Chicken breast with sweet potato and green beans", protein: 35, carbs: 30, fat: 8 }
    ],
    snacks: [
      { name: "Apple with almond butter", protein: 5, carbs: 20, fat: 10 },
      { name: "Protein shake with banana", protein: 25, carbs: 25, fat: 3 },
      { name: "Trail mix", protein: 8, carbs: 18, fat: 12 },
      { name: "Cottage cheese with pineapple", protein: 15, carbs: 15, fat: 5 },
      { name: "Hard-boiled eggs", protein: 12, carbs: 1, fat: 10 },
      { name: "Hummus with carrot sticks", protein: 5, carbs: 15, fat: 8 }
    ]
  };
  
  // Adjust based on diet type
  if (dietType === "vegetarian") {
    baseOptions.lunch = [
      { name: "Quinoa bowl with vegetables and tofu", protein: 20, carbs: 40, fat: 15 },
      { name: "Lentil soup with whole grain bread", protein: 18, carbs: 45, fat: 5 },
      { name: "Vegetable and cheese sandwich", protein: 15, carbs: 35, fat: 12 }
    ];
    baseOptions.dinner = [
      { name: "Bean and vegetable curry with rice", protein: 18, carbs: 45, fat: 8 },
      { name: "Vegetable stir-fry with tempeh", protein: 22, carbs: 30, fat: 10 },
      { name: "Stuffed bell peppers with quinoa and cheese", protein: 20, carbs: 35, fat: 12 }
    ];
  } else if (dietType === "vegan") {
    baseOptions.breakfast = [
      { name: "Overnight oats with chia seeds and fruit", protein: 12, carbs: 45, fat: 10 },
      { name: "Tofu scramble with vegetables", protein: 18, carbs: 15, fat: 12 },
      { name: "Smoothie bowl with plant protein", protein: 20, carbs: 40, fat: 8 }
    ];
    baseOptions.lunch = [
      { name: "Quinoa bowl with vegetables and chickpeas", protein: 18, carbs: 45, fat: 10 },
      { name: "Lentil soup with whole grain bread", protein: 18, carbs: 45, fat: 5 },
      { name: "Tempeh and avocado wrap", protein: 20, carbs: 35, fat: 15 }
    ];
    baseOptions.dinner = [
      { name: "Bean and vegetable curry with rice", protein: 18, carbs: 45, fat: 8 },
      { name: "Vegetable stir-fry with tofu", protein: 20, carbs: 30, fat: 10 },
      { name: "Stuffed bell peppers with quinoa and beans", protein: 15, carbs: 40, fat: 5 }
    ];
    baseOptions.snacks = [
      { name: "Apple with almond butter", protein: 5, carbs: 20, fat: 10 },
      { name: "Plant protein shake with banana", protein: 20, carbs: 25, fat: 3 },
      { name: "Mixed nuts and dried fruit", protein: 8, carbs: 20, fat: 12 },
      { name: "Hummus with carrot sticks", protein: 5, carbs: 15, fat: 8 },
      { name: "Edamame", protein: 8, carbs: 10, fat: 4 },
      { name: "Energy balls with dates and nuts", protein: 5, carbs: 25, fat: 10 }
    ];
  } else if (dietType === "keto") {
    baseOptions.breakfast = [
      { name: "Avocado and bacon frittata", protein: 20, carbs: 5, fat: 30 },
      { name: "Chia seed pudding with coconut milk", protein: 8, carbs: 8, fat: 25 },
      { name: "Keto green smoothie with avocado", protein: 15, carbs: 8, fat: 28 }
    ];
    baseOptions.lunch = [
      { name: "Caesar salad with chicken (no croutons)", protein: 30, carbs: 5, fat: 25 },
      { name: "Tuna salad in lettuce cups", protein: 25, carbs: 3, fat: 20 },
      { name: "Zucchini noodles with meatballs", protein: 25, carbs: 8, fat: 22 }
    ];
    baseOptions.dinner = [
      { name: "Baked salmon with asparagus", protein: 30, carbs: 5, fat: 25 },
      { name: "Steak with buttered vegetables", protein: 35, carbs: 8, fat: 30 },
      { name: "Chicken thighs with cauliflower rice", protein: 30, carbs: 6, fat: 25 }
    ];
    baseOptions.snacks = [
      { name: "Cheese slices", protein: 7, carbs: 1, fat: 9 },
      { name: "Hard-boiled eggs", protein: 12, carbs: 1, fat: 10 },
      { name: "Macadamia nuts", protein: 2, carbs: 4, fat: 21 },
      { name: "Beef jerky", protein: 14, carbs: 3, fat: 1 },
      { name: "Avocado with salt", protein: 2, carbs: 2, fat: 15 },
      { name: "Cucumber slices with cream cheese", protein: 3, carbs: 3, fat: 10 }
    ];
  }
  
  // Filter out options with allergens
  // For a real app, this would involve a more comprehensive allergen database
  let filteredOptions = { ...baseOptions };
  
  if (allergies.includes("nuts")) {
    // Filter out options with nuts
    filteredOptions.breakfast = baseOptions.breakfast.filter(meal => !meal.name.toLowerCase().includes("nut"));
    filteredOptions.snacks = baseOptions.snacks.filter(meal => !meal.name.toLowerCase().includes("nut"));
  }
  
  if (allergies.includes("dairy") || allergies.includes("eggs")) {
    // Filter out options with dairy
    filteredOptions.breakfast = filteredOptions.breakfast.filter(meal => 
      !(allergies.includes("dairy") && (meal.name.toLowerCase().includes("yogurt") || meal.name.toLowerCase().includes("cheese"))) &&
      !(allergies.includes("eggs") && meal.name.toLowerCase().includes("egg"))
    );
    filteredOptions.lunch = filteredOptions.lunch.filter(meal => 
      !(allergies.includes("dairy") && meal.name.toLowerCase().includes("cheese"))
    );
    filteredOptions.dinner = filteredOptions.dinner.filter(meal => 
      !(allergies.includes("dairy") && meal.name.toLowerCase().includes("cheese"))
    );
    filteredOptions.snacks = filteredOptions.snacks.filter(meal => 
      !(allergies.includes("dairy") && (meal.name.toLowerCase().includes("cheese") || meal.name.toLowerCase().includes("cottage"))) &&
      !(allergies.includes("eggs") && meal.name.toLowerCase().includes("egg"))
    );
  }
  
  return filteredOptions;
};

// Generate training plan based on quiz answers
export const generateTrainingPlan = (quizData: any, userProfile: any) => {
  if (!quizData || !quizData.answers) {
    return null;
  }
  
  const {
    fitnessLevel = "beginner",
    fitnessGoals = [],
    workoutFrequency = "3-4",
    preferredWorkoutTime = "morning",
    workoutDuration = "30-60min",
    equipmentAccess = "minimal",
    previousInjuries = "none"
  } = quizData.answers;
  
  // Determine days per week
  let daysPerWeek = 3;
  if (workoutFrequency === "1-2") daysPerWeek = 2;
  else if (workoutFrequency === "3-4") daysPerWeek = 4;
  else if (workoutFrequency === "5+") daysPerWeek = 5;
  
  // Determine workout type based on goals and equipment
  let mainWorkoutType = "general-fitness";
  
  if (fitnessGoals.includes("lose-weight")) {
    mainWorkoutType = "weight-loss";
  } else if (fitnessGoals.includes("build-muscle")) {
    mainWorkoutType = "strength";
  } else if (fitnessGoals.includes("increase-endurance")) {
    mainWorkoutType = "cardio";
  } else if (fitnessGoals.includes("improve-flexibility")) {
    mainWorkoutType = "flexibility";
  }
  
  // Account for injuries
  const hasInjuries = previousInjuries !== "none";
  
  // Generate training plan
  const trainingPlan = {
    mainGoal: fitnessGoals[0] || "overall-fitness",
    level: fitnessLevel,
    daysPerWeek,
    trainingType: mainWorkoutType,
    preferredTime: preferredWorkoutTime,
    duration: workoutDuration,
    location: equipmentAccess === "full-gym" ? "gym" : "home",
    equipmentLevel: equipmentAccess,
    injuries: previousInjuries,
    isActive: true,
    workouts: [] as any[],
    createdAt: new Date().toISOString()
  };
  
  // Generate workouts based on the plan type
  const workoutByGoal = getWorkoutsByGoal(mainWorkoutType, fitnessLevel, equipmentAccess, hasInjuries, daysPerWeek);
  
  trainingPlan.workouts = workoutByGoal;
  
  return trainingPlan;
};

// Helper function to get workouts based on goal
const getWorkoutsByGoal = (goalType: string, fitnessLevel: string, equipment: string, hasInjuries: boolean, daysPerWeek: number) => {
  // Template for workouts
  const workoutsTemplate: Record<string, Record<string, Array<{ 
    day: number; 
    name: string; 
    exercises: string[]; 
    injuryNote?: string; // Add optional injuryNote property to the type
  }>>> = {
    "general-fitness": {
      "beginner": [
        { day: 1, name: "Full Body Basics", exercises: ["Squats", "Push-ups (Modified)", "Plank", "Walking"] },
        { day: 2, name: "Cardio & Core", exercises: ["Marching in place", "Crunches", "Leg raises", "Stretching"] },
        { day: 3, name: "Lower Body Focus", exercises: ["Lunges", "Glute bridges", "Calf raises", "Light jog/walk"] },
        { day: 4, name: "Upper Body & Core", exercises: ["Wall push-ups", "Seated rows (with band)", "Plank to side plank", "Arm circles"] },
        { day: 5, name: "Active Recovery", exercises: ["Walking", "Full body stretching", "Light yoga", "Mobility exercises"] }
      ],
      "intermediate": [
        { day: 1, name: "Full Body Strength", exercises: ["Goblet squats", "Push-ups", "Dumbbell rows", "Plank variations"] },
        { day: 2, name: "HIIT Cardio", exercises: ["Jumping jacks", "Mountain climbers", "Burpees", "High knees"] },
        { day: 3, name: "Lower Body Power", exercises: ["Lunges with weights", "Step-ups", "Glute bridges", "Calf raises"] },
        { day: 4, name: "Upper Body & Core", exercises: ["Push-ups", "Dumbbell chest press", "Bent over rows", "Russian twists"] },
        { day: 5, name: "Active Recovery", exercises: ["Light jog", "Dynamic stretching", "Yoga flow", "Foam rolling"] }
      ],
      "advanced": [
        { day: 1, name: "Full Body Power", exercises: ["Barbell squats", "Bench press", "Deadlifts", "Pull-ups"] },
        { day: 2, name: "HIIT & Conditioning", exercises: ["Box jumps", "Battle ropes", "Kettlebell swings", "Burpee pull-ups"] },
        { day: 3, name: "Lower Body Strength", exercises: ["Front squats", "Romanian deadlifts", "Walking lunges", "Box jumps"] },
        { day: 4, name: "Upper Body Hypertrophy", exercises: ["Incline press", "Weighted pull-ups", "Military press", "Face pulls"] },
        { day: 5, name: "Active Recovery + Core", exercises: ["Light cardio", "Hanging leg raises", "Ab wheel", "Mobility work"] }
      ]
    },
    "weight-loss": {
      "beginner": [
        { day: 1, name: "Cardio Basics", exercises: ["Walking intervals", "Marching in place", "Step-ups", "Knee raises"] },
        { day: 2, name: "Full Body Circuit", exercises: ["Squats", "Modified push-ups", "Standing rows", "Toe touches"] },
        { day: 3, name: "Cardio & Core", exercises: ["Walking", "Seated knee raises", "Modified crunches", "Back extensions"] },
        { day: 4, name: "HIIT Intro", exercises: ["30s exercise/30s rest: Marching", "Modified jumping jacks", "Wall push-ups", "Knee raises"] },
        { day: 5, name: "Active Recovery", exercises: ["Light walking", "Full body stretching", "Gentle yoga", "Deep breathing"] }
      ],
      "intermediate": [
        { day: 1, name: "HIIT Cardio", exercises: ["30s work/15s rest: Jumping jacks", "High knees", "Squats", "Mountain climbers"] },
        { day: 2, name: "Full Body Circuit", exercises: ["Walking lunges", "Push-ups", "Dumbbell rows", "Bicycle crunches"] },
        { day: 3, name: "Tabata Training", exercises: ["20s work/10s rest: Burpees", "Squat jumps", "Push-ups", "Russian twists"] },
        { day: 4, name: "Steady State Cardio + Core", exercises: ["30min moderate cardio", "Plank series", "Leg raises", "Side bends"] },
        { day: 5, name: "Active Recovery", exercises: ["Light jog/walk", "Dynamic stretching", "Yoga flow", "Foam rolling"] }
      ],
      "advanced": [
        { day: 1, name: "HIIT Sprint Intervals", exercises: ["Sprint intervals", "Jump squats", "Burpees", "Mountain climbers"] },
        { day: 2, name: "Metabolic Resistance", exercises: ["Kettlebell swings", "Thrusters", "Renegade rows", "Medicine ball slams"] },
        { day: 3, name: "Tabata Supersets", exercises: ["20s work/10s rest: Squat jumps + push-ups", "Lunges + rows", "Burpees + v-ups"] },
        { day: 4, name: "Cardio & Core Power", exercises: ["Box jumps", "Weighted Russian twists", "Hanging leg raises", "Battle ropes"] },
        { day: 5, name: "Circuit Training", exercises: ["5 rounds: 30s deadlifts", "30s push press", "30s pull-ups", "30s box jumps"] }
      ]
    },
    "strength": {
      "beginner": [
        { day: 1, name: "Lower Body Basics", exercises: ["Bodyweight squats", "Glute bridges", "Calf raises", "Lying leg curls"] },
        { day: 2, name: "Upper Body Intro", exercises: ["Wall push-ups", "Bent over rows (light band)", "Shoulder press (light band)", "Bicep curls"] },
        { day: 3, name: "Core Foundations", exercises: ["Bird dog", "Plank", "Dead bug", "Superman"] },
        { day: 4, name: "Full Body Strength", exercises: ["Goblet squats", "Push-ups", "Band pull-aparts", "Glute bridges"] },
        { day: 5, name: "Active Recovery", exercises: ["Walking", "Light stretching", "Mobility work", "Foam rolling"] }
      ],
      "intermediate": [
        { day: 1, name: "Lower Body Strength", exercises: ["Goblet squats", "Bulgarian split squats", "Romanian deadlifts", "Step-ups"] },
        { day: 2, name: "Upper Body Push", exercises: ["Push-ups", "Dumbbell shoulder press", "Tricep dips", "Chest flyes"] },
        { day: 3, name: "Back & Biceps", exercises: ["Dumbbell rows", "Band pull-aparts", "Bicep curls", "Face pulls"] },
        { day: 4, name: "Legs & Shoulders", exercises: ["Front squats", "Lunges", "Lateral raises", "Calf raises"] },
        { day: 5, name: "Core & Cardio", exercises: ["Planks", "Russian twists", "Hanging leg raises", "HIIT intervals"] }
      ],
      "advanced": [
        { day: 1, name: "Lower Body Power", exercises: ["Barbell back squats", "Deadlifts", "Walking lunges", "Box jumps"] },
        { day: 2, name: "Upper Body Push", exercises: ["Bench press", "Incline dumbbell press", "Military press", "Dips"] },
        { day: 3, name: "Back & Biceps", exercises: ["Pull-ups", "Barbell rows", "T-bar rows", "Barbell curls"] },
        { day: 4, name: "Leg Hypertrophy", exercises: ["Front squats", "Romanian deadlifts", "Leg press", "Hack squats"] },
        { day: 5, name: "Shoulders & Arms", exercises: ["Overhead press", "Lateral raises", "Face pulls", "Skull crushers"] }
      ]
    }
  };
  
  // Adjust for equipment limitations
  if (equipment === "none" || equipment === "minimal") {
    // Replace exercises that require equipment with bodyweight alternatives
    Object.keys(workoutsTemplate).forEach(goal => {
      Object.keys(workoutsTemplate[goal as keyof typeof workoutsTemplate]).forEach(level => {
        workoutsTemplate[goal as keyof typeof workoutsTemplate][level as "beginner" | "intermediate" | "advanced"].forEach(workout => {
          workout.exercises = workout.exercises.map(exercise => {
            // Replace exercises that require significant equipment
            if (exercise.includes("barbell") || exercise.includes("dumbbell") || 
                exercise.includes("kettlebell") || exercise.includes("machine")) {
              if (exercise.includes("squat")) return "Bodyweight squats";
              if (exercise.includes("press")) return "Push-ups";
              if (exercise.includes("row")) return "Resistance band rows";
              if (exercise.includes("curl")) return "Bodyweight curls";
              if (exercise.includes("deadlift")) return "Glute bridges";
              return "Bodyweight alternative";
            }
            return exercise;
          });
        });
      });
    });
  }
  
  // Adjust for injuries
  if (hasInjuries) {
    // This is a simplified example - a real app would have more sophisticated injury accommodations
    Object.keys(workoutsTemplate).forEach(goal => {
      Object.keys(workoutsTemplate[goal as keyof typeof workoutsTemplate]).forEach(level => {
        workoutsTemplate[goal as keyof typeof workoutsTemplate][level as "beginner" | "intermediate" | "advanced"].forEach(workout => {
          // Add a note about injury modifications
          workout.name = workout.name + " (Modified)";
          
          // Add an extra note to each workout
          workout.injuryNote = "Perform all exercises with caution and modify as needed for your specific injury.";
        });
      });
    });
  }
  
  // Select appropriate workout plan
  const selectedLevel = fitnessLevel as "beginner" | "intermediate" | "advanced";
  const selectedGoal = goalType as keyof typeof workoutsTemplate;
  
  // If the selected goal doesn't exist, fall back to general fitness
  const workouts = workoutsTemplate[selectedGoal]?.[selectedLevel] || workoutsTemplate["general-fitness"][selectedLevel];
  
  // Limit workouts to the specified number of days per week
  return workouts.slice(0, daysPerWeek);
};

// Generate supplement recommendations based on quiz answers
export const generateSupplementRecommendations = (quizData: any) => {
  if (!quizData || !quizData.answers) {
    return [];
  }
  
  const {
    fitnessGoals = [],
    sleepQuality = "",
    stressLevel = "",
    energyLevel = "",
    focusLevel = "",
    immunityStrength = "",
    recoveryRate = "",
    dietaryPreference = ""
  } = quizData.answers;
  
  // Define supplement database with links to Wellura products
  const supplements = [
    {
      id: "protein",
      name: "Wellura Whey Protein Isolate",
      url: "https://wellurausa.com/products/whey-chocopro-100-isolate",
      description: "Premium protein supplement for muscle recovery and growth",
      benefits: [
        "Supports muscle recovery and growth",
        "25g protein per serving",
        "Low in fat and carbs",
        "Great for post-workout nutrition"
      ],
      recommendedFor: ["build-muscle", "lose-weight", "strength-training"]
    },
    {
      id: "creatine",
      name: "MuscleprimeⓇ Creatine Monohydrate",
      url: "https://wellurausa.com/products/muscleprime-creatine-monohydrate",
      description: "Supports strength, power and muscle growth",
      benefits: [
        "Increases strength and power output",
        "Enhances muscle growth and recovery",
        "Improves exercise performance",
        "5g of pure creatine monohydrate per serving"
      ],
      recommendedFor: ["build-muscle", "strength-training", "advanced", "intermediate"]
    },
    {
      id: "pre-workout",
      name: "TitanPower Pre-Workout",
      url: "https://wellurausa.com/products/titanpower-fruit-punch",
      description: "Energy, focus, and performance enhancer for workouts",
      benefits: [
        "Boosts energy and focus",
        "Enhances workout performance",
        "Increases blood flow and pump",
        "Contains caffeine and performance enhancers"
      ],
      recommendedFor: ["build-muscle", "strength-training", "increase-endurance", "low-energy"]
    },
    {
      id: "multivitamin",
      name: "VitaBites Multivitamin Gummies",
      url: "https://wellurausa.com/products/vitabites-gummies-adult",
      description: "Complete daily multivitamin in tasty gummy form",
      benefits: [
        "Covers essential vitamin and mineral needs",
        "Supports overall health and immunity",
        "Great taste and easy to take",
        "Perfect for those with busy lifestyles"
      ],
      recommendedFor: ["overall-health", "weak-immunity", "busy-lifestyle", "vegetarian", "vegan"]
    },
    {
      id: "omega3",
      name: "OceanPower Omega-3",
      url: "https://wellurausa.com/products/oceanpower",
      description: "High-quality omega-3 fatty acids for heart and brain health",
      benefits: [
        "Supports heart and cardiovascular health",
        "Promotes brain function and cognitive health",
        "Anti-inflammatory properties",
        "Sustainably sourced, high-potency formula"
      ],
      recommendedFor: ["heart-health", "brain-health", "joint-pain", "inflammation"]
    },
    {
      id: "ashwagandha",
      name: "Stress Shield Ashwagandha",
      url: "https://wellurausa.com/products/stress-shield-ashwagandha",
      description: "Natural adaptogen for stress and anxiety relief",
      benefits: [
        "Helps body adapt to stress",
        "Reduces anxiety and promotes calmness",
        "Supports healthy sleep patterns",
        "May improve energy and focus"
      ],
      recommendedFor: ["high-stress", "anxiety", "poor-sleep", "fatigue"]
    },
    {
      id: "vitamin-d",
      name: "Sunburst Vitamin D3",
      url: "https://wellurausa.com/products/sunburst-vitamin-d3-2-000-iu",
      description: "Essential vitamin D3 for immune and bone health",
      benefits: [
        "Supports immune system function",
        "Promotes bone and muscle health",
        "Helps with calcium absorption",
        "Key for overall health and wellbeing"
      ],
      recommendedFor: ["weak-immunity", "bone-health", "deficiency-risk", "indoor-lifestyle"]
    },
    {
      id: "probiotics",
      name: "FloraMax 40B Probiotics",
      url: "https://wellurausa.com/products/floramax-40b",
      description: "Advanced probiotic formula for gut health and immunity",
      benefits: [
        "Supports digestive health and regularity",
        "Boosts immune system function",
        "Contains 40 billion CFU per serving",
        "Multiple probiotic strains for comprehensive support"
      ],
      recommendedFor: ["gut-health", "digestive-issues", "immunity", "antibiotics-recovery"]
    },
    {
      id: "magnesium",
      name: "Magnesium Glycinate 2500",
      url: "https://wellurausa.com/products/magnesium-glycinate-2500",
      description: "Highly bioavailable magnesium for relaxation and recovery",
      benefits: [
        "Promotes muscle relaxation and recovery",
        "Supports quality sleep",
        "Helps reduce muscle cramps",
        "Gentle on the stomach"
      ],
      recommendedFor: ["poor-sleep", "muscle-recovery", "stress", "muscle-cramps"]
    },
    {
      id: "sleep-aid",
      name: "SereniSleep Capsules",
      url: "https://wellurausa.com/products/serenisleep-caps",
      description: "Natural sleep aid for better quality rest",
      benefits: [
        "Helps you fall asleep faster",
        "Improves sleep quality and duration",
        "Non-habit forming natural ingredients",
        "Wake up refreshed without grogginess"
      ],
      recommendedFor: ["poor-sleep", "insomnia", "stress", "jet-lag"]
    },
    {
      id: "collagen",
      name: "PureVital Collagen Powder",
      url: "https://wellurausa.com/products/purevital-collagen-powder",
      description: "Premium collagen peptides for skin, hair, joints and more",
      benefits: [
        "Supports skin elasticity and hydration",
        "Promotes hair and nail strength",
        "Helps maintain joint health",
        "Unflavored and easy to mix"
      ],
      recommendedFor: ["skin-health", "joint-pain", "hair-growth", "aging-concerns"]
    },
    {
      id: "bcaa",
      name: "Ignite 8 BCAAs",
      url: "https://wellurausa.com/products/ignite-8™",
      description: "Branch Chain Amino Acids for muscle recovery and endurance",
      benefits: [
        "Reduces muscle soreness",
        "Supports muscle recovery",
        "Prevents muscle breakdown during training",
        "Can be taken before, during or after workouts"
      ],
      recommendedFor: ["build-muscle", "slow-recovery", "endurance", "fasted-training"]
    },
    {
      id: "fish-oil",
      name: "VidaLife Omega-3",
      url: "https://wellurausa.com/products/vidalife",
      description: "High-potency fish oil for heart, brain and joint health",
      benefits: [
        "Supports cardiovascular health",
        "Promotes cognitive function",
        "Helps reduce inflammation",
        "May improve mood and mental wellbeing"
      ],
      recommendedFor: ["heart-health", "brain-function", "inflammation", "joint-pain"]
    },
    {
      id: "fat-burner",
      name: "Ultra Burner with MCT",
      url: "https://wellurausa.com/products/ultra-burner-with-mct",
      description: "Advanced formula to support metabolism and fat loss",
      benefits: [
        "Enhances fat metabolism",
        "Provides clean energy from MCT oil",
        "Helps control appetite",
        "Supports thermogenesis"
      ],
      recommendedFor: ["lose-weight", "metabolism-boost", "appetite-control", "energy"]
    },
    {
      id: "vitamin-c",
      name: "Vital Reds Superfood Blend",
      url: "https://wellurausa.com/products/vital-reds-superfood-blend",
      description: "Antioxidant-rich superfood blend with vitamin C",
      benefits: [
        "Powerful immune system support",
        "Rich in antioxidants and phytonutrients",
        "Helps combat free radical damage",
        "Supports overall health and vitality"
      ],
      recommendedFor: ["weak-immunity", "antioxidant-needs", "inflammation", "energy"]
    }
  ];
  
  // Map user profile to recommendation categories
  const recommendationCategories = [];
  
  // Add goal-based recommendations
  fitnessGoals.forEach(goal => {
    recommendationCategories.push(goal);
  });
  
  // Add sleep-based recommendations
  if (sleepQuality === "poor" || sleepQuality === "fair") {
    recommendationCategories.push("poor-sleep");
  }
  
  // Add stress-based recommendations
  if (stressLevel === "high" || stressLevel === "moderate") {
    recommendationCategories.push("high-stress");
  }
  
  // Add energy-based recommendations
  if (energyLevel === "low") {
    recommendationCategories.push("low-energy");
  }
  
  // Add focus-based recommendations
  if (focusLevel === "poor") {
    recommendationCategories.push("brain-function");
  }
  
  // Add immunity-based recommendations
  if (immunityStrength === "weak" || immunityStrength === "average") {
    recommendationCategories.push("weak-immunity");
  }
  
  // Add recovery-based recommendations
  if (recoveryRate === "slow") {
    recommendationCategories.push("slow-recovery");
  }
  
  // Add dietary-preference-based recommendations
  if (dietaryPreference === "vegetarian" || dietaryPreference === "vegan") {
    recommendationCategories.push(dietaryPreference);
  }
  
  // Ensure we have at least some basic categories
  if (recommendationCategories.length === 0) {
    recommendationCategories.push("overall-health");
  }
  
  // Match supplements to user needs
  const matchedSupplements = supplements.filter(supplement => {
    return supplement.recommendedFor.some(category => 
      recommendationCategories.includes(category)
    );
  });
  
  // Prioritize and limit recommendations
  const topRecommendations = matchedSupplements
    .map(supplement => ({
      ...supplement,
      matchScore: supplement.recommendedFor.filter(category => 
        recommendationCategories.includes(category)
      ).length
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map(supplement => ({
      ...supplement,
      reasonForRecommendation: getRecommendationReason(supplement, recommendationCategories)
    }));
  
  return topRecommendations;
};

// Helper function to generate personalized recommendation reasons
const getRecommendationReason = (supplement: any, userCategories: string[]) => {
  // Find the top matching categories
  const matchingCategories = supplement.recommendedFor.filter(category => 
    userCategories.includes(category)
  );
  
  // Map categories to user-friendly descriptions
  const categoryDescriptions: Record<string, string> = {
    "build-muscle": "goal to build muscle",
    "lose-weight": "weight management goals",
    "increase-endurance": "endurance training",
    "strength-training": "strength training routine",
    "overall-fitness": "overall fitness goals",
    "poor-sleep": "sleep quality concerns",
    "high-stress": "stress management needs",
    "low-energy": "energy level concerns",
    "brain-function": "focus and concentration goals",
    "weak-immunity": "immune system support needs",
    "slow-recovery": "recovery improvement goals",
    "vegetarian": "vegetarian diet",
    "vegan": "vegan diet",
    "overall-health": "general wellness goals",
    "heart-health": "heart health concerns",
    "joint-pain": "joint discomfort",
    "inflammation": "inflammation concerns",
    "skin-health": "skin health goals",
    "hair-growth": "hair and nail strength goals",
    "gut-health": "digestive health needs",
    "bone-health": "bone health support needs"
  };
  
  // Get the top 2 matching categories with descriptions
  const topCategories = matchingCategories.slice(0, 2).map(category => 
    categoryDescriptions[category] || category
  );
  
  if (topCategories.length === 0) {
    return "overall wellness goals";
  } else if (topCategories.length === 1) {
    return topCategories[0];
  } else {
    return `${topCategories[0]} and ${topCategories[1]}`;
  }
};

// Save all plans to user profile
export const savePlansToProfile = async (userId: string, quizData: any, plans: any) => {
  try {
    // In a real implementation, this would save to the database
    console.log("Saving plans for user", userId);
    console.log("Plans:", plans);
    
    // For now, just return success
    return true;
  } catch (error) {
    console.error("Error saving plans:", error);
    return false;
  }
};
