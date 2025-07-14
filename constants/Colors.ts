const tintColorLight = '#0C924B'; // primary green used in the header & icons
const tintColorDark = '#0C924B'; // same green used in dark mode for highlight

export const Colors = {
  light: {
    text: '#1C1C1E',                // dark gray text for light backgrounds
    background: '#FFFFFF',          // white background
    tint: tintColorLight,           // primary green
    icon: '#6E6E73',                // neutral gray for inactive icons
    tabIconDefault: '#6E6E73',      // default icon color (gray)
    tabIconSelected: tintColorLight,// selected icon (green)
    // accentcolor : '#cad2c5',
    // accentborder : '#A4B0A7	',
    secondaryText: '#8E8E93',
    destructive: '#FF3B30',
    accentcolor: '#D0F4DE',
    accentborder: '#B0D8C9',
  },
  dark: {
    text: '#F2F2F7',                // light text on dark background
    background: '#1a201cff',          // very dark gray background
    tint: tintColorDark,            // primary green (highlight)
    icon: '#9BA1A6',                // subtle gray for icons in dark mode
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    accentcolor : '#4B5E52',
    accentborder : '#3E4F47',
    // Add these:
    secondaryText: '#A1A1AA', // or another softer gray for dark mode
    destructive: '#FF453A',
   
  },
};
