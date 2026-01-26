// app/_layout.tsx
import React, { createContext, useContext, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import 'react-native-reanimated';


const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#991d1dff',
    success: '#fdff789a',
    accent: '#05ff05a4',
    background: '#fff',
    surface: '#fff',
    text: '#000',
    error: '#ff002fff',
    natou: '#8951adde',
  },
};

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#991d1dff',
    success: '#fdff789a',
    accent: '#05ff05a4',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#fff',
    error: '#ff002fff',
    natou: '#8951adde',
  },
};

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export function useAppTheme() {
  return useContext(ThemeContext);
}

export default function RootLayout() {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={isDark ? darkTheme : lightTheme}>
        <Stack
          initialRouteName="IntroScreen"
          screenOptions={{
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
      </PaperProvider>
    </ThemeContext.Provider>
  );
}
