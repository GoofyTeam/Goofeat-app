import { IngredientProvider } from '@/context/IngredientContext';
import { AuthProvider } from '@/context/AuthContext';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

// import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={/* colorScheme === 'dark' ? DarkTheme : */DefaultTheme}>
      <AuthProvider>
        <IngredientProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Public group */}
            <Stack.Screen name="(public)" />

            {/* Authenticated app group */}
            <Stack.Screen name="(auth)" />

            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </IngredientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
