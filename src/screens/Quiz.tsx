import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';
import { computeAfqtEstimate } from '../utils/asvab';
import AdaptiveSection from '../utils/adaptiveAsvab';
import { generateChoices } from '../utils/choiceGenerator';
import { isQuizInProgress } from '../utils/quizUtils';
import { explainFormula } from '../utils/formulaExplain';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

function shuffle<T>(arr: T[]) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

export default function Quiz({ route, navigation }: Props) {
    const subjects = route?.params?.subjects ?? 'All';
    const isAsvabSelected = Array.isArray(subjects) ? (subjects as string[]).includes('ASVAB') : (subjects as any) === 'ASVAB';
    const pool = useMemo(() => shuffle(cardsForSubjects(subjects as any)), [subjects]);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [asvabActive, setAsvabActive] = useState(false);
    // ask confirmation when user tries to leave mid-quiz
    const asvabActiveRef = React.useRef(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const isLeavingRef = React.useRef(false);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            // If we've already confirmed leaving, allow the removal without prompting
            if (isLeavingRef.current) return;
            // If the screen is no longer focused (navigation already moved), don't prompt
            if (!navigation.isFocused || !navigation.isFocused()) return;
            const should = require('../utils/navigationUtils').shouldPromptLeave;
            const inProgress = should(index, score, asvabActiveRef.current || false, true, hasSubmitted);
            if (!inProgress) return; // allow leaving if nothing done yet

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // capture the action so the closure does not rely on `e` later
            const action = e?.data?.action;

            // Prompt the user before leaving the screen
            Alert.alert(
                'Leave quiz?',
                'You have an in-progress quiz. Are you sure you want to leave? Your progress will be lost.',
                [
                    { text: "Stay", style: 'cancel', onPress: () => {} },
                    { text: 'Leave', style: 'destructive', onPress: async () => {
                        // mark that we've confirmed leaving so we don't re-prompt
                        isLeavingRef.current = true;
                        try {
                            if (navigation && typeof navigation.goBack === 'function') {
                                navigation.goBack();
                                return;
                            }
                        } catch (e) { /* ignore */ }
                        // fallback to safeDispatch
                        const safe = require('../utils/safeDispatch').default;
                        await safe(navigation, action);
                    } }
                ]
            );
        });

        return unsubscribe;
    }, [navigation, index, score]);

    // Prevent native-stack's swipe/back race by disabling gestures and installing a custom
    // header/back handler and BackHandler while a quiz is in focus and in progress.
    useFocusEffect(
        React.useCallback(() => {
            const prevent = isQuizInProgress(index, score, asvabActiveRef.current || asvabActive, hasSubmitted);
            // only set options when the screen is focused
            if (navigation.isFocused && navigation.isFocused()) {
                navigation.setOptions({ gestureEnabled: !prevent });
            }

            // install hardware back handler on Android when preventing and focused
            let backSub: any = null;
            if (prevent && navigation.isFocused && navigation.isFocused()) {
                backSub = BackHandler.addEventListener('hardwareBackPress', () => {
                    // If the screen lost focus before the alert would be shown, do nothing
                    if (!navigation.isFocused || !navigation.isFocused()) return true;
                    Alert.alert(
                        'Leave quiz?',
                        'You have an in-progress quiz. Are you sure you want to leave? Your progress will be lost.',
                        [
                            { text: 'Stay', style: 'cancel', onPress: () => {} },
                            { text: 'Leave', style: 'destructive', onPress: async () => {
                                // mark leaving to prevent duplicate prompts
                                isLeavingRef.current = true;
                                try {
                                    if (navigation && typeof navigation.goBack === 'function') {
                                        navigation.goBack();
                                        return;
                                    }
                                } catch (e) { /* ignore */ }
                                const safe = require('../utils/safeDispatch').default;
                                await safe(navigation, undefined);
                            } }
                        ]
                    );
                    return true; // consume the back event
                });
            }

            // add a custom headerLeft back button when preventing and focused (ensures JS handles back first)
            if (prevent && navigation.isFocused && navigation.isFocused()) {
                navigation.setOptions({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => {
                            if (!navigation.isFocused || !navigation.isFocused()) return;
                            Alert.alert(
                                'Leave quiz?',
                                'You have an in-progress quiz. Are you sure you want to leave? Your progress will be lost.',
                                [
                                    { text: 'Stay', style: 'cancel', onPress: () => {} },
                                    { text: 'Leave', style: 'destructive', onPress: async () => {
                                        isLeavingRef.current = true;
                                        try {
                                            if (navigation && typeof navigation.goBack === 'function') {
                                                navigation.goBack();
                                                return;
                                            }
                                        } catch (e) { /* ignore */ }
                                        const safe = require('../utils/safeDispatch').default;
                                        await safe(navigation, undefined);
                                    } }
                                ]
                            );
                        }} style={{ paddingHorizontal: 12 }}>
                            <Text style={{ color: '#0a84ff' }}>Back</Text>
                        </TouchableOpacity>
                    )
                });
            } else if (navigation.isFocused && navigation.isFocused()) {
                navigation.setOptions({ headerLeft: undefined });
            }

            return () => {
                if (backSub) backSub.remove && backSub.remove();
                // restore gesture when focus ends
                if (navigation.isFocused && navigation.isFocused()) {
                    navigation.setOptions({ gestureEnabled: true, headerLeft: undefined });
                }
            };
        }, [navigation, index, score, asvabActive, hasSubmitted])
    );

    // keep a ref in sync so the listener above sees up-to-date ASVAB state
    // (see below) we update asvabActiveRef after asvabActive is declared
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
        // derive a difficulty tier heuristic from card subject/type
        const subjectTierMap: Record<string, number> = {
            Arithmetic: 1,
            'Pre-Algebra': 2,
            Algebra: 3,
            Geometry: 3,
            'Word Problems': 3,
            Fractions: 2,
            Decimals: 2,
            'Mixed Numbers': 2,
            'Solve for X': 3,
            ASVAB: 4
        };
        const tier = subjectTierMap[(card as any).subject] ?? 1;
        const extracted = (() => {
            // if answer includes an equals sign, try to pick the RHS
            const a = String((card as any).answer || '');
            const parts = a.split('=');
            return parts.length >= 2 ? parts.slice(1).join('=').trim() : a.trim();
        })();
        const g = generateChoices(extracted, tier);
        return { choices: g.choices, correctText: g.choices[g.correctIndex] };
    }, [card, pool]);

    function choose(choice: string) {
        setHasSubmitted(true);
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

    // ASVAB special mode: if ASVAB was selected, allow starting a timed 30-minute 45-question test
    const [asvabARSection, setAsvabARSection] = useState<AdaptiveSection | null>(null);
    const [asvabMKSection, setAsvabMKSection] = useState<AdaptiveSection | null>(null);
    const [asvabSection, setAsvabSection] = useState<0 | 1>(0); // 0 = AR, 1 = MK
    // index not used in adaptive mode; questions are provided by AdaptiveSection
    const [asvabScore, setAsvabScore] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(30 * 60);
    const [currentAsvabQuestion, setCurrentAsvabQuestion] = useState<{ id: string; prompt: string; answer: string; tier: number } | null>(null);
    const [afqtHistory, setAfqtHistory] = useState<any[] | null>(null);
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

    // keep a ref in sync so the beforeRemove listener sees up-to-date ASVAB state
    React.useEffect(() => { asvabActiveRef.current = asvabActive; }, [asvabActive]);

    // Reset the leaving flag when the screen regains focus or when a quiz session ends
    React.useEffect(() => {
        if (!navigation.isFocused || !navigation.isFocused()) {
            isLeavingRef.current = false;
        }
    }, [navigation.isFocused]);

    // Memoize ASVAB choices so they are stable while viewing a question.
    // This must be declared unconditionally (not inside a conditional render)
    // to preserve hook order across renders.
    const { choices: asvabChoices, correctText: asvabCorrectText } = React.useMemo(() => {
        const card = currentAsvabQuestion;
        if (!card) return { choices: [] as string[], correctText: '' };
        const g = generateChoices(card.answer, card.tier + 1);
        return { choices: g.choices, correctText: g.choices[g.correctIndex] };
    }, [currentAsvabQuestion]);

    // timer effect for ASVAB when active
    React.useEffect(() => {
        if (!asvabActive) return;
        if (secondsLeft <= 0) {
            // time up for current section
            // finish or move to next section
            if (asvabSection === 0) {
                // move to MK
                setAsvabSection(1);
                setSecondsLeft(15 * 60);
                // prime MK question
                if (asvabMKSection) {
                    const next = asvabMKSection.nextQuestion();
                    if (next.q) setCurrentAsvabQuestion({ id: next.q.id, prompt: next.q.prompt, answer: next.q.answer, tier: next.tier });
                }
            } else {
                // both sections done
                const totalQ = (asvabARSection ? asvabARSection.askedCounts.reduce((a,b)=>a+b,0):0) + (asvabMKSection ? asvabMKSection.askedCounts.reduce((a,b)=>a+b,0):0);
                finishAsvab(asvabScore, totalQ);
            }
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [asvabActive, secondsLeft, asvabSection, asvabARSection, asvabMKSection, asvabScore]);

    function startAsvab() {
        // build adaptive sections from test_questions JSON
        const tq = require('../data/test_questions.json');
        const arTiers: any[] = [];
        const mkTiers: any[] = [];
        for (let i = 1; i <= 6; i++) {
            arTiers.push((tq.arithmetic_reasoning as any)[`tier_${i}`] || []);
            mkTiers.push((tq.mathematics_knowledge as any)[`tier_${i}`] || []);
        }
        const mapQ = (arr: any[]) => arr.map((x) => ({ id: x.id, prompt: x.question, answer: x.answer }));
        const arSections = arTiers.map((t: any[]) => mapQ(t));
        const mkSections = mkTiers.map((t: any[]) => mapQ(t));
        const arSec = new AdaptiveSection(arSections, 2);
        const mkSec = new AdaptiveSection(mkSections, 2);
        setAsvabARSection(arSec);
        setAsvabMKSection(mkSec);
        setAsvabSection(0);
        setAsvabScore(0);
        setAsvabActive(true);
        setSecondsLeft(30 * 60);
        // prime first question
        const first = arSec.nextQuestion();
        if (first.q) setCurrentAsvabQuestion({ id: first.q.id, prompt: first.q.prompt, answer: first.q.answer, tier: first.tier });
    }

    async function finishAsvab(finalCorrect: number, totalQuestions: number) {
        const afqt = computeAfqtEstimate(finalCorrect, totalQuestions);
        const record = { id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`, score: afqt, correct: finalCorrect, total: totalQuestions, date: new Date().toISOString() };
        try {
            const raw = await AsyncStorage.getItem('afqt_scores');
            const arr = raw ? (JSON.parse(raw) as any[]) : [];
            arr.push(record);
            await AsyncStorage.setItem('afqt_scores', JSON.stringify(arr));
        } catch (e) {
            console.warn('Failed to save AFQT score', e);
        }
        setAsvabActive(false);
        setAfqtHistory(null); // clear cache so it'll reload if user opens history
        Alert.alert('ASVAB test finished', `Estimated AFQT: ${afqt} (score ${finalCorrect}/${totalQuestions})`);
    }

    async function loadAfqtHistory() {
        try {
            const raw = await AsyncStorage.getItem('afqt_scores');
            const arr = raw ? (JSON.parse(raw) as any[]) : [];
            setAfqtHistory(arr.reverse());
        } catch (e) {
            console.warn('Failed to load AFQT history', e);
        }
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

    // ASVAB special rendering
    if (isAsvabSelected && !asvabActive) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>ASVAB Practice Test</Text>
                <Text style={{ marginBottom: 12 }}>This test has two timed sections: Arithmetic Reasoning (AR) — 30 minutes, and Math Knowledge (MK) — 15 minutes. Each section completes when its timer expires; the overall AFQT estimate is computed after both sections finish.</Text>
                <Button title="Start ASVAB Practice Test" onPress={startAsvab} />
                <View style={{ height: 12 }} />
                <Button title="View AFQT History" onPress={() => loadAfqtHistory()} />
                {afqtHistory ? (
                    <View style={{ marginTop: 12 }}>
                        {afqtHistory.length === 0 ? <Text>No AFQT scores yet</Text> : afqtHistory.slice(0, 5).map((r: any) => (
                            <Text key={r.id}>{new Date(r.date).toLocaleDateString()}: {r.score} ({r.correct}/{r.total})</Text>
                        ))}
                    </View>
                ) : null}
            </View>
        );
    }

    if (isAsvabSelected && asvabActive) {
        const sectionTitle = asvabSection === 0 ? 'Arithmetic Reasoning (AR)' : 'Math Knowledge (MK)';
        const choices = asvabChoices;
        const correctText = asvabCorrectText;

        async function chooseAsvab(choice: string) {
            const correct = choice === correctText;
            if (correct) setAsvabScore((s) => s + 1);
            const sec = asvabSection === 0 ? asvabARSection : asvabMKSection;
            if (sec && currentAsvabQuestion) {
                sec.submitAnswer(currentAsvabQuestion.tier, correct);
                // try to get next question from same section
                const nextQ = sec.nextQuestion();
                if (nextQ.q) {
                    setCurrentAsvabQuestion({ id: nextQ.q.id, prompt: nextQ.q.prompt, answer: nextQ.q.answer, tier: nextQ.tier });
                    return;
                }
                // no more q in this section: move to next or finish
                if (asvabSection === 0) {
                    // move to MK
                    setAsvabSection(1);
                    setSecondsLeft(15 * 60);
                    if (asvabMKSection) {
                        const mkNext = asvabMKSection.nextQuestion();
                        if (mkNext.q) setCurrentAsvabQuestion({ id: mkNext.q.id, prompt: mkNext.q.prompt, answer: mkNext.q.answer, tier: mkNext.tier });
                        else {
                            const totalQ = (asvabARSection ? asvabARSection.askedCounts.reduce((a,b)=>a+b,0):0) + (asvabMKSection ? asvabMKSection.askedCounts.reduce((a,b)=>a+b,0):0);
                            finishAsvab(asvabScore + (correct ? 1 : 0), totalQ);
                        }
                    }
                } else {
                    const totalQ = (asvabARSection ? asvabARSection.askedCounts.reduce((a,b)=>a+b,0):0) + (asvabMKSection ? asvabMKSection.askedCounts.reduce((a,b)=>a+b,0):0);
                    finishAsvab(asvabScore + (correct ? 1 : 0), totalQ);
                }
            }
        }

        return (
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                    <Text>{sectionTitle}</Text>
                    <Text>Time: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</Text>
                </View>

                <Text style={styles.prompt}>{currentAsvabQuestion ? currentAsvabQuestion.prompt : 'Loading question...'}</Text>
                {choices.map((c) => (
                    <TouchableOpacity key={c} style={[styles.choice, selectedChoice === c ? styles.choiceSelected : null]} onPress={() => setSelectedChoice(c)}>
                        <Text>{c}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity testID="submit-asvab" disabled={!selectedChoice} style={[styles.submitButton, !selectedChoice ? styles.submitDisabled : null]} onPress={() => {
                    if (!selectedChoice) return;
                    // submit the selected answer
                    chooseAsvab(selectedChoice);
                    setSelectedChoice(null);
                }}>
                    <Text style={{ color: '#fff' }}>Submit Answer</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                <TouchableOpacity key={c} style={[styles.choice, selectedChoice === c ? styles.choiceSelected : null]} onPress={() => setSelectedChoice(c)}>
                    <Text>{c}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity testID="submit-answer" disabled={!selectedChoice} style={[styles.submitButton, !selectedChoice ? styles.submitDisabled : null]} onPress={() => { if (selectedChoice) { choose(selectedChoice); setSelectedChoice(null); } }}>
                <Text style={{ color: '#fff' }}>Submit Answer</Text>
            </TouchableOpacity>

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
    choice: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
    choiceSelected: {
        borderColor: '#0066ff',
        borderWidth: 2,
        backgroundColor: '#e9f0ff'
    },
    submitButton: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#0066ff',
        borderRadius: 8,
        alignItems: 'center'
    },
    submitDisabled: {
        backgroundColor: '#ccc'
    },
    feedbackOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    feedbackCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10, width: '85%', maxWidth: 500, alignItems: 'center' }
    ,
    revealButton: { marginTop: 12, backgroundColor: '#0a84ff', padding: 8, borderRadius: 6 }
});
