import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
    async function clearScores() {
        await AsyncStorage.removeItem('quiz_scores');
        Alert.alert('Done', 'Cleared saved quiz scores.');
    }

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 12 }}>
                <Button title="Clear saved quiz scores" color="#d33" onPress={clearScores} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 18, fontWeight: '600' }
});
