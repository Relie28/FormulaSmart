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
    byType?: Record<string, { correct: number; total: number; percent: number }>;
    trend?: number; // percent change recent - previous
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

            const map = new Map<string, { sessions: number; correct: number; total: number; byType: Record<string, { correct: number; total: number }>; percents: number[] }>();


            arr.forEach((r) => {
                const subjectKeys = Array.isArray(r.subjects) ? r.subjects : [r.subjects === 'All' ? (r.type === 'flashcard' ? 'Flashcard' : 'Quiz') : r.subjects];
                subjectKeys.forEach((s) => {
                    const key = s ?? 'Unknown';
                    const cur = map.get(key) ?? { sessions: 0, correct: 0, total: 0, byType: {}, percents: [] };
                    cur.sessions += 1;
                    cur.correct += r.score;
                    cur.total += r.total;
                    // per-type
                    if ((r as any).countsByType) {
                        Object.entries((r as any).countsByType).forEach(([t, v]) => {
                            const vv = v as { correct: number; total: number };
                            const prev = cur.byType[t] ?? { correct: 0, total: 0 };
                            prev.correct += vv.correct;
                            prev.total += vv.total;
                            cur.byType[t] = prev;
                        });
                    }
                    // store percent for trend
                    cur.percents.push(r.total > 0 ? Math.round((r.score / r.total) * 100) : 0);
                    map.set(key, cur);
                });
            });

            const list: SubjectStat[] = [];
            map.forEach((val, key) => {
                const byTypeStats: Record<string, { correct: number; total: number; percent: number }> = {};
                Object.entries(val.byType).forEach(([t, v]) => {
                    byTypeStats[t] = { correct: v.correct, total: v.total, percent: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0 };
                });

                // compute simple trend: compare avg of last 3 sessions to previous 3 if possible
                let trend = 0;
                if (val.percents.length >= 6) {
                    const recent = val.percents.slice(-3).reduce((a, b) => a + b, 0) / 3;
                    const prev = val.percents.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
                    trend = Math.round(recent - prev);
                } else if (val.percents.length >= 2) {
                    const recent = val.percents[val.percents.length - 1];
                    const first = val.percents[0];
                    trend = Math.round(recent - first);
                }

                const trendVal = typeof val.percents !== 'undefined' ? val.percents && val.percents.length ? val.percents : [] : [];
                list.push({
                    name: key,
                    sessions: val.sessions,
                    correct: val.correct,
                    total: val.total,
                    avgPercent: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
                    byType: byTypeStats,
                    trend: trend
                });
            });

            // sort by avgPercent ascending so weaknesses appear first
            list.sort((a, b) => a.avgPercent - b.avgPercent);
            setStats(list);
        })();
    }, []);

    return (
        <View style={styles.container}>
            {stats.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.title}>
                        No stats yet
                    </Text>
                </View>
            ) : (
                <FlatList data={stats} keyExtractor={(s) => s.name} renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.name}>
                            {item.name}
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>
                                {item.avgPercent}%
                            </Text>

                            {(() => {
                                const trend = item.trend ?? 0;
                                return (
                                    <Text style={{ color: trend > 0 ? '#0a0' : trend < 0 ? '#d33' : '#666' }}>
                                        {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : '—'}
                                    </Text>
                                );
                            })()}
                        </View>

                        <Text style={styles.detail}>{item.correct}/{item.total} across {item.sessions} sessions</Text>
                        {item.byType && Object.keys(item.byType).length > 0 && (
                            <View style={{ marginTop: 8 }}>
                                {Object.entries(item.byType).map(([t, v]) => (
                                    <Text key={t} style={{ color: '#333' }}>
                                        {t}: {v.percent}% ({v.correct}/{v.total})
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                )} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 90, textAlign: 'center', },
    row: { paddingBottom: 15, borderBottomWidth: 1, borderColor: '#eee' },
    name: { fontWeight: '600' },
    detail: { marginTop: 4, color: '#666' }
});
