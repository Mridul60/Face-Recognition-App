// theme.ts
export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#EDEFEE',
    primary: '#495E57',
    secondary: '#F4CE14',
    accent1: '#EE9972',
    accent2: '#FBDABB',
    textPrimary: '#333333',
    textSecondary: '#495E57',
    border: '#CAD2C5',
  },
  dark: {
    background: '#252E46',
    surface: '#344E52',
    primary: '#CAD2C5',
    secondary: '#F4CE14',
    accent1: '#EE9972',
    accent2: '#FBDABB',
    textPrimary: '#FFFFFF',
    textSecondary: '#CAD2C5',
    border: '#495E57',
  },
};

export const FontSizes = {
  displayTitle: 64,
  subTitle: 40,
  heading: 20,
  lead: 18,
  body: 16,
  caption: 14,
};

export const Fonts = {
  display: 'MarkaziText_500Medium',
  body: 'Karla_400Regular',
  bold: 'Karla_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
};

export type ThemeMode = 'light' | 'dark';

export const getTheme = (mode: ThemeMode) => ({
  colors: Colors[mode],
  fonts: Fonts,
  fontSizes: FontSizes,
  spacing: Spacing,
  radius: BorderRadius,
});
