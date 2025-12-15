import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';
import FlashcardView from '../components/FlashcardView';
import { explainFormula } from '../utils/formulaExplain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import safeDispatch from '../utils/safeDispatch';
import { useDeviceSize } from '../utils/device';
import applyAnswerToDeck from '../utils/deckUtils';
import computeSessionSummary from '../utils/sessionStats';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcards'>;

function shuffle<T>(arr: T[]) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

export default function Flashcards({ route, navigation }: Props) {

    const { width, height } = useDeviceSize();

    const subjects = route?.params?.subjects ?? 'All';
    const initialDeck = useMemo(() => cardsForSubjects(subjects as any), [subjects]);
    const [deck, setDeck] = useState(() => shuffle(initialDeck));
    const [revealed, setRevealed] = useState(false);
    const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
    const [shouldFinish, setShouldFinish] = useState(false);
    const [pendingFinalResults, setPendingFinalResults] = useState<{ id: string; correct: boolean }[] | null>(null);
    const finishCancelledRef = React.useRef(false);
    const isMountedRef = React.useRef(true);
    React.useEffect(() => {
        return () => { isMountedRef.current = false; };
    }, []);

    // compute unique-correct count so score starts at 0 and does not double-count
    const uniqueCorrectCount = React.useMemo(() => {
        const s = new Set(results.filter((r) => r.correct).map((r) => r.id));
        return s.size;
    }, [results]);

    // Previously we prevented native back behavior to avoid a rare crash,
    // but we now allow native back navigation to proceed unimpeded so the
    // user can quickly return to Home. No explicit prevention or header
    // option manipulation is performed here.

    const inProgress = React.useMemo(() => deck.length > 0 || results.length > 0 || revealed || shouldFinish,
        [deck.length, results.length, revealed, shouldFinish]);

    // We no longer intercept or prevent native back navigation from this
    // screen. The user can go back to Home unimpeded without prompts.

    // We do not intercept Android hardware back presses; allow default OS
    // behavior so users can exit the screen without prompts.

    if (!initialDeck.length) return (
        <View style={styles.container}>
            <Text>
                No cards found for that selection
            </Text>
        </View>
    );
    const card = deck[0];

    // Auto-advance 15 seconds after the user reveals the card
    React.useEffect(() => {
        let t: ReturnType<typeof setTimeout> | null = null;
        if (revealed) {
            t = setTimeout(async () => {
                // Advance to next without recording an answer
                setRevealed(false);
                if (deck.length <= 1) {
                    // clearing deck and schedule finish
                    setDeck([]);
                    setPendingFinalResults(results);
                    finishCancelledRef.current = false; // reset cancellation flag
                    // debug
                    // eslint-disable-next-line no-console
                    console.debug('Flashcards: scheduling finish (shouldFinish=true)');
                    (async () => {
                        try {
                            const raw = await AsyncStorage.getItem('flashcards_debug');
                            const arr = raw ? JSON.parse(raw) : [];
                            arr.push({ at: new Date().toISOString(), msg: 'scheduling finish' });
                            await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
                        } catch (err) {
                            /* ignore */
                        }
                    })();
                    setShouldFinish(true);
                } else {
                    setDeck((prev: any[]) => {
                        const [, ...rest] = prev;
                        return rest;
                    });
                }
            }, 15000);
        }
        return () => {
            if (t) clearTimeout(t);
        };
    }, [revealed, results, deck]);

    // When a finish is scheduled (to avoid re-entrancy inside state updaters),
    // run finishSession from an effect so it always executes outside of the
    // state update callbacks and avoids ordering/race issues.
    React.useEffect(() => {
        if (!shouldFinish) return;
        if (finishCancelledRef.current) {
            // finish was cancelled (user opted to leave) — clear flags and abort
            // eslint-disable-next-line no-console
            console.debug('Flashcards: scheduled finish aborted (finishCancelledRef true)');
            (async () => {
                try {
                    const raw = await AsyncStorage.getItem('flashcards_debug');
                    const arr = raw ? JSON.parse(raw) : [];
                    arr.push({ at: new Date().toISOString(), msg: 'scheduled finish aborted' });
                    await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
                } catch (err) { /* ignore */ }
            })();
            setShouldFinish(false);
            setPendingFinalResults(null);
            finishCancelledRef.current = false;
            return;
        }
        const toFinish = pendingFinalResults ?? results;
        // eslint-disable-next-line no-console
        console.debug('Flashcards: running scheduled finish');
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('flashcards_debug');
                const arr = raw ? JSON.parse(raw) : [];
                arr.push({ at: new Date().toISOString(), msg: 'running scheduled finish' });
                await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
            } catch (err) { /* ignore */ }
        })();
        setShouldFinish(false);
        setPendingFinalResults(null);
        finishSession(toFinish);
    }, [shouldFinish, pendingFinalResults, results]);

    // If there is no current card (deck emptied), show a short finished view and avoid
    // calling helpers that expect a defined card (prevents 'type' of undefined errors).
    if (!card) {
        return (
            <View style={styles.container}>
                <Text>No more cards — session finished</Text>
            </View>
        );
    }

    async function finishSession(finalResults?: { id: string; correct: boolean }[]) {
        const final = finalResults ?? results;
        // eslint-disable-next-line no-console
        console.debug('Flashcards: finishSession start', { finalLength: final.length, shouldFinish: shouldFinish, finishCancelled: finishCancelledRef.current });
        try {
            const raw = await AsyncStorage.getItem('flashcards_debug');
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ at: new Date().toISOString(), msg: `finishSession start finalLength=${final.length}` });
            await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
        } catch (err) { /* ignore */ }

        // If component is unmounted (user navigated away), abort finishing to
        // avoid showing alerts/navigating after the component is gone.
        if (!isMountedRef.current) return;

        const { score, total, countsByType } = computeSessionSummary(final, initialDeck);

        const record = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            subjects: Array.isArray(subjects) ? subjects : 'All',
            score,
            total,
            date: new Date().toISOString(),
            type: 'flashcard'
        } as any;

        (record as any).countsByType = countsByType;

        try {
            const raw = await AsyncStorage.getItem('flashcard_sessions');
            const arr = raw ? (JSON.parse(raw) as any[]) : [];
            arr.push(record);
            await AsyncStorage.setItem('flashcard_sessions', JSON.stringify(arr));
        } catch (e) {
            console.warn('Failed to save flashcard session', e);
        }

        setDeck(shuffle(initialDeck));
        setRevealed(false);
        setResults([]);

        if (!isMountedRef.current) return;
        // eslint-disable-next-line no-console
        console.debug('Flashcards: showing session finished alert');
        try {
            const raw = await AsyncStorage.getItem('flashcards_debug');
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ at: new Date().toISOString(), msg: `showing session finished alert score=${score}` });
            await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
        } catch (err) { /* ignore */ }
        Alert.alert('Session finished', `Score: ${score}/${total}`);
        // after finishing, navigate back or reset
        navigation.navigate('Home');
    }

        

    function markAnswer(correct: boolean) {
        // record the result and update the deck. If incorrect, reinsert the card at a
        // random position in the remaining deck so the user will see it again later.
        const currentCard = card;
        const newResults = [...results, { id: currentCard.id, correct }];
        setResults(newResults);
        setRevealed(false);

        // If this answer finishes the deck, schedule the finish instead of
        // calling finishSession inside the updater.
        if (correct && deck.length <= 1) {
            setDeck((prev: any[]) => {
                const { newDeck } = applyAnswerToDeck(prev, correct);
                return newDeck;
            });
            setPendingFinalResults(newResults);
            setShouldFinish(true);
        } else {
            setDeck((prev: any[]) => {
                const { newDeck } = applyAnswerToDeck(prev, correct);
                return newDeck;
            });
        }
    }

    const expl = explainFormula(card);
    const infoOnly = Boolean(revealed && expl && expl.toLowerCase().startsWith('this formula computes'));

    const currentPosition = results.length + 1;
    const totalInSession = results.length + deck.length;
    // uniqueCorrectCount is memoized earlier to keep hooks order stable

    // (Auto-advance effect declared above; do not duplicate it here)

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width - 32, }}>
                <Text style={[styles.sub, { opacity: 0 }] }>
                    {currentPosition}/{totalInSession}
                </Text>

                <Text style={styles.sub}>
                    Score: {uniqueCorrectCount}/{initialDeck.length}
                </Text>
            </View>

                <FlashcardView card={card} revealed={revealed} hideAnswer={infoOnly} onReveal={() => setRevealed(true)} onShowHint={() => {
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
            ) : infoOnly ? (
                <View style={styles.actions}>
                    <Button title="Next" onPress={() => {
                        // advance without recording a result (info-only prompt)
                        setRevealed(false);
                        if (deck.length <= 1) {
                            setDeck([]);
                            setPendingFinalResults(results);
                            setShouldFinish(true);
                        } else {
                            setDeck((prev: any[]) => {
                                const [, ...rest] = prev;
                                return rest;
                            });
                        }
                    }} />
                </View>
            ) : (
                <View style={styles.actions}>
                    <Button title="Wrong 😕" onPress={() => markAnswer(false)} color="#d33" />
                    <Button title="Next" onPress={() => markAnswer(true)} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', flex: 1, padding: 16, alignItems: 'center' },
    header: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    actions: { flexDirection: 'row', gap: 65, marginTop: 55 },
    sub: { fontSize: 14, color: '#666', marginBottom: 12 }
});
