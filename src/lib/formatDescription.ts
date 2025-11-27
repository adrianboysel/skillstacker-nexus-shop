/**
 * Formats product descriptions for clean, readable display
 * Splits descriptions into sentences and adds proper line breaks
 */
export const formatDescription = (description: string): string[] => {
  if (!description) return [];
  
  // Split by periods followed by space or end of string
  const sentences = description
    .split(/\.\s+|\.$/)
    .filter(sentence => sentence.trim().length > 0)
    .map(sentence => {
      const trimmed = sentence.trim();
      // Add period back if it doesn't end with punctuation
      return trimmed.match(/[.!?]$/) ? trimmed : `${trimmed}.`;
    });
  
  return sentences;
};
