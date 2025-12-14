import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';
import FlashcardView from '../components/FlashcardView';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcards'>;

export default function Flashcards({ route }: Props) {
  const subjects = route?.params?.subjects ?? 'All';
  const pool = cardsForSubjects(subjects as any);
  const [index, setIndex] = useState(0);

  if (!pool.length) return <View style={styles.container}><Text>No cards found for that selection</Text></View>;

  const card = pool[index % pool.length];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Flashcards — {Array.isArray(subjects) ? subjects.join(', ') : 'All'}</Text>
      <FlashcardView card={card} onShowHint={() => Alert.alert('Hint', 'Hint: ' + (card.type === 'word' ? card.hint ?? 'Try to identify which formula fits the quantities in the problem.' : ''))} />
      <View style={styles.actions}>
        <Button title="Prev" onPress={() => setIndex((i) => Math.max(0, i - 1))} />
        <Button title="Next" onPress={() => setIndex((i) => i + 1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 }
});
