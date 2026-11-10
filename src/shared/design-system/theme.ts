import { theme as antdTheme, type ThemeConfig } from "antd";
import { nezuColorModes, nezuColors, uiTokens } from "./tokens";

/** Tema de Ant Design derivado de los tokens; las hojas de estilo propias usan las mismas variables CSS. */
export const getNezuTheme = (darkMode: boolean): ThemeConfig => {
  const colors = darkMode ? nezuColorModes.dark : nezuColorModes.light;
  const primary = darkMode ? nezuColors.primaryDark : nezuColors.primaryLight;
  return {
    algorithm: darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      colorInfo: nezuColors.info,
      colorSuccess: darkMode ? nezuColors.successDark : nezuColors.successLight,
      colorWarning: darkMode ? nezuColors.warningDark : nezuColors.warningLight,
      colorError: darkMode ? nezuColors.errorDark : nezuColors.errorLight,
      borderRadius: uiTokens.radius.control,
      borderRadiusLG: uiTokens.radius.surface,
      fontFamily: uiTokens.typography.fontFamily,
      fontSize: uiTokens.typography.baseSize,
      fontSizeSM: uiTokens.typography.smallSize,
      fontSizeLG: uiTokens.typography.largeSize,
      fontSizeHeading1: uiTokens.typography.heading.h1,
      fontSizeHeading2: uiTokens.typography.heading.h2,
      fontSizeHeading3: uiTokens.typography.heading.h3,
      fontSizeHeading4: uiTokens.typography.heading.h4,
      fontSizeHeading5: uiTokens.typography.heading.h5,
      fontWeightStrong: 600,
      controlHeight: uiTokens.control.height,
      colorBgLayout: colors.canvas,
      colorBgContainer: colors.surface,
      colorBgElevated: colors.surface,
      colorFillAlter: colors.subtle,
      colorFillSecondary: colors.subtle,
      colorBorder: colors.borderStrong,
      colorBorderSecondary: colors.border,
      colorText: colors.text,
      colorTextSecondary: colors.textSecondary,
      colorTextTertiary: colors.textMuted,
      colorTextDescription: colors.textSecondary,
      boxShadow: "none",
      boxShadowSecondary: darkMode ? "0 16px 40px rgba(0, 0, 0, 0.45)" : "0 16px 40px rgba(17, 26, 22, 0.12)",
    },
    components: {
      Layout: { bodyBg: colors.canvas, siderBg: colors.sidebar },
      Card: { borderRadiusLG: uiTokens.radius.surface, paddingLG: 24, colorBorderSecondary: colors.border },
      Table: {
        headerBg: "transparent",
        headerColor: colors.textSecondary,
        headerSplitColor: "transparent",
        headerBorderRadius: 0,
        rowHoverBg: colors.subtle,
        borderColor: colors.border,
        cellPaddingBlock: 14,
        cellPaddingInline: 16,
        cellFontSize: uiTokens.typography.baseSize,
        fontWeightStrong: 500,
      },
      Button: { fontWeight: 600, controlHeight: uiTokens.control.height, paddingInline: 16, primaryShadow: "none", defaultShadow: "none" },
      Input: { activeBorderColor: primary, hoverBorderColor: primary, colorBgContainer: darkMode ? colors.subtle : colors.surface },
      Select: { activeBorderColor: primary, hoverBorderColor: primary, colorBgContainer: darkMode ? colors.subtle : colors.surface },
      Modal: { borderRadiusLG: uiTokens.radius.surface, titleFontSize: uiTokens.typography.heading.h3 },
      Tag: { borderRadiusSM: 999, fontSizeSM: uiTokens.typography.smallSize },
      Pagination: { itemActiveBg: colors.selected },
      Form: { labelColor: colors.textSecondary, verticalLabelPadding: "0 0 6px" },
    },
  };
};
