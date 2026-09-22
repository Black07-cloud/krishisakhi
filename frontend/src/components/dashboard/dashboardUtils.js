/**
 * Priority colour mapping — matches backend FarmTask enum:
 * "low" | "normal" | "high" | "urgent"
 */
export const PRIORITY_COLOR = {
  urgent: { bar: "#dc2626", badge: "badge-red" },
  high:   { bar: "#d97706", badge: "badge-amber" },
  normal: { bar: "#2563eb", badge: "badge-blue" },
  low:    { bar: "#94a3b8", badge: "badge-gray" },
};

/**
 * Crop stage progression — matches backend Crop enum:
 * seed → germination → vegetative → flowering → fruiting → maturity → harvest
 */
export const STAGE_PROGRESS = {
  seed:        10,
  germination: 22,
  vegetative:  40,
  flowering:   57,
  fruiting:    72,
  maturity:    88,
  harvest:     100,
};

/** Irrigation decision colours */
export const IRRIGATION_COLOR = {
  irrigate: { bg: "#dbeafe", color: "#2563eb" },
  delay:    { bg: "#fef3c7", color: "#d97706" },
  monitor:  { bg: "#dcfce7", color: "#16a34a" },
};

/** Greeting based on hour */
export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/** Format a date as "12 Jan 2026" */
export const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** Capitalize first char */
export const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
