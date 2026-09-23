export const uiTokens = {
  radius: { control: 10, surface: 12 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  control: { height: 40, compactHeight: 36, smallHeight: 28 },
  typography: { fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", baseSize: 14, smallSize: 12, largeSize: 16, heading: { h1: 28, h2: 24, h3: 20, h4: 18, h5: 16 } },
} as const;

export const nezuColors = { primaryLight: "hsl(13 71% 42%)", primaryDark: "hsl(14 86% 70%)", orange500: "#D9542B", lime400: "#C9DF38", info: "#2563EB", successLight: "hsl(70 60% 29%)", successDark: "#C9DF38", warning: "#D97706", errorLight: "#B42318", errorDark: "#F97066" } as const;

export const nezuColorModes = {
  light: { canvas: "hsl(40 29% 96%)", surface: "hsl(40 50% 99%)", subtle: "hsl(39 25% 92%)", border: "hsl(32 12% 73%)", text: "hsl(0 0% 10%)", textSecondary: "hsl(20 6% 33%)", sidebar: "hsl(40 50% 99%)", selected: "hsl(18 42% 91%)" },
  dark: { canvas: "hsl(0 0% 10%)", surface: "hsl(10 4% 16%)", subtle: "hsl(16 5% 24%)", border: "hsl(20 6% 33%)", text: "hsl(39 25% 92%)", textSecondary: "hsl(32 12% 73%)", sidebar: "hsl(10 4% 16%)", selected: "hsl(13 20% 14%)" },
} as const;
