export const colors = {
  bg: "#14161A",
  surface: "#1D2027",
  surface2: "#262A32",
  border: "#333844",
  borderLight: "#3D4350",

  text: "#ECEDEE",
  textDim: "#8A909C",
  textFaint: "#5B6270",

  accent: "#D9782D",       // warm burnt-orange, primary action color
  accentDim: "#B8631F",
  accentSoft: "rgba(217,120,45,0.15)",

  good: "#4F9D69",         // muted green - attendance healthy
  goodSoft: "rgba(79,157,105,0.15)",
  warn: "#D9A73D",         // muted gold - approaching threshold
  warnSoft: "rgba(217,167,61,0.15)",
  bad: "#C9564F",          // muted terracotta red - below threshold
  badSoft: "rgba(201,86,79,0.15)",

  white: "#FFFFFF",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const spacing = (n: number) => n * 4;

export const font = {
  heading: undefined as string | undefined, // system default, kept for future custom font swap
  mono: undefined as string | undefined,
};
