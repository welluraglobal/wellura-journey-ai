
// Function to detect language from text
export const detectLanguage = (text: string): "pt" | "es" | "en" => {
  // Portuguese indicators
  const ptIndicators = [
    /obrigad[oa]/, /bom dia/, /boa tarde/, /boa noite/, /como vai/, /tudo bem/,
    /olá/, /oi/, /quero/, /preciso/, /ajuda/, /saúde/, /peso/, /exercício/
  ];
  
  // Spanish indicators
  const esIndicators = [
    /gracias/, /buenos días/, /buenas tardes/, /buenas noches/, /cómo estás/,
    /hola/, /quiero/, /necesito/, /ayuda/, /salud/, /peso/, /ejercicio/
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for accented characters common in Portuguese
  if (/[áàãâéêíóôõúüç]/i.test(lowerText) || ptIndicators.some(regex => regex.test(lowerText))) {
    return "pt";
  }
  
  // Check for Spanish patterns
  if (/[áéíóúüñ]/i.test(lowerText) || esIndicators.some(regex => regex.test(lowerText))) {
    return "es";
  }
  
  // Default to English
  return "en";
};
