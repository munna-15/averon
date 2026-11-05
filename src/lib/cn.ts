type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Intentionally minimal; no merge logic. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
