export const DETECTION_COLORS: Record<string, string> = {
  person: "#06b6d4",
  people: "#06b6d4",
  pedestrian: "#06b6d4",
  car: "#f59e0b",
  truck: "#ef4444",
  bus: "#10b981",
  van: "#8b5cf6",
  motor: "#ec4899",
  bicycle: "#14b8a6",
  tricycle: "#f97316",
};

export const FALLBACK_COLOR = "#3b82f6";

export function getDetectionColor(label: string): string {
  return DETECTION_COLORS[label.toLowerCase()] ?? FALLBACK_COLOR;
}
