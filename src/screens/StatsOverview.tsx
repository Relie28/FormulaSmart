import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RecordItem = { id: string; subjects: string[] | 'All'; score: number; total: number; date: string; type?: 'quiz' | 'flashcard' };

type SubjectStat = {
  name: string;
  sessions: number;
  correct: number;
  total: number;
  avgPercent: number;
};

export default function StatsOverview() {
  const [stats, setStats] = useState<SubjectStat[]>([]);

  useEffect(() => {
    (async () => {
      const quizRaw = await AsyncStorage.getItem('quiz_scores');
      const flashRaw = await AsyncStorage.getItem('flashcard_sessions');
      const arr: RecordItem[] = [];
      if (quizRaw) {
        try { (JSON.parse(quizRaw) as RecordItem[]).forEach((r) => arr.push({ ...r, type: 'quiz' })); } catch (e) { console.warn(e); }
      }
      if (flashRaw) {
        try { (JSON.parse(flashRaw) as RecordItem[]).forEach((r) => arr.push({ ...r, type: 'flashcard' })); } catch (e) { console.warn(e); }
      }

      const map = new Map<string, { sessions: number; correct: number; total: number }>();

      arr.forEach((r) => {
        const subjectKeys = Array.isArray(r.subjects) ? r.subjects : [r.subjects === 'All' ? (r.type === 'flashcard' ? 'Flashcard' : 'Quiz') : r.subjects];
        subjectKeys.forEach((s) => {
          const key = s ?? 'Unknown';
          const cur = map.get(key) ?? { sessions: 0, correct: 0, total: 0 };
          cur.sessions += 1;
          cur.correct += r.score;
          cur.total += r.total;
          map.set(key, cur);
        });
      });

      const list: SubjectStat[] = [];
      map.forEach((val, key) => {
        list.push({
          name: key,
          sessions: val.sessions,
          correct: val.correct,
          total: val.total,
          avgPercent: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
        });
      });

      // sort by avgPercent ascending so weaknesses appear first
      list.sort((a, b) => a.avgPercent - b.avgPercent);
      setStats(list);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Overview</Text>
      {stats.length === 0 ? (
        <Text>No stats yet — take quizzes or use flashcards to build stats.</Text>
      ) : (
        <FlatList data={stats} keyExtractor={(s) => s.name} renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>{item.avgPercent}% — {item.correct}/{item.total} across {item.sessions} sessions</Text>
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
  name: { fontWeight: '700' },
  detail: { marginTop: 4, color: '#666' }
});
