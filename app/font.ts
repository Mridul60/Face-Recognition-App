// fonts.ts
import {
    useFonts,
    MarkaziText_500Medium,
  } from '@expo-google-fonts/markazi-text';
  import {
    Karla_400Regular,
    Karla_700Bold,
  } from '@expo-google-fonts/karla';
  
  export const useCustomFonts = () => {
    return useFonts({
      MarkaziText_500Medium,
      Karla_400Regular,
      Karla_700Bold,
    });
  };
  