import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { cards, cardsForSubjects } from '../data/cards';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

function shuffle<T>(arr: T[]) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function Quiz({ route }: Props) {
  const subjects = route?.params?.subjects ?? 'All';
  const pool = useMemo(() => shuffle(cardsForSubjects(subjects as any)), [subjects]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

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
    if (card.type === 'word' && !correct) {
      Alert.alert('Hint', card.hint ?? 'Try to match quantities to a formula');
    }
    const next = index + 1;
    if (next >= pool.length) {
      Alert.alert('Quiz finished', `Score: ${correct ? score + 1 : score}/${pool.length}`);
      setIndex(0);
      setScore(0);
    } else setIndex(next);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quiz — {Array.isArray(subjects) ? subjects.join(', ') : 'All'}</Text>
      <Text style={styles.prompt}>{card.prompt}</Text>
      {choices.map((c) => (
        <TouchableOpacity key={c} style={styles.choice} onPress={() => choose(c)}>
          <Text>{c}</Text>
        </TouchableOpacity>
      ))}
      <View style={{ marginTop: 18 }}>
        <Text>Score: {score}</Text>
        <Button title="Reset" onPress={() => { setIndex(0); setScore(0); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  prompt: { fontSize: 16, marginVertical: 12 },
  choice: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 }
});
