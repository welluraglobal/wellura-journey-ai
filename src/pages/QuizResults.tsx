
// Update the getBMI function to handle different value types
const getBMI = () => {
  const bmi = bodyComposition?.currentStats?.bmi;
  
  // First, convert to a number if it's a string
  const numericBMI = typeof bmi === 'string' 
    ? parseFloat(bmi) 
    : bmi;
  
  // Then check if it's a valid number
  return typeof numericBMI === 'number' && !isNaN(numericBMI)
    ? numericBMI.toFixed(1)
    : 'N/A';
};
