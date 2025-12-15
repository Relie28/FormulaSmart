import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { View, Text, StyleSheet, Button } from 'react-native';
import React from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                FormulaSmart
            </Text>

            <View style={styles.buttons}>
                <Button title="Flashcards" onPress={() => navigation.navigate('Flashcards', { subjects: 'All' })} />
                <Button title="Take a Quiz" onPress={() => navigation.navigate('Quiz', { subjects: 'All' })} />
                <Button title="Choose Subjects" onPress={() => navigation.navigate('Subjects')} />
                <Button title="History" onPress={() => navigation.navigate('History')} />
                <Button title="Stats Overview" onPress={() => navigation.navigate('Stats')} />
                <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        marginBottom: 40,
        fontSize: 30,
        fontWeight: '800'
    },
    buttons: {
        marginTop: 24,
        width: '80%',
        gap: 12
    }
});
