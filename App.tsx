import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
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
