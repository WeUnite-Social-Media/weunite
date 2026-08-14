export const colors = {
  background: "#f4efe6",
  surface: "#fffaf2",
  surfaceStrong: "#ffffff",
  surfaceMuted: "#f1e1cc",
  border: "#d5c0a7",
  borderSoft: "#dfd0bc",
  text: "#2c1d12",
  textMuted: "#5d4734",
  textSoft: "#6d5742",
  brand: "#1d3b2a",
  brandText: "#f7f2ea",
  accent: "#8d5c2d",
} as const;

export const spacing = {
  xs: 4,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
} as const;
