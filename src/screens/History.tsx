import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';

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
            {records.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.title}>
                        No history yet
                    </Text>
                </View>
            ) : (
                <FlatList data={records} keyExtractor={(s) => s.id} renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <Text style={styles.subjects}>
                                {Array.isArray(item.subjects) ? item.subjects.join(', ') : (item.subjects === 'All' ? (item.type === 'flashcard' ? 'Flashcard' : 'Quiz') : String(item.subjects))}
                            </Text>

                            <Text style={{ color: '#888', }}>
                                ({item.type})
                            </Text>
                        </View>

                        <Text style={styles.score}>
                            Final score: {item.score}/{item.total}
                        </Text>


                        <Text style={styles.date}>
                            {new Date(item.date).toLocaleString()}
                        </Text>
                    </View>
                )} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 90 },
    row: { paddingBottom: 15, borderBottomWidth: 1, borderColor: '#eee' },
    subjects: { fontWeight: '600', marginRight: 5, },
    score: { marginTop: 4, marginRight: 5, },
    date: { marginTop: 4, color: '#666', fontSize: 12 }
});
