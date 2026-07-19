export function truncateText(text: string, maxLength: number = 120): string {
  if (!text) return "";

  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const truncated = trimmed.slice(0, maxLength);

  // avoid cutting the last word
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace === -1) {
    return truncated + "...";
  }

  return truncated.slice(0, lastSpace) + "...";
}
