import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function Settings({ navigation }: Props) {
    async function clearScores() {
        await AsyncStorage.removeItem('quiz_scores');
        Alert.alert('Done', 'Cleared saved quiz scores.');
    }

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 12 }}>
                <Button title="Clear saved quiz scores" color="#d33" onPress={clearScores} />
            </View>
            <View style={{ marginTop: 12 }}>
                <Button title="View debug logs" onPress={() => navigation.navigate('DebugLogs')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 18, fontWeight: '600' }
});
