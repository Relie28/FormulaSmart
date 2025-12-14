import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ScoreRecord = { id: string; subjects: string[] | 'All'; score: number; total: number; date: string; type?: 'quiz' | 'flashcard' };

export default function HighScores() {
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('quiz_scores').then((raw) => {
      if (!raw) return;
      try {
        const arr = JSON.parse(raw) as ScoreRecord[];
        // sort by score desc
        setScores(arr.sort((a, b) => b.score - a.score));
      } catch (e) {
        console.warn('Failed to parse scores', e);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>High Scores</Text>
      {scores.length === 0 ? (
        <Text>No scores yet — take a quiz to record results.</Text>
      ) : (
        <FlatList data={scores} keyExtractor={(s) => s.id} renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.subjects}>{Array.isArray(item.subjects) ? item.subjects.join(', ') : (item.subjects === 'All' ? (item.type === 'flashcard' ? 'Flashcard' : 'Quiz') : String(item.subjects))}</Text>
            <Text style={styles.score}>{item.score}/{item.total}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  subjects: { fontWeight: '600' },
  score: { marginTop: 4 },
  date: { marginTop: 4, color: '#666', fontSize: 12 }
});
