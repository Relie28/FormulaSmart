import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

function shuffle<T>(arr: T[]) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

export default function Quiz({ route, navigation }: Props) {
    const subjects = route?.params?.subjects ?? 'All';
    const pool = useMemo(() => shuffle(cardsForSubjects(subjects as any)), [subjects]);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    // ask confirmation when user tries to leave mid-quiz
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            const inProgress = index > 0 || score > 0;
            if (!inProgress) return; // allow leaving if nothing done yet

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // Prompt the user before leaving the screen
            Alert.alert(
                'Leave quiz?',
                'You have an in-progress quiz. Are you sure you want to leave? Your progress will be lost.',
                [
                    { text: "Stay", style: 'cancel', onPress: () => {} },
                    { text: 'Leave', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) }
                ]
            );
        });

        return unsubscribe;
    }, [navigation, index, score]);
    const [countsByType, setCountsByType] = useState<Record<string, { correct: number; total: number }>>({ definition: { correct: 0, total: 0 }, shape: { correct: 0, total: 0 }, word: { correct: 0, total: 0 } });

    if (!pool.length) return <View style={styles.container}><Text>No cards available for quiz</Text></View>;

    const card = pool[index % pool.length];

    // build choices: for definition/shape pick other answers as distractors
    const choices = useMemo(() => {
        const correct = card.answer;
        const others = pool.filter((c) => c.id !== card.id).map((c) => c.answer);
        const picks = shuffle([correct, ...others.slice(0, 3)]);
        return picks;
    }, [card, pool]);

    function choose(choice: string) {
        const correct = choice === card.answer;
        if (correct) setScore((s) => s + 1);
        // tally counts by card type
        const t = card.type;
        setCountsByType((prev) => {
            const cur = { ...(prev[t] ?? { correct: 0, total: 0 }) };
            cur.total += 1;
            if (correct) cur.correct += 1;
            return { ...prev, [t]: cur };
        });
        if (card.type === 'word' && !correct) {
            Alert.alert('Hint', card.hint ?? 'Try to match quantities to a formula');
        }
        const next = index + 1;
        if (next >= pool.length) {
            const final = correct ? score + 1 : score;
            Alert.alert('Quiz finished', `Score: ${final}/${pool.length}`);
            // save score (include type 'quiz' so History can show it clearly)
            const record = {
                id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                subjects: Array.isArray(subjects) ? subjects : 'All',
                score: final,
                total: pool.length,
                date: new Date().toISOString(),
                type: 'quiz'
            ,
                countsByType
            };
            try {
                AsyncStorage.getItem('quiz_scores').then(async (raw) => {
                    const arr = raw ? (JSON.parse(raw) as any[]) : [];
                    arr.push(record);
                    await AsyncStorage.setItem('quiz_scores', JSON.stringify(arr));
                });
            } catch (e) {
                console.warn('Failed to save score', e);
            }

            setIndex(0);
            setScore(0);
        } else setIndex(next);
    }

    const titleSuffix = Array.isArray(subjects)
        ? subjects.join(', ')
        : subjects === 'All'
            ? 'Quiz'
            : subjects ?? 'Quiz';

    const headerText = titleSuffix === 'Quiz' ? 'Find the formula' : `${titleSuffix}`;

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', }}>
                <Text ellipsizeMode="tail" numberOfLines={1} style={styles.header}>
                    {headerText}
                </Text>

                <Text>Score: {score}</Text>
            </View>

            <Text style={styles.prompt}>
                {card.prompt}
            </Text>

            {choices.map((c) => (
                <TouchableOpacity key={c} style={styles.choice} onPress={() => choose(c)}>
                    <Text>{c}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: { fontSize: 18, fontWeight: '600', marginBottom: 8, width: '80%' },
    prompt: { fontSize: 16, marginVertical: 12 },
    choice: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 }
});
