/**
 * Parse JSON from AI responses, handling common formatting issues
 * like markdown code blocks and extra whitespace.
 */
export function parseAIJSON(text, fallback = null) {
  if (!text) return fallback;
  try {
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}
