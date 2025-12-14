import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Subjects from '../screens/Subjects';
import Flashcards from '../screens/Flashcards';
import Quiz from '../screens/Quiz';

export type RootStackParamList = {
  Home: undefined;
  Subjects: undefined;
  Flashcards: { subjects: string[] | 'All' } | undefined;
  Quiz: { subjects: string[] | 'All' } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Subjects" component={Subjects} />
        <Stack.Screen name="Flashcards" component={Flashcards} />
        <Stack.Screen name="Quiz" component={Quiz} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
