import React from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'DebugLogs'>;

export default function DebugLogs({ navigation }: Props) {
    const [logs, setLogs] = React.useState<any[] | null>(null);

    React.useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const raw = await AsyncStorage.getItem('flashcards_debug');
            const arr = raw ? JSON.parse(raw) : [];
            setLogs(arr.reverse());
        } catch (e) {
            Alert.alert('Failed to load logs', String(e));
        }
    }

    async function clearLogs() {
        try {
            await AsyncStorage.removeItem('flashcards_debug');
            setLogs([]);
            Alert.alert('Logs cleared');
        } catch (e) {
            Alert.alert('Failed to clear logs', String(e));
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.actions}>
                <Button title="Reload" onPress={load} />
                <Button title="Clear" color="#d33" onPress={() => {
                    Alert.alert('Clear logs?', 'Are you sure you want to clear debug logs?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear', style: 'destructive', onPress: clearLogs }
                    ]);
                }} />
            </View>
            <ScrollView style={styles.scroll}>
                {(!logs || logs.length === 0) ? (
                    <Text style={styles.empty}>No logs</Text>
                ) : logs.map((l, i) => (
                    <View key={i} style={styles.logRow}>
                        <Text style={styles.logTime}>{l.at}</Text>
                        <Text style={styles.logMsg}>{String(l.msg)}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    actions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    scroll: { flex: 1 },
    empty: { color: '#666' },
    logRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
    logTime: { color: '#999', fontSize: 12 },
    logMsg: { color: '#222' }
});
