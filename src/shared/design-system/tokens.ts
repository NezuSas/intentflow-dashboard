/**
 * Sistema de diseño del panel · tokens.
 *
 * Misma paleta que nezuecuador.com y que NEZU Kiosk: neutros con tinte verde (tinta y papel), naranja NEZU como
 * primario y lima solo para lo correcto o activo. Rubik como única familia tipográfica, con contraste por peso.
 */
export const uiTokens = {
  radius: { control: 8, surface: 14 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  control: { height: 38, compactHeight: 32, smallHeight: 28 },
  typography: {
    fontFamily: "var(--font-rubik), Rubik, system-ui, sans-serif",
    monoFamily: "ui-monospace, 'Cascadia Mono', Consolas, monospace",
    baseSize: 14,
    smallSize: 12.5,
    largeSize: 16,
    heading: { h1: 28, h2: 22, h3: 18, h4: 16, h5: 14 },
  },
} as const;

export const nezuColors = {
  /** Naranja NEZU: oscuro sobre papel, más claro sobre tinta para mantener contraste. */
  primaryLight: "hsl(14 72% 44%)",
  primaryDark: "hsl(14 82% 62%)",
  orange500: "#D9542B",
  lime400: "#C9DF38",
  info: "hsl(205 70% 45%)",
  successLight: "hsl(72 60% 30%)",
  successDark: "#C9DF38",
  warningLight: "hsl(34 85% 38%)",
  warningDark: "hsl(36 90% 62%)",
  errorLight: "hsl(4 70% 44%)",
  errorDark: "hsl(6 90% 70%)",
} as const;

export const nezuColorModes = {
  light: {
    canvas: "hsl(70 21% 94.5%)",
    surface: "hsl(70 30% 98.5%)",
    subtle: "hsl(70 16% 91%)",
    border: "hsl(80 8% 84%)",
    borderStrong: "hsl(80 8% 72%)",
    text: "hsl(153 21% 8.4%)",
    textSecondary: "hsl(150 8% 36%)",
    textMuted: "hsl(150 6% 52%)",
    sidebar: "hsl(153 21% 8.4%)",
    sidebarText: "hsl(70 21% 94.5%)",
    selected: "hsl(18 42% 91%)",
  },
  dark: {
    canvas: "hsl(153 21% 8.4%)",
    surface: "hsl(150 16% 11.5%)",
    subtle: "hsl(150 12% 15.5%)",
    border: "hsl(150 10% 20%)",
    borderStrong: "hsl(150 8% 30%)",
    text: "hsl(70 21% 94.5%)",
    textSecondary: "hsl(70 10% 70%)",
    textMuted: "hsl(70 6% 52%)",
    sidebar: "hsl(153 24% 6.5%)",
    sidebarText: "hsl(70 21% 94.5%)",
    selected: "hsl(14 40% 16%)",
  },
} as const;
