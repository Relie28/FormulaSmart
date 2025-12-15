import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Subjects from '../screens/Subjects';
import Flashcards from '../screens/Flashcards';
import Quiz from '../screens/Quiz';
import StatsOverview from '../screens/StatsOverview';
import History from '../screens/History';
import Settings from '../screens/Settings';

export type RootStackParamList = {
    Home: undefined;
    Subjects: undefined;
    Flashcards: { subjects: string[] | 'All' } | undefined;
    Quiz: { subjects: string[] | 'All' } | undefined;
    Stats: undefined;
    History: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                <Stack.Screen name="Subjects" component={Subjects} />
                <Stack.Screen name="Flashcards" component={Flashcards} options={({ route }) => {
                    const subjects = (route?.params as any)?.subjects;
                    // If user chose 'All' treat it as 'Flashcard' subject label (not 'All')
                    const titleSuffix = Array.isArray(subjects)
                        ? subjects.join(', ')
                        : subjects === 'All' ? 'Flashcards' : subjects ?? 'Flashcards';
                    return { title: `${titleSuffix}` };
                }} />
                <Stack.Screen name="Quiz" component={Quiz} />
                <Stack.Screen name="Stats" component={StatsOverview} />
                <Stack.Screen name="History" component={History} />
                <Stack.Screen name="Settings" component={Settings} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
