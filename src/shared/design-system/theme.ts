import { theme as antdTheme } from "antd";
import { nezuColorModes, nezuColors, uiTokens } from "./tokens";

export const getNezuTheme = (darkMode: boolean) => {
  const colors = darkMode ? nezuColorModes.dark : nezuColorModes.light;
  const primary = darkMode ? nezuColors.primaryDark : nezuColors.primaryLight;
  return {
    algorithm: darkMode ? [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm] : [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
    token: { colorPrimary: primary, colorInfo: nezuColors.info, colorSuccess: darkMode ? nezuColors.successDark : nezuColors.successLight, colorWarning: nezuColors.warning, colorError: darkMode ? nezuColors.errorDark : nezuColors.errorLight, borderRadius: uiTokens.radius.control, fontFamily: uiTokens.typography.fontFamily, fontSize: uiTokens.typography.baseSize, fontSizeSM: uiTokens.typography.smallSize, fontSizeLG: uiTokens.typography.largeSize, fontSizeHeading1: uiTokens.typography.heading.h1, fontSizeHeading2: uiTokens.typography.heading.h2, fontSizeHeading3: uiTokens.typography.heading.h3, fontSizeHeading4: uiTokens.typography.heading.h4, fontSizeHeading5: uiTokens.typography.heading.h5, controlHeight: uiTokens.control.height, colorBgLayout: colors.canvas, colorBgContainer: colors.surface, colorFillAlter: colors.subtle, colorBorderSecondary: colors.border, colorText: colors.text, colorTextSecondary: colors.textSecondary },
    components: { Layout: { bodyBg: colors.canvas, siderBg: colors.sidebar }, Menu: { itemBorderRadius: 8, itemHeight: 40, itemMarginBlock: 2, itemSelectedBg: colors.selected, itemSelectedColor: primary }, Card: { borderRadiusLG: uiTokens.radius.surface }, Table: { headerBg: colors.subtle, headerColor: colors.text, headerSplitColor: colors.border, rowHoverBg: colors.subtle, borderColor: colors.border, cellPaddingBlock: 10, cellPaddingInline: 14 }, Input: { activeBorderColor: primary, hoverBorderColor: primary }, Select: { activeBorderColor: primary, hoverBorderColor: primary } },
  };
};
