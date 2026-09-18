export function sanitizePlainText(value: string, maxLength = 20_000): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeStringList(values: string[], maxLength = 500): string[] {
  return values
    .map((value) => sanitizePlainText(value, maxLength))
    .filter(Boolean);
}

export function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}
