
// Health goals for the quiz
export const healthGoals = [
  { id: "Lose Weight", label: "Lose Weight" },
  { id: "Improve Focus", label: "Improve Focus" },
  { id: "Build Muscle", label: "Build Muscle" },
  { id: "Boost Energy", label: "Boost Energy" },
  { id: "Skin Care", label: "Skin Care" },
  { id: "Sleep Support", label: "Sleep Support" },
  { id: "Digestive Health", label: "Digestive Health" },
];

// Questions for each health goal
const questions = {
  "Lose Weight": [
    {
      id: "weight-current",
      text: "What is your current weight?",
      type: "text",
    },
    {
      id: "weight-goal",
      text: "What is your target weight?",
      type: "text",
    },
    {
      id: "weight-diet",
      text: "How would you describe your current diet?",
      type: "radio",
      options: [
        "Standard American Diet",
        "Mediterranean",
        "Vegetarian/Vegan",
        "Keto/Low-Carb",
        "Intermittent Fasting",
        "Other"
      ]
    },
    {
      id: "weight-exercise",
      text: "How often do you exercise per week?",
      type: "radio",
      options: ["None", "1-2 times", "3-4 times", "5+ times"]
    },
    {
      id: "weight-challenges",
      text: "What are your biggest challenges with weight management?",
      type: "textarea",
    }
  ],
  
  "Improve Focus": [
    {
      id: "focus-work",
      text: "How many hours per day do you need to concentrate on work or studies?",
      type: "radio",
      options: ["Less than 2 hours", "2-4 hours", "4-6 hours", "More than 6 hours"]
    },
    {
      id: "focus-distractions",
      text: "What are your main distractions during the day?",
      type: "textarea",
    },
    {
      id: "focus-sleep",
      text: "How many hours do you sleep on average?",
      type: "radio",
      options: ["Less than 5 hours", "5-6 hours", "7-8 hours", "More than 8 hours"]
    },
    {
      id: "focus-techniques",
      text: "Do you use any productivity techniques or tools?",
      type: "radio",
      options: ["Yes, regularly", "Sometimes", "No, I don't use any techniques"]
    }
  ],
  
  "Build Muscle": [
    {
      id: "muscle-training",
      text: "How often do you currently do strength training?",
      type: "radio",
      options: ["Never", "1-2 times/week", "3-4 times/week", "5+ times/week"]
    },
    {
      id: "muscle-protein",
      text: "How would you rate your protein intake?",
      type: "radio",
      options: ["Low", "Moderate", "High", "Not sure"]
    },
    {
      id: "muscle-experience",
      text: "What is your experience level with strength training?",
      type: "radio",
      options: ["Beginner", "Intermediate", "Advanced"]
    },
    {
      id: "muscle-equipment",
      text: "What equipment do you have access to?",
      type: "radio",
      options: ["None/Home workout", "Dumbbells/Basic equipment", "Full gym", "Personal trainer"]
    }
  ],
  
  "Boost Energy": [
    {
      id: "energy-level",
      text: "How would you rate your current energy levels throughout the day?",
      type: "radio",
      options: ["Very low", "Low", "Moderate", "High with crashes", "Consistently high"]
    },
    {
      id: "energy-caffeine",
      text: "How much caffeine do you consume daily?",
      type: "radio",
      options: ["None", "1-2 cups of coffee/tea", "3-4 cups", "5+ cups"]
    },
    {
      id: "energy-afternoon",
      text: "Do you experience afternoon energy crashes?",
      type: "radio",
      options: ["Yes, daily", "Sometimes", "Rarely", "Never"]
    },
    {
      id: "energy-sleep",
      text: "How would you rate your sleep quality?",
      type: "radio",
      options: ["Poor", "Fair", "Good", "Excellent"]
    }
  ],
  
  "Skin Care": [
    {
      id: "skin-type",
      text: "How would you describe your skin type?",
      type: "radio",
      options: ["Dry", "Oily", "Combination", "Sensitive", "Normal"]
    },
    {
      id: "skin-concerns",
      text: "What are your main skin concerns?",
      type: "radio",
      options: ["Acne", "Aging/wrinkles", "Dryness", "Sensitive/redness", "Uneven tone", "Other"]
    },
    {
      id: "skin-routine",
      text: "Do you currently follow a skincare routine?",
      type: "radio",
      options: ["No routine", "Basic cleanse only", "Cleanse and moisturize", "Comprehensive routine"]
    },
    {
      id: "skin-water",
      text: "How much water do you drink daily?",
      type: "radio",
      options: ["Less than 2 cups", "3-5 cups", "6-8 cups", "More than 8 cups"]
    }
  ],
  
  "Sleep Support": [
    {
      id: "sleep-hours",
      text: "How many hours do you sleep on average per night?",
      type: "radio",
      options: ["Less than 5 hours", "5-6 hours", "7-8 hours", "More than 8 hours"]
    },
    {
      id: "sleep-quality",
      text: "Do you wake up feeling rested?",
      type: "radio",
      options: ["Almost never", "Sometimes", "Most days", "Always"]
    },
    {
      id: "sleep-screens",
      text: "Do you use screens (phone, computer, TV) before bed?",
      type: "radio",
      options: ["Yes, right until I sleep", "Yes, but stop 30 minutes before", "Rarely", "Never"]
    },
    {
      id: "sleep-difficulty",
      text: "Do you have difficulty falling asleep or staying asleep?",
      type: "radio",
      options: ["Yes, most nights", "Sometimes", "Rarely", "Never"]
    },
    {
      id: "sleep-environment",
      text: "How would you describe your sleeping environment?",
      type: "textarea",
    }
  ],
  
  "Digestive Health": [
    {
      id: "digestive-issues",
      text: "Do you experience any digestive discomfort regularly?",
      type: "radio",
      options: ["Yes, daily", "Yes, a few times per week", "Occasionally", "Rarely or never"]
    },
    {
      id: "digestive-food",
      text: "Are there specific foods that trigger digestive issues for you?",
      type: "textarea",
    },
    {
      id: "digestive-fiber",
      text: "How would you rate your fiber intake?",
      type: "radio",
      options: ["Low", "Moderate", "High", "Not sure"]
    },
    {
      id: "digestive-water",
      text: "How much water do you drink daily?",
      type: "radio",
      options: ["Less than 2 cups", "3-5 cups", "6-8 cups", "More than 8 cups"]
    }
  ],
};

// Get questions based on selected goals
export const getQuizQuestions = (selectedGoals: string[]) => {
  const allQuestions: any[] = [];
  
  selectedGoals.forEach(goal => {
    const goalQuestions = questions[goal as keyof typeof questions] || [];
    
    goalQuestions.forEach(question => {
      allQuestions.push({
        ...question,
        goal
      });
    });
  });
  
  return allQuestions;
};

// Generate recommendations based on answers
export const getRecommendations = (selectedGoals: string[], answers: Record<string, any>) => {
  const recommendations: Record<string, string[]> = {};
  
  // Weight Loss Recommendations
  if (selectedGoals.includes("Lose Weight")) {
    const weightRecs = [
      "Aim for a calorie deficit of 500 calories per day for sustainable weight loss.",
      "Include protein in every meal to help with satiety and muscle preservation.",
      "Consider tracking your food intake for at least a few weeks to understand your eating patterns."
    ];
    
    const diet = answers["weight-diet"];
    const exercise = answers["weight-exercise"];
    
    if (diet === "Standard American Diet") {
      weightRecs.push("Try incorporating more whole foods and reducing processed food intake.");
    }
    
    if (exercise === "None" || exercise === "1-2 times") {
      weightRecs.push("Gradually increase your physical activity to at least 150 minutes of moderate exercise per week.");
    }
    
    recommendations["Lose Weight"] = weightRecs;
  }
  
  // Focus Recommendations
  if (selectedGoals.includes("Improve Focus")) {
    const focusRecs = [
      "Practice the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break.",
      "Consider meditation or mindfulness practices for 5-10 minutes daily.",
      "Minimize distractions by using website blockers during work sessions."
    ];
    
    const sleep = answers["focus-sleep"];
    
    if (sleep === "Less than 5 hours" || sleep === "5-6 hours") {
      focusRecs.push("Prioritize getting 7-8 hours of quality sleep to improve focus and cognitive function.");
    }
    
    recommendations["Improve Focus"] = focusRecs;
  }
  
  // Muscle Building Recommendations
  if (selectedGoals.includes("Build Muscle")) {
    const muscleRecs = [
      "Focus on compound exercises that work multiple muscle groups (squats, deadlifts, bench press).",
      "Ensure you're eating enough protein (aim for 1.6-2.2g per kg of bodyweight).",
      "Progressive overload is key - gradually increase weight or reps over time."
    ];
    
    const training = answers["muscle-training"];
    const protein = answers["muscle-protein"];
    
    if (training === "Never" || training === "1-2 times/week") {
      muscleRecs.push("Aim for at least 3-4 strength training sessions per week for optimal muscle growth.");
    }
    
    if (protein === "Low" || protein === "Not sure") {
      muscleRecs.push("Track your protein intake for a week to ensure you're getting enough for muscle growth.");
    }
    
    recommendations["Build Muscle"] = muscleRecs;
  }
  
  // Energy Recommendations
  if (selectedGoals.includes("Boost Energy")) {
    const energyRecs = [
      "Start your day with a balanced breakfast including protein and complex carbs.",
      "Stay hydrated - dehydration can cause fatigue and decreased energy levels.",
      "Incorporate short movement breaks throughout your day to boost circulation and energy."
    ];
    
    const caffeine = answers["energy-caffeine"];
    const afternoon = answers["energy-afternoon"];
    
    if (caffeine === "3-4 cups" || caffeine === "5+ cups") {
      energyRecs.push("Consider gradually reducing caffeine intake and spacing it out earlier in the day.");
    }
    
    if (afternoon === "Yes, daily" || afternoon === "Sometimes") {
      energyRecs.push("Try a small protein-rich snack with complex carbs in the early afternoon to prevent energy crashes.");
    }
    
    recommendations["Boost Energy"] = energyRecs;
  }
  
  // Skin Care Recommendations
  if (selectedGoals.includes("Skin Care")) {
    const skinRecs = [
      "Establish a consistent routine: gentle cleanser, moisturizer, and SPF daily.",
      "Drink plenty of water to help maintain skin hydration from the inside out.",
      "Consider adding antioxidant-rich foods to your diet for skin health."
    ];
    
    const skinType = answers["skin-type"];
    const concerns = answers["skin-concerns"];
    
    if (skinType === "Dry") {
      skinRecs.push("Look for hydrating ingredients like hyaluronic acid and ceramides in your skincare products.");
    } else if (skinType === "Oily") {
      skinRecs.push("Use non-comedogenic products and consider incorporating niacinamide to help regulate oil production.");
    }
    
    if (concerns === "Acne") {
      skinRecs.push("Consider products with salicylic acid or benzoyl peroxide for acne concerns.");
    } else if (concerns === "Aging/wrinkles") {
      skinRecs.push("Incorporate a retinol product and vitamin C serum into your routine for anti-aging benefits.");
    }
    
    recommendations["Skin Care"] = skinRecs;
  }
  
  // Sleep Recommendations
  if (selectedGoals.includes("Sleep Support")) {
    const sleepRecs = [
      "Maintain a consistent sleep schedule, even on weekends.",
      "Create a relaxing bedtime routine to signal to your body it's time to wind down.",
      "Keep your bedroom cool, dark, and quiet for optimal sleep conditions."
    ];
    
    const screens = answers["sleep-screens"];
    const difficulty = answers["sleep-difficulty"];
    
    if (screens === "Yes, right until I sleep") {
      sleepRecs.push("Try to avoid screens at least 1 hour before bed, or use blue light blocking glasses if necessary.");
    }
    
    if (difficulty === "Yes, most nights" || difficulty === "Sometimes") {
      sleepRecs.push("Consider relaxation techniques like deep breathing or progressive muscle relaxation before bed.");
    }
    
    recommendations["Sleep Support"] = sleepRecs;
  }
  
  // Digestive Health Recommendations
  if (selectedGoals.includes("Digestive Health")) {
    const digestiveRecs = [
      "Eat mindfully and chew thoroughly to support the digestive process.",
      "Stay well-hydrated to help maintain good digestive function.",
      "Incorporate probiotic-rich foods like yogurt, kefir, or fermented vegetables."
    ];
    
    const issues = answers["digestive-issues"];
    const fiber = answers["digestive-fiber"];
    
    if (issues === "Yes, daily" || issues === "Yes, a few times per week") {
      digestiveRecs.push("Consider keeping a food journal to identify potential trigger foods.");
    }
    
    if (fiber === "Low" || fiber === "Not sure") {
      digestiveRecs.push("Gradually increase fiber intake through fruits, vegetables, and whole grains to support digestive health.");
    }
    
    recommendations["Digestive Health"] = digestiveRecs;
  }
  
  return recommendations;
};
