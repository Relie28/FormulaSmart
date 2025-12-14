import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RecordItem = { id: string; subjects: string[] | 'All'; score: number; total: number; date: string; type?: 'quiz' | 'flashcard' };

export default function History() {
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    (async () => {
      const quizRaw = await AsyncStorage.getItem('quiz_scores');
      const flashRaw = await AsyncStorage.getItem('flashcard_sessions');
      const arr: RecordItem[] = [];
      if (quizRaw) {
        try {
          const q = JSON.parse(quizRaw) as RecordItem[];
          q.forEach((r) => arr.push({ ...r, type: 'quiz' }));
        } catch (e) { console.warn('Failed to parse quiz history', e); }
      }
      if (flashRaw) {
        try {
          const f = JSON.parse(flashRaw) as RecordItem[];
          f.forEach((r) => arr.push({ ...r, type: 'flashcard' }));
        } catch (e) { console.warn('Failed to parse flashcard history', e); }
      }
      // sort by date desc
      setRecords(arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      {records.length === 0 ? (
        <Text>No history yet.</Text>
      ) : (
        <FlatList data={records} keyExtractor={(s) => s.id} renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.subjects}>{Array.isArray(item.subjects) ? item.subjects.join(', ') : 'All'}</Text>
            <Text style={styles.score}>{item.score}/{item.total} <Text style={{ color: '#888' }}>({item.type})</Text></Text>
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
