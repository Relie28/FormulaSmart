import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Plus } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Plus color="#3a3563" size={64} />
      <Text style={styles.title}>FormulaSmart Flashcards</Text>
      <View style={styles.buttons}>
        <Button title="Choose Subjects" onPress={() => navigation.navigate('Subjects')} />
        <Button title="All Flashcards" onPress={() => navigation.navigate('Flashcards', { subjects: 'All' })} />
        <Button title="Take a Quiz" onPress={() => navigation.navigate('Quiz', { subjects: 'All' })} />
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
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600'
  },
  buttons: {
    marginTop: 24,
    width: '80%',
    gap: 12
  }
});
