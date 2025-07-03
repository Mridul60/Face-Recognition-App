import { useColorScheme } from 'react-native';
import { getTheme, ThemeMode } from './theme';

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';

  return getTheme(mode);
};
// This hook can be used in components to access the current theme
