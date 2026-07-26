/**
 * Custom slugify function that supports Unicode characters (like Bengali, Arabic, etc.)
 * Standard slugify packages often strip non-Latin characters.
 * 
 * @param text The string to slugify
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return "";
  
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/[^\p{L}\p{N}\p{M}\-]/gu, "") // Remove all non-word chars except letters, numbers, marks, and hyphens (Unicode aware)
    .replace(/\-+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^\-|\-$/g, ""); // Trim hyphens from start and end
}
