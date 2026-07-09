import { useFonts } from 'expo-font';
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
  LibreBaskerville_700Bold,
} from '@expo-google-fonts/libre-baskerville';
import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';

export function useAppFonts() {
  return useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_400Regular_Italic,
    LibreBaskerville_700Bold,
    Merriweather_400Regular,
    Merriweather_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexMono_500Medium,
  });
}
