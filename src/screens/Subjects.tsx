import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { subjects } from '../data/cards';
import { useDeviceSize } from '../utils/device';

type Props = NativeStackScreenProps<RootStackParamList, 'Subjects'>;

export default function Subjects({ navigation }: Props) {
    const [selected, setSelected] = useState<string[]>([]);

    const { height } = useDeviceSize();

    function toggle(s: string) {
        setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Select a subject
            </Text>

            <View style={{ height: height/1.65, }}>
                <FlatList
                    data={subjects}
                    keyExtractor={(s) => s}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => toggle(item)} style={[styles.item, selected.includes(item) && styles.selected]}>
                            <Text>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.actions}>
                <Button title="Start Flashcards" onPress={() => navigation.navigate('Flashcards', { subjects: selected.length ? selected : 'All' })} />

                <Button title="Start Quiz" onPress={() => navigation.navigate('Quiz', { subjects: selected.length ? selected : 'All' })} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    item: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
    selected: { backgroundColor: '#eef' },
    actions: { gap: 15 }
});
