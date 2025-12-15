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
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackPlain, setFeedbackPlain] = useState<string | null>(null);
    const [feedbackFormula, setFeedbackFormula] = useState<string | null>(null);
    const [feedbackIsCorrect, setFeedbackIsCorrect] = useState(false);

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
        // tally counts by card type (this records the question as answered)
        const t = card.type;
        setCountsByType((prev) => {
            const cur = { ...(prev[t] ?? { correct: 0, total: 0 }) };
            cur.total += 1;
            if (correct) cur.correct += 1;
            return { ...prev, [t]: cur };
        });

        // prepare feedback (plain-English + formula) and show a non-counting prompt screen
        const plain = explainFormula(card as any) ?? `Definition: ${card.prompt}`;
        const formula = String(card.answer ?? '');
        setFeedbackPlain(plain);
        setFeedbackFormula(formula);
        setFeedbackIsCorrect(correct);
        setFeedbackVisible(true);
    }

    async function finishQuiz(finalScore: number) {
        Alert.alert('Quiz finished', `Score: ${finalScore}/${pool.length}`);
        const record = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            subjects: Array.isArray(subjects) ? subjects : 'All',
            score: finalScore,
            total: pool.length,
            date: new Date().toISOString(),
            type: 'quiz',
            countsByType
        } as any;
        try {
            const raw = await AsyncStorage.getItem('quiz_scores');
            const arr = raw ? (JSON.parse(raw) as any[]) : [];
            arr.push(record);
            await AsyncStorage.setItem('quiz_scores', JSON.stringify(arr));
        } catch (e) {
            console.warn('Failed to save score', e);
        }
        setIndex(0);
        setScore(0);
        setFeedbackVisible(false);
    }

    function nextFromFeedback() {
        const next = index + 1;
        const finalIfLast = score; // score already updated when answered
        setFeedbackVisible(false);
        setFeedbackPlain(null);
        setFeedbackFormula(null);
        setFeedbackIsCorrect(false);
        if (next >= pool.length) {
            finishQuiz(finalIfLast);
        } else {
            setIndex(next);
        }
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

            {feedbackVisible && (
                <View style={styles.feedbackOverlay}>
                    <View style={styles.feedbackCard}>
                        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{feedbackIsCorrect ? 'Correct' : 'Explanation'}</Text>
                        {feedbackPlain ? <Text style={{ marginBottom: 8 }}>{feedbackPlain}</Text> : null}
                        {/* only show formula if it's meaningfully different from the plain explanation */}
                        {feedbackFormula && !(feedbackPlain ?? '').toLowerCase().includes((feedbackFormula ?? '').toLowerCase()) ? (
                            <Text style={{ marginTop: 6, fontStyle: 'italic' }}>Formula: {feedbackFormula}</Text>
                        ) : null}
                        <TouchableOpacity style={[styles.revealButton, { marginTop: 12 }]} onPress={nextFromFeedback}>
                            <Text style={{ color: '#fff' }}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: { fontSize: 18, fontWeight: '600', marginBottom: 8, width: '80%' },
    prompt: { fontSize: 16, marginVertical: 12 },
    choice: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 }
    ,
    feedbackOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    feedbackCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, width: '85%', maxWidth: 500, alignItems: 'center' }
    ,
    revealButton: { marginTop: 12, backgroundColor: '#0a84ff', padding: 8, borderRadius: 6 }
});
