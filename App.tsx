import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // Global error handler to capture unexpected native/host errors and make
  // it easy to copy/paste stack traces when they occur in the running app.
    React.useEffect(() => {
    const globalHandler = (error: any, isFatal?: boolean) => {
      try {
        // Log to console (Metro / device logs)
        console.error('GlobalErrorHandler:', error, 'isFatal:', isFatal);
        // Persist to storage for post-mortem debugging
        (async () => {
          try {
            const raw = await AsyncStorage.getItem('flashcards_debug');
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ at: new Date().toISOString(), msg: `GlobalErrorHandler: ${String(error && (error.stack || error.message || error))}`, isFatal: !!isFatal });
            await AsyncStorage.setItem('flashcards_debug', JSON.stringify(arr));
          } catch (e) { /* ignore */ }
        })();
        // Show a simple alert so users can copy the error message/stack
        Alert.alert('Unexpected error', String(error && (error.stack || error.message || error)), [{ text: 'OK' }]);
      } catch (e) {
        // swallow
      }
      // If RN ErrorUtils exists, delegate to default handler as well
      try {
        // @ts-ignore
        const defaultHandler = global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
        if (defaultHandler) defaultHandler(error, isFatal);
      } catch (e) {
        // ignore
      }
    };

    // Install into RN global error handling
    // @ts-ignore
    if (global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === 'function') {
      // @ts-ignore
      global.ErrorUtils.setGlobalHandler(globalHandler);
    }
  }, []);
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
