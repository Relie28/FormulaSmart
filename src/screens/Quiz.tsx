import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';
import { explainFormula } from '../utils/formulaExplain';

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

    // build choices: show only the right-hand side of formulas (RHS) or plain-English definitions;
    // mix formulas and plain-English distractors but only one choice is correct
    const { choices, correctText } = useMemo(() => {
        function rhsOf(answer: string) {
            if (!answer) return '';
            const parts = String(answer).split('=');
            if (parts.length >= 2) return parts.slice(1).join('=').trim();
            return answer.trim();
        }

        // helper to get a plain-English explanation for a card (prefer explainFormula)
        function plainOf(c: typeof card) {
            const expl = explainFormula(c as any);
            if (expl) return expl;
            const r = rhsOf(c.answer as string);
            return `This is calculated as ${r}`;
        }

        // pick whether the correct answer will be plain-English or RHS (formula)
        const correctIsPlain = Math.random() < 0.5 && Boolean(plainOf(card));
        const correctText = correctIsPlain ? plainOf(card) : rhsOf(card.answer as string);
        // build a pool of distractor texts (mix of plain and rhs from other cards)
        const distractorPool: string[] = [];
        pool.filter((c) => c.id !== card.id).forEach((c) => {
            const r = rhsOf(c.answer as string);
            const p = plainOf(c as any);
            if (r) distractorPool.push(r);
            if (p) distractorPool.push(p);
        });

        // remove duplicates and the correct text
        const uniq = Array.from(new Set(distractorPool.filter((t) => t && t !== correctText)));

        const picks = shuffle(uniq).slice(0, 3);
        const all = shuffle([correctText, ...picks]);
        return { choices: all, correctText };
    }, [card, pool]);

    function choose(choice: string) {
        const correct = choice === correctText;
        if (correct) setScore((s) => s + 1);
        // tally counts by card type
        const t = card.type;
        setCountsByType((prev) => {
            const cur = { ...(prev[t] ?? { correct: 0, total: 0 }) };
            cur.total += 1;
            if (correct) cur.correct += 1;
            return { ...prev, [t]: cur };
        });
        if (!correct) {
            // On wrong answer, show the plain-English definition and the formula (full answer)
            const plain = explainFormula(card as any) ?? `Definition: ${card.prompt}`;
            const formula = String(card.answer);
            let msg = `${plain}\n\nFormula: ${formula}`;
            if (card.type === 'word') {
                const { hintForWordProblem } = require('../utils/wordHints');
                msg += `\n\nHint: ${hintForWordProblem(card.prompt)}`;
            }
            Alert.alert('Wrong', msg);
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
