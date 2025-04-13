
import { supabase } from "@/integrations/supabase/client";

// Types for plan generation
type QuizData = {
  goals: string[];
  answers: Record<string, any>;
  completedAt?: string;
};

type UserProfile = {
  first_name?: string;
  last_name?: string;
  main_goal?: string;
  quiz_data?: QuizData;
  email?: string;
};

// Generate a meal plan based on quiz answers
export const generateMealPlan = (quizData: QuizData, userProfile?: UserProfile) => {
  const goals = quizData.goals || [];
  const answers = quizData.answers || {};
  
  // Default values
  let calories = 2000;
  let protein = 150;
  let carbs = 200;
  let fat = 65;
  const plan: any = {
    id: "quiz-generated",
    name: "Personalized Plan",
    description: "Plan based on your Wellness Quiz answers",
    isPersonalized: true,
    calories,
    protein,
    carbs,
    fat,
    meals: []
  };
  
  // Adjust calories based on goals
  if (goals.includes("Lose Weight")) {
    calories = 1600;
    protein = 140;
    carbs = 120;
    fat = 50;
    plan.name = "Weight Loss Plan";
    plan.description = "Calorie-controlled plan based on your quiz answers to support weight loss";
  } else if (goals.includes("Build Muscle")) {
    calories = 2400;
    protein = 180;
    carbs = 240;
    fat = 75;
    plan.name = "Muscle Building Plan";
    plan.description = "High-protein plan based on your quiz answers to support muscle growth";
  } else if (goals.includes("Boost Energy")) {
    calories = 2100;
    protein = 130;
    carbs = 260;
    fat = 60;
    plan.name = "Energy Boost Plan";
    plan.description = "Balanced macronutrient plan based on your quiz answers to optimize energy levels";
  }
  
  // Further adjust based on specific answers
  if (answers["weight-diet"] === "Keto/Low-Carb") {
    carbs = Math.floor(carbs * 0.4);
    fat = Math.floor(fat * 1.5);
    plan.description += " (Low-Carb Adaptation)";
  } else if (answers["weight-diet"] === "Vegetarian/Vegan") {
    protein = Math.floor(protein * 0.9);
    carbs = Math.floor(carbs * 1.1);
    plan.description += " (Plant-Based Adaptation)";
  }
  
  // Adjust calories based on activity level
  if (answers["weight-exercise"] === "5+ times") {
    calories = Math.floor(calories * 1.2);
    plan.description += " (High Activity)";
  } else if (answers["weight-exercise"] === "None") {
    calories = Math.floor(calories * 0.9);
    plan.description += " (Low Activity)";
  }
  
  // Update final values
  plan.calories = calories;
  plan.protein = protein;
  plan.carbs = carbs;
  plan.fat = fat;
  
  // Generate meals (simplified for demonstration)
  plan.meals = generateMeals(plan.name, calories, protein, carbs, fat);
  
  return plan;
};

// Generate meals for the meal plan
const generateMeals = (planType: string, calories: number, protein: number, carbs: number, fat: number) => {
  // Sample meal data based on plan type
  const breakfastOptions = {
    "Weight Loss Plan": [
      { name: "Protein Oatmeal", description: "Oatmeal with protein powder and berries", time: "7:00 AM" },
      { name: "Greek Yogurt Bowl", description: "Greek yogurt with nuts and honey", time: "7:30 AM" }
    ],
    "Muscle Building Plan": [
      { name: "Protein Pancakes", description: "Protein-rich pancakes with banana and peanut butter", time: "7:00 AM" },
      { name: "Egg White Omelette", description: "Egg white omelette with vegetables and cheese", time: "7:30 AM" }
    ],
    "Energy Boost Plan": [
      { name: "Fruit Smoothie Bowl", description: "Smoothie bowl with fruits, granola and seeds", time: "7:00 AM" },
      { name: "Avocado Toast", description: "Whole grain toast with avocado and eggs", time: "7:30 AM" }
    ],
    "Personalized Plan": [
      { name: "Balanced Breakfast", description: "Eggs, whole grain toast, and fruit", time: "7:30 AM" }
    ]
  };
  
  const lunchOptions = {
    "Weight Loss Plan": [
      { name: "Grilled Chicken Salad", description: "Grilled chicken with mixed greens and light dressing", time: "12:30 PM" },
      { name: "Turkey Wrap", description: "Turkey and vegetable wrap with hummus", time: "1:00 PM" }
    ],
    "Muscle Building Plan": [
      { name: "Chicken Rice Bowl", description: "Grilled chicken with brown rice and vegetables", time: "1:00 PM" },
      { name: "Tuna Sandwich", description: "Tuna sandwich on whole grain bread with side salad", time: "12:30 PM" }
    ],
    "Energy Boost Plan": [
      { name: "Quinoa Salad", description: "Quinoa salad with chickpeas and vegetables", time: "12:30 PM" },
      { name: "Sweet Potato Bowl", description: "Sweet potato with black beans and avocado", time: "1:00 PM" }
    ],
    "Personalized Plan": [
      { name: "Balanced Lunch", description: "Lean protein with complex carbs and vegetables", time: "12:30 PM" }
    ]
  };
  
  const dinnerOptions = {
    "Weight Loss Plan": [
      { name: "Baked Fish", description: "Baked fish with steamed vegetables", time: "6:30 PM" },
      { name: "Vegetable Stir Fry", description: "Tofu vegetable stir fry with minimal oil", time: "7:00 PM" }
    ],
    "Muscle Building Plan": [
      { name: "Steak and Potatoes", description: "Lean steak with baked potatoes and vegetables", time: "7:00 PM" },
      { name: "Salmon and Quinoa", description: "Grilled salmon with quinoa and roasted vegetables", time: "6:30 PM" }
    ],
    "Energy Boost Plan": [
      { name: "Pasta Primavera", description: "Whole grain pasta with vegetables and light sauce", time: "6:30 PM" },
      { name: "Turkey Chili", description: "Lean turkey chili with beans and vegetables", time: "7:00 PM" }
    ],
    "Personalized Plan": [
      { name: "Balanced Dinner", description: "Lean protein, complex carbs, and vegetables", time: "7:00 PM" }
    ]
  };
  
  const snackOptions = {
    "Weight Loss Plan": [
      { name: "Apple and Greek Yogurt", description: "Apple slices with low-fat Greek yogurt", time: "10:30 AM" },
      { name: "Celery and Hummus", description: "Celery sticks with hummus dip", time: "3:30 PM" }
    ],
    "Muscle Building Plan": [
      { name: "Protein Shake", description: "Protein shake with banana and peanut butter", time: "10:30 AM" },
      { name: "Trail Mix", description: "Trail mix with nuts, seeds, and dried fruit", time: "3:30 PM" }
    ],
    "Energy Boost Plan": [
      { name: "Energy Balls", description: "Homemade energy balls with oats and honey", time: "10:30 AM" },
      { name: "Fruit and Nuts", description: "Mixed fruit with a handful of nuts", time: "3:30 PM" }
    ],
    "Personalized Plan": [
      { name: "Morning Snack", description: "Protein and complex carbs", time: "10:30 AM" },
      { name: "Afternoon Snack", description: "Healthy fats and protein", time: "3:30 PM" }
    ]
  };
  
  // Select appropriate meals based on plan type
  const breakfast = breakfastOptions[planType as keyof typeof breakfastOptions][0];
  const lunch = lunchOptions[planType as keyof typeof lunchOptions][0];
  const dinner = dinnerOptions[planType as keyof typeof dinnerOptions][0];
  const morningSnack = snackOptions[planType as keyof typeof snackOptions][0];
  const afternoonSnack = snackOptions[planType as keyof typeof snackOptions][1];
  
  // Generate meal IDs
  return [
    { id: "breakfast-1", name: breakfast.name, time: breakfast.time, description: breakfast.description },
    { id: "morning-snack-1", name: morningSnack.name, time: morningSnack.time, description: morningSnack.description },
    { id: "lunch-1", name: lunch.name, time: lunch.time, description: lunch.description },
    { id: "afternoon-snack-1", name: afternoonSnack.name, time: afternoonSnack.time, description: afternoonSnack.description },
    { id: "dinner-1", name: dinner.name, time: dinner.time, description: dinner.description }
  ];
};

// Generate a training plan based on quiz answers
export const generateTrainingPlan = (quizData: QuizData, userProfile?: UserProfile) => {
  const goals = quizData.goals || [];
  const answers = quizData.answers || {};
  
  // Default plan
  const plan: any = {
    id: "quiz-generated",
    name: "Personalized Training Plan",
    description: "Training plan based on your Wellness Quiz answers",
    isPersonalized: true,
    days_per_week: 3,
    training_type: "balanced",
    preferred_time: "morning",
    location: "home",
    main_goal: userProfile?.main_goal || "General Fitness",
    workouts: []
  };
  
  // Determine workout frequency
  if (answers["weight-exercise"]) {
    if (answers["weight-exercise"] === "None" || answers["weight-exercise"] === "1-2 times") {
      plan.days_per_week = 3;
    } else if (answers["weight-exercise"] === "3-4 times") {
      plan.days_per_week = 4;
    } else if (answers["weight-exercise"] === "5+ times") {
      plan.days_per_week = 5;
    }
  }
  
  // Determine workout type based on goals
  if (goals.includes("Lose Weight")) {
    plan.name = "Weight Loss Training Plan";
    plan.training_type = "cardio_strength";
    plan.description = "High-intensity cardio combined with strength training for weight loss";
    plan.main_goal = "Weight Loss";
  } else if (goals.includes("Build Muscle")) {
    plan.name = "Muscle Building Plan";
    plan.training_type = "strength";
    plan.description = "Progressive resistance training focused on muscle hypertrophy";
    plan.main_goal = "Muscle Gain";
  } else if (goals.includes("Improve Focus")) {
    plan.name = "Mind-Body Fitness Plan";
    plan.training_type = "yoga_mobility";
    plan.description = "Mindful exercise combining yoga, mobility and concentration techniques";
    plan.main_goal = "Mind-Body Balance";
  } else if (goals.includes("Boost Energy")) {
    plan.name = "Energy Boost Plan";
    plan.training_type = "functional";
    plan.description = "Functional training to improve daily energy levels and overall fitness";
    plan.main_goal = "Energy & Vitality";
  }
  
  // Determine preferred workout time and location
  if (answers["preferredWorkoutTime"]) {
    plan.preferred_time = answers["preferredWorkoutTime"];
  }
  
  // Adjust for injuries
  if (answers["previousInjuries"] && answers["previousInjuries"] !== "none") {
    plan.description += ` (Modified for ${answers["previousInjuries"]} considerations)`;
  }
  
  // Generate workouts based on plan type
  plan.workouts = generateWorkouts(plan.training_type, plan.days_per_week, answers["previousInjuries"]);
  
  return plan;
};

// Generate workouts for the training plan
const generateWorkouts = (trainingType: string, daysPerWeek: number, injury?: string) => {
  const workouts = [];
  
  // Define workout templates based on training type
  const workoutTemplates: Record<string, any[]> = {
    "cardio_strength": [
      {
        name: "HIIT Cardio & Core",
        exercises: [
          { name: "Jumping Jacks", sets: 3, reps: "30 seconds", rest: "15 seconds" },
          { name: "Mountain Climbers", sets: 3, reps: "30 seconds", rest: "15 seconds" },
          { name: "Burpees", sets: 3, reps: "10", rest: "30 seconds" },
          { name: "Plank", sets: 3, reps: "30 seconds", rest: "15 seconds" },
          { name: "Russian Twists", sets: 3, reps: "20", rest: "15 seconds" }
        ]
      },
      {
        name: "Lower Body Strength",
        exercises: [
          { name: "Bodyweight Squats", sets: 3, reps: "15", rest: "45 seconds" },
          { name: "Walking Lunges", sets: 3, reps: "10 each side", rest: "45 seconds" },
          { name: "Glute Bridges", sets: 3, reps: "15", rest: "30 seconds" },
          { name: "Calf Raises", sets: 3, reps: "20", rest: "30 seconds" },
          { name: "Wall Sit", sets: 3, reps: "30 seconds", rest: "30 seconds" }
        ]
      },
      {
        name: "Upper Body Circuit",
        exercises: [
          { name: "Push-Ups", sets: 3, reps: "10-15", rest: "45 seconds" },
          { name: "Tricep Dips", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Superman Back Extensions", sets: 3, reps: "12", rest: "30 seconds" },
          { name: "Plank to Push-Up", sets: 3, reps: "8 each side", rest: "45 seconds" },
          { name: "Arm Circles", sets: 2, reps: "30 seconds each direction", rest: "15 seconds" }
        ]
      },
      {
        name: "Cardio Endurance",
        exercises: [
          { name: "Jogging/Running", sets: 1, reps: "20-30 minutes", rest: "N/A" },
          { name: "Jump Rope", sets: 3, reps: "2 minutes", rest: "1 minute" },
          { name: "High Knees", sets: 3, reps: "30 seconds", rest: "15 seconds" },
          { name: "Butt Kicks", sets: 3, reps: "30 seconds", rest: "15 seconds" },
          { name: "Jumping Jacks", sets: 3, reps: "30 seconds", rest: "15 seconds" }
        ]
      },
      {
        name: "Full Body HIIT",
        exercises: [
          { name: "Burpees", sets: 4, reps: "10", rest: "20 seconds" },
          { name: "Jump Squats", sets: 4, reps: "12", rest: "20 seconds" },
          { name: "Mountain Climbers", sets: 4, reps: "30 seconds", rest: "20 seconds" },
          { name: "Push-Ups", sets: 4, reps: "10", rest: "20 seconds" },
          { name: "Plank Jacks", sets: 4, reps: "30 seconds", rest: "20 seconds" }
        ]
      }
    ],
    "strength": [
      {
        name: "Push Day",
        exercises: [
          { name: "Push-Ups", sets: 4, reps: "12-15", rest: "60 seconds" },
          { name: "Incline Push-Ups", sets: 3, reps: "12", rest: "60 seconds" },
          { name: "Tricep Dips", sets: 3, reps: "12", rest: "60 seconds" },
          { name: "Shoulder Taps", sets: 3, reps: "10 each side", rest: "45 seconds" },
          { name: "Pike Push-Ups", sets: 3, reps: "10", rest: "60 seconds" }
        ]
      },
      {
        name: "Pull Day",
        exercises: [
          { name: "Doorway Rows", sets: 4, reps: "12", rest: "60 seconds" },
          { name: "Superman Back Extensions", sets: 3, reps: "15", rest: "45 seconds" },
          { name: "Reverse Snow Angels", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Bicep Curls with Resistance Bands", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Scapular Retractions", sets: 3, reps: "15", rest: "30 seconds" }
        ]
      },
      {
        name: "Leg Day",
        exercises: [
          { name: "Bodyweight Squats", sets: 4, reps: "15-20", rest: "60 seconds" },
          { name: "Walking Lunges", sets: 3, reps: "12 each side", rest: "60 seconds" },
          { name: "Glute Bridges", sets: 3, reps: "15", rest: "45 seconds" },
          { name: "Single-Leg Calf Raises", sets: 3, reps: "15 each side", rest: "30 seconds" },
          { name: "Bulgarian Split Squats", sets: 3, reps: "10 each side", rest: "60 seconds" }
        ]
      },
      {
        name: "Core Focus",
        exercises: [
          { name: "Plank", sets: 3, reps: "45 seconds", rest: "30 seconds" },
          { name: "Bicycle Crunches", sets: 3, reps: "20 each side", rest: "45 seconds" },
          { name: "Russian Twists", sets: 3, reps: "15 each side", rest: "45 seconds" },
          { name: "Leg Raises", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Mountain Climbers", sets: 3, reps: "45 seconds", rest: "30 seconds" }
        ]
      },
      {
        name: "Full Body Strength",
        exercises: [
          { name: "Push-Ups", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Bodyweight Rows", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Bodyweight Squats", sets: 3, reps: "15", rest: "45 seconds" },
          { name: "Plank", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Glute Bridges", sets: 3, reps: "15", rest: "30 seconds" }
        ]
      }
    ],
    "yoga_mobility": [
      {
        name: "Morning Flow",
        exercises: [
          { name: "Sun Salutations", sets: 1, reps: "5 rounds", rest: "As needed" },
          { name: "Warrior Sequence", sets: 1, reps: "5 breaths each side", rest: "As needed" },
          { name: "Balance Poses", sets: 1, reps: "Tree, Eagle - 30 seconds each side", rest: "As needed" },
          { name: "Seated Forward Folds", sets: 1, reps: "5 breaths each position", rest: "As needed" },
          { name: "Meditation", sets: 1, reps: "5 minutes", rest: "N/A" }
        ]
      },
      {
        name: "Mobility & Stretch",
        exercises: [
          { name: "Hip Openers", sets: 1, reps: "60 seconds each position", rest: "As needed" },
          { name: "Shoulder Mobility", sets: 1, reps: "8-10 each movement", rest: "As needed" },
          { name: "Spinal Twists", sets: 1, reps: "30 seconds each side", rest: "As needed" },
          { name: "Ankle & Wrist Mobility", sets: 1, reps: "10 circles each direction", rest: "As needed" },
          { name: "Neck Stretches", sets: 1, reps: "5 breaths each position", rest: "As needed" }
        ]
      },
      {
        name: "Mindful Strength",
        exercises: [
          { name: "Slow Push-Ups with Breath", sets: 2, reps: "8", rest: "As needed" },
          { name: "Warrior Holds", sets: 2, reps: "30 seconds each side", rest: "As needed" },
          { name: "Slow Squats with Breath", sets: 2, reps: "10", rest: "As needed" },
          { name: "Plank with Focus", sets: 2, reps: "30 seconds", rest: "As needed" },
          { name: "Breathing Techniques", sets: 1, reps: "3 minutes", rest: "N/A" }
        ]
      },
      {
        name: "Balance & Focus",
        exercises: [
          { name: "Standing Balance Series", sets: 1, reps: "45 seconds each pose", rest: "As needed" },
          { name: "Concentration Practice", sets: 1, reps: "5 minutes", rest: "N/A" },
          { name: "Slow Flow Sequence", sets: 1, reps: "8 minutes", rest: "As needed" },
          { name: "Breath Control", sets: 3, reps: "10 breaths each pattern", rest: "As needed" },
          { name: "Guided Relaxation", sets: 1, reps: "5 minutes", rest: "N/A" }
        ]
      },
      {
        name: "Restorative Practice",
        exercises: [
          { name: "Supported Reclined Poses", sets: 1, reps: "3-5 minutes each", rest: "N/A" },
          { name: "Deep Stretching", sets: 1, reps: "60-90 seconds each position", rest: "N/A" },
          { name: "Body Scan Meditation", sets: 1, reps: "10 minutes", rest: "N/A" },
          { name: "Breath Awareness", sets: 1, reps: "5 minutes", rest: "N/A" },
          { name: "Final Relaxation", sets: 1, reps: "5-10 minutes", rest: "N/A" }
        ]
      }
    ],
    "functional": [
      {
        name: "Movement Foundations",
        exercises: [
          { name: "Bodyweight Squats", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Push-Ups", sets: 3, reps: "10", rest: "45 seconds" },
          { name: "Pull-Ups or Rows", sets: 3, reps: "8", rest: "45 seconds" },
          { name: "Hip Hinges", sets: 3, reps: "10", rest: "45 seconds" },
          { name: "Bear Crawl", sets: 2, reps: "20 seconds", rest: "40 seconds" }
        ]
      },
      {
        name: "Everyday Strength",
        exercises: [
          { name: "Farmer's Walk", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Suitcase Carry", sets: 3, reps: "30 seconds each side", rest: "30 seconds" },
          { name: "Floor to Standing Transition", sets: 3, reps: "8", rest: "45 seconds" },
          { name: "Step-Ups", sets: 3, reps: "10 each side", rest: "45 seconds" },
          { name: "Standing Rotations", sets: 3, reps: "10 each side", rest: "30 seconds" }
        ]
      },
      {
        name: "Energy Boost Circuit",
        exercises: [
          { name: "Jump Rope", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Squat to Press", sets: 3, reps: "12", rest: "30 seconds" },
          { name: "Lateral Bounds", sets: 3, reps: "10 each side", rest: "30 seconds" },
          { name: "Mountain Climbers", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Dynamic Lunges", sets: 3, reps: "10 each side", rest: "30 seconds" }
        ]
      },
      {
        name: "Mobility & Function",
        exercises: [
          { name: "World's Greatest Stretch", sets: 2, reps: "5 each side", rest: "30 seconds" },
          { name: "Turkish Get-Up Progression", sets: 2, reps: "3 each side", rest: "45 seconds" },
          { name: "Yoga Flow Sequence", sets: 1, reps: "5 minutes", rest: "N/A" },
          { name: "Animal Movement Series", sets: 2, reps: "30 seconds each", rest: "30 seconds" },
          { name: "Joint Mobility Routine", sets: 1, reps: "5 minutes", rest: "N/A" }
        ]
      },
      {
        name: "Recovery & Reset",
        exercises: [
          { name: "Foam Rolling", sets: 1, reps: "60 seconds per area", rest: "N/A" },
          { name: "Static Stretching", sets: 1, reps: "30 seconds per stretch", rest: "N/A" },
          { name: "Breathing Exercises", sets: 3, reps: "10 breaths", rest: "30 seconds" },
          { name: "Light Walking", sets: 1, reps: "10 minutes", rest: "N/A" },
          { name: "Gentle Yoga", sets: 1, reps: "10 minutes", rest: "N/A" }
        ]
      }
    ],
    "balanced": [
      {
        name: "Full Body Workout",
        exercises: [
          { name: "Bodyweight Squats", sets: 3, reps: "15", rest: "45 seconds" },
          { name: "Push-Ups", sets: 3, reps: "10-12", rest: "45 seconds" },
          { name: "Glute Bridges", sets: 3, reps: "15", rest: "30 seconds" },
          { name: "Plank", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Walking Lunges", sets: 2, reps: "10 each side", rest: "45 seconds" }
        ]
      },
      {
        name: "Cardio & Core",
        exercises: [
          { name: "Jumping Jacks", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Mountain Climbers", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Bicycle Crunches", sets: 3, reps: "12 each side", rest: "30 seconds" },
          { name: "High Knees", sets: 3, reps: "30 seconds", rest: "30 seconds" },
          { name: "Russian Twists", sets: 3, reps: "10 each side", rest: "30 seconds" }
        ]
      },
      {
        name: "Strength Focus",
        exercises: [
          { name: "Bodyweight Rows", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Reverse Lunges", sets: 3, reps: "10 each side", rest: "45 seconds" },
          { name: "Tricep Dips", sets: 3, reps: "12", rest: "45 seconds" },
          { name: "Superman Back Extensions", sets: 3, reps: "12", rest: "30 seconds" },
          { name: "Side Plank", sets: 2, reps: "20 seconds each side", rest: "30 seconds" }
        ]
      }
    ]
  };
  
  // Modify exercises based on injury
  const modifyForInjury = (workoutPlan: any[], injury: string) => {
    return workoutPlan.map(workout => {
      const modifiedExercises = workout.exercises.map((exercise: any) => {
        // Modify exercises based on specific injuries
        if (injury === "back") {
          if (["Burpees", "Russian Twists", "Mountain Climbers"].includes(exercise.name)) {
            return {
              name: "Modified " + exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
              note: "Perform with caution, maintain neutral spine"
            };
          }
        } else if (injury === "knee") {
          if (["Jumping Jacks", "Jump Squats", "Burpees", "Lunges"].includes(exercise.name)) {
            return {
              name: "Low-Impact " + exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
              note: "Reduce range of motion, avoid jumping"
            };
          }
        } else if (injury === "shoulder") {
          if (["Push-Ups", "Plank", "Shoulder Taps"].includes(exercise.name)) {
            return {
              name: "Modified " + exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
              note: "Reduce range of motion, focus on form over intensity"
            };
          }
        }
        return exercise;
      });
      
      return {
        ...workout,
        exercises: modifiedExercises
      };
    });
  };
  
  // Select workouts based on training type
  let selectedWorkouts = workoutTemplates[trainingType] || workoutTemplates["balanced"];
  
  // Modify for injuries if necessary
  if (injury && injury !== "none") {
    selectedWorkouts = modifyForInjury(selectedWorkouts, injury);
  }
  
  // Limit to the number of days per week
  selectedWorkouts = selectedWorkouts.slice(0, daysPerWeek);
  
  // Add day labels
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  for (let i = 0; i < selectedWorkouts.length; i++) {
    workouts.push({
      day: daysOfWeek[i],
      ...selectedWorkouts[i]
    });
  }
  
  return workouts;
};

// Calculate body composition based on user data
export const calculateBodyComposition = (quizData: QuizData) => {
  const answers = quizData.answers || {};
  
  // Default values
  let weight = 70; // kg
  let height = 170; // cm
  let age = 30;
  let gender = "female";
  let waist = 80; // cm
  
  // Extract values from quiz answers if available
  if (answers["weight-current"]) {
    weight = parseFloat(answers["weight-current"]);
  }
  
  if (answers["height"]) {
    height = parseFloat(answers["height"]);
  }
  
  if (answers["age"]) {
    age = parseFloat(answers["age"]);
  }
  
  if (answers["gender"]) {
    gender = answers["gender"];
  }
  
  if (answers["waist"]) {
    waist = parseFloat(answers["waist"]);
  }
  
  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Estimate body fat percentage using simplified Navy method
  // This is a very simplified estimate and not accurate for all body types
  let bodyFatPercentage;
  
  if (gender === "male") {
    // Simplified calculation for males
    bodyFatPercentage = 86.01 * Math.log10(waist - 94.42) - 70.041 * Math.log10(height) + 36.76;
  } else {
    // Simplified calculation for females
    bodyFatPercentage = 163.205 * Math.log10(waist + 50.0) - 97.684 * Math.log10(height) - 78.387;
  }
  
  // Ensure body fat is within reasonable range
  bodyFatPercentage = Math.max(5, Math.min(bodyFatPercentage, 45));
  
  // Calculate lean body mass (kg)
  const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
  
  // Calculate fat mass (kg)
  const fatMass = weight * (bodyFatPercentage / 100);
  
  // Calculate ideal body weight range (simplified)
  const minIdealBMI = 18.5;
  const maxIdealBMI = 24.9;
  
  const minIdealWeight = minIdealBMI * heightInMeters * heightInMeters;
  const maxIdealWeight = maxIdealBMI * heightInMeters * heightInMeters;
  
  // Calculate daily calorie needs (Basal Metabolic Rate using Mifflin-St Jeor Equation)
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Adjust based on activity level (assuming moderate activity)
  let activityMultiplier = 1.375; // Default: Light activity
  
  if (answers["weight-exercise"]) {
    if (answers["weight-exercise"] === "None") {
      activityMultiplier = 1.2; // Sedentary
    } else if (answers["weight-exercise"] === "1-2 times") {
      activityMultiplier = 1.375; // Light activity
    } else if (answers["weight-exercise"] === "3-4 times") {
      activityMultiplier = 1.55; // Moderate activity
    } else if (answers["weight-exercise"] === "5+ times") {
      activityMultiplier = 1.725; // Very active
    }
  }
  
  const maintenanceCalories = Math.round(bmr * activityMultiplier);
  
  // Recommended calories based on goals
  let recommendedCalories = maintenanceCalories;
  let calorieAdjustment = 0;
  
  const goals = quizData.goals || [];
  if (goals.includes("Lose Weight")) {
    recommendedCalories = Math.round(maintenanceCalories - 500); // 500 calorie deficit for weight loss
    calorieAdjustment = -500;
  } else if (goals.includes("Build Muscle")) {
    recommendedCalories = Math.round(maintenanceCalories + 300); // 300 calorie surplus for muscle gain
    calorieAdjustment = 300;
  }
  
  return {
    currentStats: {
      weight,
      height,
      bmi: parseFloat(bmi.toFixed(1)),
      bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
      leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
      fatMass: parseFloat(fatMass.toFixed(1))
    },
    targetStats: {
      minIdealWeight: parseFloat(minIdealWeight.toFixed(1)),
      maxIdealWeight: parseFloat(maxIdealWeight.toFixed(1)),
      calorieNeeds: {
        maintenance: maintenanceCalories,
        recommended: recommendedCalories,
        adjustment: calorieAdjustment
      }
    },
    macroRecommendations: calculateMacros(recommendedCalories, goals)
  };
};

// Calculate recommended macronutrients
const calculateMacros = (calories: number, goals: string[]) => {
  let proteinPct = 0.3; // 30% protein
  let fatPct = 0.3;     // 30% fat
  let carbPct = 0.4;    // 40% carbs
  
  // Adjust based on goals
  if (goals.includes("Lose Weight")) {
    proteinPct = 0.35;  // 35% protein
    fatPct = 0.3;       // 30% fat
    carbPct = 0.35;     // 35% carbs
  } else if (goals.includes("Build Muscle")) {
    proteinPct = 0.35;  // 35% protein
    fatPct = 0.25;      // 25% fat
    carbPct = 0.4;      // 40% carbs
  } else if (goals.includes("Boost Energy")) {
    proteinPct = 0.25;  // 25% protein
    fatPct = 0.25;      // 25% fat
    carbPct = 0.5;      // 50% carbs
  }
  
  // Calculate grams
  const proteinCals = calories * proteinPct;
  const fatCals = calories * fatPct;
  const carbCals = calories * carbPct;
  
  // Convert to grams (protein = 4 cal/g, carbs = 4 cal/g, fat = 9 cal/g)
  const proteinGrams = Math.round(proteinCals / 4);
  const fatGrams = Math.round(fatCals / 9);
  const carbGrams = Math.round(carbCals / 4);
  
  return {
    protein: {
      grams: proteinGrams,
      percentage: Math.round(proteinPct * 100)
    },
    fat: {
      grams: fatGrams,
      percentage: Math.round(fatPct * 100)
    },
    carbs: {
      grams: carbGrams,
      percentage: Math.round(carbPct * 100)
    }
  };
};

// Generate supplement recommendations based on quiz answers
export const generateSupplementRecommendations = (quizData: QuizData) => {
  const goals = quizData.goals || [];
  const answers = quizData.answers || {};
  const recommendations: any[] = [];
  
  // Supplement database with product info
  const supplements = [
    {
      id: "whey-protein",
      name: "Whey Protein Isolate",
      description: "High-quality protein for muscle recovery and growth",
      benefits: ["Muscle Recovery", "Lean Muscle Growth", "Convenient Nutrition"],
      recommendedFor: ["Build Muscle", "Lose Weight"],
      url: "https://wellurausa.com/products/whey-chocopro-100-isolate"
    },
    {
      id: "creatine",
      name: "MuscleΠrime Creatine Monohydrate",
      description: "Supports strength, power and muscle recovery",
      benefits: ["Increased Strength", "Improved Power Output", "Enhanced Recovery"],
      recommendedFor: ["Build Muscle"],
      url: "https://wellurausa.com/products/muscleprime-creatine-monohydrate"
    },
    {
      id: "pre-workout",
      name: "Ignite 8™",
      description: "Pre-workout formula for energy, focus and performance",
      benefits: ["Enhanced Energy", "Improved Focus", "Better Workout Performance"],
      recommendedFor: ["Build Muscle", "Boost Energy"],
      url: "https://wellurausa.com/products/ignite-8™"
    },
    {
      id: "vitamin-d",
      name: "Sunburst Vitamin D3 2,000 IU",
      description: "Essential vitamin for immune function and bone health",
      benefits: ["Immune Support", "Bone Health", "Mood Support"],
      recommendedFor: ["Improve Focus", "Boost Energy"],
      url: "https://wellurausa.com/products/sunburst-vitamin-d3-2-000-iu"
    },
    {
      id: "magnesium",
      name: "Magnesium Glycinate 2500",
      description: "Supports muscle function, sleep and stress management",
      benefits: ["Muscle Recovery", "Better Sleep", "Stress Management"],
      recommendedFor: ["Build Muscle", "Sleep Support"],
      url: "https://wellurausa.com/products/magnesium-glycinate-2500"
    },
    {
      id: "collagen",
      name: "PureVital Collagen Powder",
      description: "Supports joint health, skin elasticity and recovery",
      benefits: ["Joint Support", "Skin Health", "Recovery Support"],
      recommendedFor: ["Build Muscle", "Skin Care"],
      url: "https://wellurausa.com/products/purevital-collagen-powder"
    },
    {
      id: "omega-3",
      name: "OceanPower",
      description: "Essential fatty acids for heart health, brain function and inflammation",
      benefits: ["Heart Health", "Brain Function", "Joint Support"],
      recommendedFor: ["Improve Focus", "Build Muscle"],
      url: "https://wellurausa.com/products/oceanpower"
    },
    {
      id: "ashwagandha",
      name: "Stress Shield Ashwagandha",
      description: "Adaptogen for stress management and hormonal balance",
      benefits: ["Stress Management", "Mood Support", "Hormonal Balance"],
      recommendedFor: ["Improve Focus", "Sleep Support"],
      url: "https://wellurausa.com/products/stress-shield-ashwagandha"
    },
    {
      id: "probiotics",
      name: "FloraMax 40B",
      description: "Supports gut health and immune function",
      benefits: ["Digestive Health", "Immune Support", "Nutrient Absorption"],
      recommendedFor: ["Digestive Health"],
      url: "https://wellurausa.com/products/floramax-40b"
    },
    {
      id: "multivitamin",
      name: "VitaBites Gummies Adult",
      description: "Comprehensive vitamin and mineral support",
      benefits: ["Overall Health", "Nutrient Gaps", "Immune Support"],
      recommendedFor: ["Boost Energy", "Improve Focus"],
      url: "https://wellurausa.com/products/vitabites-gummies-adult"
    },
    {
      id: "sleep-aid",
      name: "SereniSleep Caps",
      description: "Natural sleep support for better rest and recovery",
      benefits: ["Better Sleep", "Faster Sleep Onset", "Mental Recovery"],
      recommendedFor: ["Sleep Support", "Improve Focus"],
      url: "https://wellurausa.com/products/serenisleep-caps"
    },
    {
      id: "fat-burner",
      name: "Ultra Burner with MCT",
      description: "Supports metabolism and fat loss goals",
      benefits: ["Metabolic Support", "Fat Utilization", "Energy Support"],
      recommendedFor: ["Lose Weight"],
      url: "https://wellurausa.com/products/ultra-burner-with-mct"
    },
    {
      id: "keto-support",
      name: "KetoMax Turbo5",
      description: "Supports ketogenic diet and metabolism",
      benefits: ["Keto Support", "Metabolic Flexibility", "Energy Support"],
      recommendedFor: ["Lose Weight"],
      url: "https://wellurausa.com/products/ketomax-turbo5"
    },
    {
      id: "digestive-enzymes",
      name: "Natural Digest Capsules",
      description: "Supports digestion and nutrient absorption",
      benefits: ["Digestive Support", "Reduced Bloating", "Nutrient Absorption"],
      recommendedFor: ["Digestive Health"],
      url: "https://wellurausa.com/products/natural-digest-capsules"
    },
    {
      id: "joint-support",
      name: "TurmaFlex Gummies",
      description: "Supports joint health and mobility",
      benefits: ["Joint Comfort", "Mobility Support", "Anti-inflammatory Support"],
      recommendedFor: ["Build Muscle"],
      url: "https://wellurausa.com/products/turmaflex-gummies"
    },
    {
      id: "focus-support",
      name: "NeuroPrime",
      description: "Supports cognitive function and mental clarity",
      benefits: ["Mental Clarity", "Focus Support", "Cognitive Function"],
      recommendedFor: ["Improve Focus"],
      url: "https://wellurausa.com/products/neuroprime"
    },
    {
      id: "energy-drink",
      name: "FloWTide Peach Mango",
      description: "Natural energy drink for sustained energy without crashes",
      benefits: ["Clean Energy", "Mental Focus", "Hydration Support"],
      recommendedFor: ["Boost Energy"],
      url: "https://wellurausa.com/products/flowtide-peach-mango"
    },
    {
      id: "skin-support",
      name: "GlowRenew Serum",
      description: "Supports skin health and appearance",
      benefits: ["Skin Hydration", "Anti-Aging Support", "Skin Tone"],
      recommendedFor: ["Skin Care"],
      url: "https://wellurausa.com/products/glowrenew-serum-for-normal-skin"
    }
  ];
  
  // Score each supplement based on goals and answers
  const scoredSupplements = supplements.map(supplement => {
    let score = 0;
    
    // Score based on goals match
    goals.forEach(goal => {
      if (supplement.recommendedFor.includes(goal)) {
        score += 2;
      }
    });
    
    // Additional scoring based on specific answers
    if (supplement.id === "sleep-aid" && 
       (answers["sleep-quality"] === "Poor" || answers["sleep-quality"] === "Fair")) {
      score += 2;
    }
    
    if (supplement.id === "probiotics" && 
       (answers["digestive-issues"] === "Yes, daily" || answers["digestive-issues"] === "Yes, a few times per week")) {
      score += 2;
    }
    
    if (supplement.id === "joint-support" && answers["previousInjuries"] && answers["previousInjuries"] !== "none") {
      score += 2;
    }
    
    if (supplement.id === "creatine" && answers["muscle-training"] && 
       (answers["muscle-training"] === "3-4 times/week" || answers["muscle-training"] === "5+ times/week")) {
      score += 2;
    }
    
    if (supplement.id === "whey-protein" && answers["muscle-protein"] && 
       (answers["muscle-protein"] === "Low" || answers["muscle-protein"] === "Not sure")) {
      score += 2;
    }
    
    if (supplement.id === "fat-burner" && goals.includes("Lose Weight")) {
      score += 2;
    }
    
    if (supplement.id === "keto-support" && answers["weight-diet"] === "Keto/Low-Carb") {
      score += 3;
    }
    
    if (supplement.id === "focus-support" && goals.includes("Improve Focus")) {
      score += 2;
    }
    
    if (supplement.id === "multivitamin") {
      score += 1; // Good baseline recommendation for most people
    }
    
    return {
      ...supplement,
      score
    };
  });
  
  // Sort by score and take top recommendations (limit to 5)
  const topRecommendations = scoredSupplements
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter(item => item.score > 0); // Only include relevant recommendations
  
  return topRecommendations;
};

// Save generated plans to Supabase
export const savePlansToProfile = async (userId: string, quizData: QuizData, generatedPlans: any) => {
  try {
    const { mealPlan, trainingPlan } = generatedPlans;
    
    // Save training plan if available
    if (trainingPlan) {
      const { error: trainingError } = await supabase
        .from('training_plans')
        .insert({
          user_id: userId,
          training_type: trainingPlan.training_type,
          preferred_time: trainingPlan.preferred_time,
          location: trainingPlan.location,
          main_goal: trainingPlan.main_goal,
          days_per_week: trainingPlan.days_per_week,
          plan_data: {
            name: trainingPlan.name,
            description: trainingPlan.description,
            workouts: trainingPlan.workouts,
            isPersonalized: true,
            generatedFromQuiz: true
          },
          is_active: true
        });
      
      if (trainingError) {
        console.error("Error saving training plan:", trainingError);
      }
    }
    
    // Update profile with the generated data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        quiz_data: {
          ...quizData,
          lastGeneratedPlans: {
            timestamp: new Date().toISOString(),
            mealPlan: mealPlan || null,
            bodyComposition: generatedPlans.bodyComposition || null,
            supplementRecommendations: generatedPlans.supplementRecommendations || null
          }
        }
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error("Error updating profile:", profileError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving plans:", error);
    return false;
  }
};
