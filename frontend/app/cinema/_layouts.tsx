// app/cinema/_layout.tsx
import { Stack } from 'expo-router';

export default function CinemaLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MovieDetailScreen"
        options={{
          title: 'Détails du film',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#991d1d',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}