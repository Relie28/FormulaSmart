import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';
import FlashcardView from '../components/FlashcardView';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcards'>;

export default function Flashcards({ route, navigation }: Props) {
  const subjects = route?.params?.subjects ?? 'All';
  const pool = cardsForSubjects(subjects as any);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);

  if (!pool.length) return <View style={styles.container}><Text>No cards found for that selection</Text></View>;

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
      <Text style={styles.header}>Flashcards — {Array.isArray(subjects) ? subjects.join(', ') : 'All'}</Text>
      <Text style={styles.sub}>Progress: {index + 1}/{pool.length}</Text>
      <FlashcardView card={card} revealed={revealed} onReveal={() => setRevealed(true)} onShowHint={() => Alert.alert('Hint', 'Hint: ' + (card.type === 'word' ? card.hint ?? 'Try to identify which formula fits the quantities in the problem.' : ''))} />

      {!revealed ? (
        <View style={styles.actions}>
          <Text style={{ color: '#666' }}>Tap Reveal answer when ready. You cannot go back after revealing.</Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <Button title="I got it" onPress={() => markAnswer(true)} />
          <Button title="I missed it" onPress={() => markAnswer(false)} color="#d33" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 }
});
