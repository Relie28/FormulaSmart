import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>FormulaSmart</Text>
      <View style={styles.iconRow}>
        <Plus color="#3a3563" size={56} strokeWidth={1.5} />
        <Text style={styles.iconLabel}>Start solving</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  }
  ,
  iconRow: {
    marginTop: 18,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  iconLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333'
  }
});
