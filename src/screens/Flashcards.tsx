import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';
import FlashcardView from '../components/FlashcardView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDeviceSize } from '../utils/device';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcards'>;

export default function Flashcards({ route, navigation }: Props) {

    const { width, height } = useDeviceSize();

    const subjects = route?.params?.subjects ?? 'All';
    const pool = cardsForSubjects(subjects as any);
    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);

    if (!pool.length) return (
        <View style={styles.container}>
            <Text>
                No cards found for that selection
            </Text>
        </View>
    );

    const card = pool[index % pool.length];

    async function finishSession() {
        const score = results.filter((r) => r.correct).length;
        const record = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            subjects: Array.isArray(subjects) ? subjects : 'All',
            score,
            total: pool.length,
            date: new Date().toISOString(),
            type: 'flashcard'
        } as any;
        // compute counts by type from results using card metadata
        const countsByType: Record<string, { correct: number; total: number }> = { definition: { correct: 0, total: 0 }, shape: { correct: 0, total: 0 }, word: { correct: 0, total: 0 } };
        results.forEach((res) => {
            const cardMeta = cards.find((c) => c.id === res.id);
            const t = cardMeta ? cardMeta.type : 'definition';
            if (!countsByType[t]) countsByType[t] = { correct: 0, total: 0 };
            countsByType[t].total += 1;
            if (res.correct) countsByType[t].correct += 1;
        });
        (record as any).countsByType = countsByType;

        try {
            const raw = await AsyncStorage.getItem('flashcard_sessions');
            const arr = raw ? (JSON.parse(raw) as any[]) : [];
            arr.push(record);
            await AsyncStorage.setItem('flashcard_sessions', JSON.stringify(arr));
        } catch (e) {
            console.warn('Failed to save flashcard session', e);
        }

        Alert.alert('Session finished', `Score: ${score}/${pool.length}`);
        // after finishing, navigate back or reset
        navigation.navigate('Home');
    }

    function markAnswer(correct: boolean) {
        // record and advance forward only
        setResults((r) => [...r, { id: card.id, correct }]);
        const next = index + 1;
        setRevealed(false);
        if (next >= pool.length) {
            finishSession();
        } else {
            setIndex(next);
        }
    }

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width - 32, }}>
                <Text style={[styles.sub, { opacity: 0 }]}>
                    {index + 1}/{pool.length}
                </Text>

                <Text style={styles.sub}>
                    {index + 1}/{pool.length}
                </Text>
            </View>

            <FlashcardView card={card} revealed={revealed} onReveal={() => setRevealed(true)} onShowHint={() => {
                if (card.type === 'word') {
                    const { hintForWordProblem } = require('../utils/wordHints');
                    Alert.alert('Hint', hintForWordProblem(card.prompt));
                } else {
                    const hint = (card as any).hint ?? 'Try to identify which formula fits the quantities in the problem.';
                    Alert.alert('Hint', 'Hint: ' + hint);
                }
            }} />

            {!revealed ? (
                <View style={[styles.actions, { marginTop: 15 }]}>
                    <Text style={{ color: '#666', paddingHorizontal: 20, textAlign: 'center', }}>
                        Tap Reveal answer when ready. You cannot go back after revealing.
                    </Text>
                </View>
            ) : (
                <View style={styles.actions}>
                    <Button title="I missed it" onPress={() => markAnswer(false)} color="#d33" />
                    <Button title="I got it" onPress={() => markAnswer(true)} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', flex: 1, padding: 16, alignItems: 'center' },
    header: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    sub: { fontSize: 14, color: '#666', marginBottom: 12 }
});
