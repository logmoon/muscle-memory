import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './constants/theme';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'fade',
          animationDuration: 200,
          presentation: 'transparentModal',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animationTypeForReplace: 'push',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'My Workouts',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="new-workout" 
          options={{ 
            title: 'Create Workout',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="workout/[id]" 
          options={{ 
            title: 'Workout Details',
            headerShown: true,
          }} 
        />
      </Stack>
    </>
  );
}
